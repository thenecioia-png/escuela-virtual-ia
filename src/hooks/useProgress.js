import { useState, useCallback } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { supabase, isCloudConfigured } from '../lib/supabase';
import { upsertGrades } from '../lib/grades';
import { isTutorConfigured, analyzeProgress } from '../lib/tutorApi';
import { getCountry, getGrade } from '../lib/curricula';

const DEFAULT_PROGRESS = {
  subjectProgress: {}, // { math: { sumas_restas: 2, multiplicacion: 0, ... }, ... }
  totalStars: 0,
  streakDays: 0,
  lastStudyDate: null,
  sessionHistory: [],
  achievements: [],
  timeSpentMinutes: 0,
  answers: { correct: 0, incorrect: 0 },
};

const ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'Primera Lección', icon: '🌱', condition: (p) => p.sessionHistory.length >= 1 },
  { id: 'streak_3', name: 'Racha de 3 días', icon: '🔥', condition: (p) => p.streakDays >= 3 },
  { id: 'streak_7', name: 'Racha de 7 días', icon: '⭐', condition: (p) => p.streakDays >= 7 },
  { id: 'perfect_lesson', name: 'Lección Perfecta', icon: '💯', condition: (p) => p.sessionHistory.some((s) => s.score === 100) },
  { id: 'explorer', name: 'Explorador', icon: '🗺️', condition: (p) => Object.keys(p.subjectProgress).length >= 3 },
  { id: 'math_wizard', name: 'Mago de las Mates', icon: '🔢', condition: (p) => (p.subjectProgress.math?.sumas_restas || 0) >= 2 },
  { id: 'bookworm', name: 'Ratón de Biblioteca', icon: '📚', condition: (p) => (p.subjectProgress.reading?.silabas || 0) >= 1 },
  { id: 'scientist', name: 'Científico', icon: '🔬', condition: (p) => (p.subjectProgress.science?.seres_vivos || 0) >= 1 },
  { id: 'empathetic', name: 'Corazón Grande', icon: '❤️', condition: (p) => (p.subjectProgress.emotions?.identificar || 0) >= 1 },
  { id: '50_stars', name: 'Coleccionista de Estrellas', icon: '✨', condition: (p) => p.totalStars >= 50 },
];

// Hook de progreso del estudiante.
// - localStorage sigue siendo la fuente local (caché/fallback, modo demo intacto).
// - Si hay nube Y el estudiante activo tiene id de la nube, cada sesión se
//   inserta en `sessions`, se recalculan las notas (`grades_record`) y cada
//   5 sesiones la IA analiza las respuestas (`ai_insights`).
export function useProgress(studentId, profile = {}) {
  const [progress, setProgress] = useState(() => getStorage('progress', DEFAULT_PROGRESS));
  const useCloud = isCloudConfigured && studentId && !String(studentId).startsWith('local-');

  // ---- Efectos en la nube (fire-and-forget: nunca bloquean ni rompen lo local)
  const syncToCloud = useCallback(
    (subjectId, score, timeMinutes, extras, nextProgress) => {
      const now = new Date();
      supabase
        .from('sessions')
        .insert({
          student_id: studentId,
          lesson_id: extras.lessonUuid || null,
          started_at: new Date(now.getTime() - timeMinutes * 60000).toISOString(),
          ended_at: now.toISOString(),
          time_minutes: timeMinutes,
          score,
          answers: extras.answers || [],
          emotion: extras.emotion || null,
        })
        .then(() => {});

      // Recalcular boleta del período con todo el historial
      upsertGrades(studentId, nextProgress.sessionHistory);

      // Análisis de IA cada 5 sesiones nuevas
      if (isTutorConfigured && nextProgress.sessionHistory.length % 5 === 0) {
        const recentAnswers = nextProgress.sessionHistory
          .slice(-5)
          .flatMap((s) => (s.answers || []).map((a) => ({ materia: s.subjectId, ...a })));
        if (recentAnswers.length === 0) return;
        analyzeProgress({
          country: getCountry(profile.countryCode)?.name,
          grade: getGrade(profile.countryCode, profile.gradeId)?.label,
          age: profile.age,
          subject: subjectId,
          answers: recentAnswers,
        }).then((result) => {
          if (!result) return;
          supabase
            .from('ai_insights')
            .insert({
              student_id: studentId,
              strengths: result.fortalezas || [],
              weaknesses: result.debilidades || [],
              focus_suggestion: result.foco_sugerido || null,
            })
            .then(() => {});
        });
      }
    },
    [studentId, profile]
  );

  // extras (opcional): { answers: [{q, selected, correct}], emotion, lessonUuid }
  // Lee el estado desde localStorage (siempre fresco) para no hacer efectos
  // dentro del updater de React (evita inserts duplicados con StrictMode).
  const recordSession = useCallback(
    (subjectId, levelId, score, timeMinutes, extras = {}) => {
      const prev = getStorage('progress', DEFAULT_PROGRESS);
      const today = new Date().toDateString();
      const lastDate = prev.lastStudyDate ? new Date(prev.lastStudyDate).toDateString() : null;
      let streak = prev.streakDays;
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          streak += 1;
        } else if (lastDate !== today) {
          streak = 1;
        }
      }

      const subjectProg = { ...prev.subjectProgress };
      if (!subjectProg[subjectId]) subjectProg[subjectId] = {};
      const current = subjectProg[subjectId][levelId] || 0;
      if (score >= 60) {
        subjectProg[subjectId][levelId] = Math.min(current + 1, 10);
      }

      const stars = Math.floor(score / 20); // 0-5 stars per session
      const history = [
        ...prev.sessionHistory,
        { date: Date.now(), subjectId, levelId, score, stars, timeMinutes, answers: extras.answers || [] },
      ].slice(-100);

      const correct = prev.answers.correct + (score > 0 ? Math.round((score / 100) * 5) : 0);
      const incorrect = prev.answers.incorrect + (score < 100 ? Math.round(((100 - score) / 100) * 5) : 0);

      const next = {
        ...prev,
        subjectProgress: subjectProg,
        totalStars: prev.totalStars + stars,
        streakDays: streak,
        lastStudyDate: Date.now(),
        sessionHistory: history,
        timeSpentMinutes: prev.timeSpentMinutes + timeMinutes,
        answers: { correct, incorrect },
      };

      // Check achievements
      const unlocked = ACHIEVEMENTS.filter((a) => a.condition(next) && !prev.achievements.includes(a.id)).map((a) => a.id);
      if (unlocked.length > 0) {
        next.achievements = [...prev.achievements, ...unlocked];
      }

      setStorage('progress', next);
      setProgress(next);

      // Nube: registrar sesión + notas + análisis (no bloquea la UI)
      if (useCloud) {
        try {
          syncToCloud(subjectId, score, timeMinutes, extras, next);
        } catch {
          // sin red o error de nube → el registro local ya quedó
        }
      }
    },
    [useCloud, syncToCloud]
  );

  const getNextRecommendation = useCallback((profile) => {
    const { subjectProgress } = progress;
    const recs = [];

    // Find weakest subject
    const subjects = ['math', 'reading', 'logic', 'science', 'emotions'];
    subjects.forEach((sid) => {
      const levels = subjectProgress[sid] || {};
      const total = Object.values(levels).reduce((a, b) => a + b, 0);
      const max = 5; // approximate max levels per subject
      recs.push({ subjectId: sid, completion: total / max });
    });

    recs.sort((a, b) => a.completion - b.completion);
    return recs[0]?.subjectId || 'math';
  }, [progress]);

  const getSubjectProgress = useCallback((subjectId) => {
    return progress.subjectProgress[subjectId] || {};
  }, [progress]);

  const getLevelProgress = useCallback((subjectId, levelId) => {
    return progress.subjectProgress[subjectId]?.[levelId] || 0;
  }, [progress]);

  return {
    progress,
    recordSession,
    getNextRecommendation,
    getSubjectProgress,
    getLevelProgress,
    achievements: ACHIEVEMENTS,
    resetProgress: useCallback(() => {
      setStorage('progress', DEFAULT_PROGRESS);
      setProgress(DEFAULT_PROGRESS);
    }, []),
  };
}
