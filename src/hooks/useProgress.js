import { useState, useCallback } from 'react';
import { getStorage, setStorage } from '../utils/storage';

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

export function useProgress() {
  const [progress, setProgress] = useState(() => getStorage('progress', DEFAULT_PROGRESS));

  const updateProgress = useCallback((updater) => {
    setProgress((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setStorage('progress', next);
      return next;
    });
  }, []);

  const recordSession = useCallback((subjectId, levelId, score, timeMinutes) => {
    updateProgress((prev) => {
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
        { date: Date.now(), subjectId, levelId, score, stars, timeMinutes },
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

      return next;
    });
  }, [updateProgress]);

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
