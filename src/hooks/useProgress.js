import { useState, useCallback, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';
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

// Une el progreso local con el de la nube. Gana el que tenga MÁS sesiones
// registradas (el padre arranca con 0 locales → obtiene la nube; la niña con
// su historial local fresco no es pisada por un snapshot desactualizado).
function mergeProgress(local, cloud) {
  if (!cloud || typeof cloud !== 'object') return local;
  const c = (cloud.sessionHistory || []).length;
  const l = local && local.sessionHistory ? local.sessionHistory.length : 0;
  return c > l ? { ...DEFAULT_PROGRESS, ...cloud } : local;
}

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

// Clave de almacenamiento POR ESTUDIANTE. Los estudiantes de la nube usan su
// id; el modo demo/local mantiene la clave global 'progress' (compatibilidad).
function getProgressKey(studentId) {
  return studentId && !String(studentId).startsWith('local-') ? `progress:${studentId}` : 'progress';
}

const SYNC_QUEUE_KEY = 'syncQueue';

function enqueueSync(item) {
  const q = getStorage(SYNC_QUEUE_KEY, []);
  q.push(item);
  setStorage(SYNC_QUEUE_KEY, q.slice(-200));
}

function setSyncQueue(items) {
  setStorage(SYNC_QUEUE_KEY, items);
}

// Hook de progreso del estudiante.
// - localStorage es la fuente local (caché/fallback, modo demo intacto), ahora
//   SEPARADA por estudiante (antes una clave global compartida entre hijos).
// - Si hay nube Y el estudiante activo tiene id de la nube, cada sesión se
//   inserta en `sessions` (con subject_id/level_id), se recalcula la boleta,
//   se sube el snapshot completo del progreso y cada 5 sesiones la IA analiza.
// - Sin red: la sesión se encola y se reintenta automáticamente al volver.
export function useProgress(studentId, profile = {}) {
  const storageKey = getProgressKey(studentId);
  const useCloud = isCloudConfigured && studentId && !String(studentId).startsWith('local-');

  const [progress, setProgress] = useState(() => getStorage(storageKey, DEFAULT_PROGRESS));

  // ---- Cargar el progreso correcto al cambiar de estudiante + migración
  // de la antigua clave global 'progress' a la clave por estudiante.
  useEffect(() => {
    const stored = getStorage(storageKey, null);
    if (stored) {
      setProgress(stored);
      return;
    }
    if (storageKey !== 'progress') {
      const legacy = getStorage('progress', null);
      if (legacy && legacy.sessionHistory && legacy.sessionHistory.length > 0) {
        setStorage(storageKey, legacy);
        setProgress(legacy);
        return;
      }
    }
    setProgress(DEFAULT_PROGRESS);
  }, [storageKey]);

  // ---- Efectos en la nube (nunca bloquean ni rompen lo local)
  // Devuelve true si todo se subió, false si falló (para encolar y reintentar).
  const syncToCloud = useCallback(
    async (subjectId, levelId, score, timeMinutes, extras, nextProgress, skipAi = false) => {
      const now = new Date();
      try {
        // Insert vía RPC security-definer: el teléfono del niño usa la key anon
        // (sin JWT) y la RLS de `sessions` bloquea el INSERT directo; la RPC
        // corre como owner y sí puede escribir, igual que save_student_progress.
        const { error: sessionErr } = await supabase.rpc('insert_student_session', {
          p_student_id: studentId,
          p_lesson_id: extras.lessonUuid || null,
          p_subject_id: subjectId,
          p_level_id: levelId,
          p_started_at: new Date(now.getTime() - timeMinutes * 60000).toISOString(),
          p_ended_at: now.toISOString(),
          p_time_minutes: timeMinutes,
          p_score: score,
          p_answers: extras.answers || [],
          p_emotion: extras.emotion || null,
          p_is_exam: extras.isExam || false,
        });
        if (sessionErr) throw sessionErr;

        // Recalcular boleta del período con todo el historial
        upsertGrades(studentId, nextProgress.sessionHistory);

        // Subir el snapshot completo del progreso a la nube (students.progress)
        const { error: progErr } = await supabase.rpc('save_student_progress', {
          sid: studentId,
          p: nextProgress,
        });
        if (progErr) throw progErr;

        // Análisis de IA cada 5 sesiones nuevas (solo en el flujo normal,
        // no al reintentar la cola, para no duplicar insights).
        if (!skipAi && isTutorConfigured && nextProgress.sessionHistory.length % 5 === 0) {
          const recentAnswers = nextProgress.sessionHistory
            .slice(-5)
            .flatMap((s) => (s.answers || []).map((a) => ({ materia: s.subjectId, ...a })));
          if (recentAnswers.length > 0) {
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
        }
        return true;
      } catch {
        return false;
      }
    },
    [studentId, profile]
  );

  // Reintenta las sesiones pendientes de la cola offline (fire-and-forget).
  const flushSyncQueue = useCallback(async () => {
    const q = getStorage(SYNC_QUEUE_KEY, []);
    if (q.length === 0) return;
    const remaining = [];
    for (const item of q) {
      const ok = await syncToCloud(item.subjectId, item.levelId, item.score, item.timeMinutes, item.extras, item.nextProgress, true);
      if (!ok) remaining.push(item);
    }
    setSyncQueue(remaining);
  }, [syncToCloud]);

  // Al volver a tener conexión, reintentar lo pendiente. También al montar.
  useEffect(() => {
    if (!useCloud) return;
    const onOnline = () => flushSyncQueue();
    window.addEventListener('online', onOnline);
    flushSyncQueue();
    return () => window.removeEventListener('online', onOnline);
  }, [useCloud, flushSyncQueue]);

  // extras (opcional): { answers: [{q, selected, correct}], emotion, lessonUuid, isExam }
  // Lee el estado desde localStorage (siempre fresco) para no hacer efectos
  // dentro del updater de React (evita inserts duplicados con StrictMode).
  const recordSession = useCallback(
    (subjectId, levelId, score, timeMinutes, extras = {}) => {
      const isExam = !!extras.isExam;
      const prev = getStorage(storageKey, DEFAULT_PROGRESS);
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
      // Los exámenes miden retención: NO suben de nivel, solo dan estrellas.
      if (score >= 60 && !isExam) {
        subjectProg[subjectId][levelId] = Math.min(current + 1, 10);
      }

      const stars = Math.floor(score / 20); // 0-5 stars per session
      const history = [
        ...prev.sessionHistory,
        { date: Date.now(), subjectId, levelId, score, stars, timeMinutes, answers: extras.answers || [], isExam },
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

      setStorage(storageKey, next);
      setProgress(next);

      // Nube: registrar sesión + notas + snapshot (sin red → encolar y reintentar)
      if (useCloud) {
        const item = { subjectId, levelId, score, timeMinutes, extras, nextProgress: next };
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
        if (offline) {
          enqueueSync(item);
        } else {
          syncToCloud(subjectId, levelId, score, timeMinutes, extras, next).then((ok) => {
            if (!ok) enqueueSync(item);
          });
        }
      }
    },
    [useCloud, syncToCloud, storageKey]
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

  // ---- Sincronización del progreso en la nube (carga + tiempo real)
  // Carga students.progress al montar (o al cambiar de estudiante) y se
  // suscribe a cambios en vivo, de modo que el panel del padre refleje el
  // avance de la niña sin recargar la página.
  useEffect(() => {
    if (!useCloud || !studentId) return;

    let cancelled = false;

    supabase
      .from('students')
      .select('progress')
      .eq('id', studentId)
      .single()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setProgress((current) => mergeProgress(current, data.progress));
      });

    const channel = supabase
      .channel(`student-progress-${studentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${studentId}` },
        (payload) => {
          const cloud = payload.new && payload.new.progress;
          if (!cloud) return;
          setProgress((current) => mergeProgress(current, cloud));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [useCloud, studentId]);

  return {
    progress,
    recordSession,
    getNextRecommendation,
    getSubjectProgress,
    getLevelProgress,
    achievements: ACHIEVEMENTS,
    resetProgress: useCallback(() => {
      setStorage(storageKey, DEFAULT_PROGRESS);
      removeStorage('progress'); // limpia la clave global legacy
      setSyncQueue([]);
      setProgress(DEFAULT_PROGRESS);
      if (useCloud) {
        supabase.rpc('save_student_progress', { sid: studentId, p: null }).then(() => {});
      }
    }, [storageKey, useCloud, studentId]),
  };
}
