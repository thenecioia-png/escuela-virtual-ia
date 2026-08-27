// Exámenes de repaso (retención).
// No usan IA en tiempo real: muestrean preguntas de las lecciones que el
// estudiante YA practicó, para medir cuánto recuerda. Se disparan cada 5
// sesiones normales (ver Dashboard).

import { LESSONS } from '../data/lessons';
import { SUBJECTS } from '../data/subjects';

const MAX_QUESTIONS = 6;
const MIN_QUESTIONS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Variante de la lección según el estilo de aprendizaje del estudiante.
function itemsForStyle(lesson, learningStyle) {
  const variant = lesson[learningStyle] || lesson.visual;
  return variant?.items || [];
}

// Pares subjectId|levelId que el estudiante ya practicó (sesiones normales).
function practicedPairs(sessionHistory) {
  const map = new Map();
  (sessionHistory || []).forEach((s) => {
    if (!s.subjectId || !s.levelId || s.isExam) return;
    map.set(`${s.subjectId}|${s.levelId}`, { subjectId: s.subjectId, levelId: s.levelId });
  });
  return [...map.values()];
}

// Construye un examen con preguntas barajadas de lo ya visto.
export function buildExam(profile, progress) {
  const learningStyle = profile.learningStyle || 'visual';
  const pairs = practicedPairs(progress.sessionHistory);

  let pool = [];
  pairs.forEach(({ subjectId, levelId }) => {
    const levelLessons = LESSONS[subjectId]?.[levelId] || [];
    levelLessons.forEach((lesson) => {
      itemsForStyle(lesson, learningStyle).forEach((item) => {
        pool.push({ ...item, subjectId, levelId });
      });
    });
  });

  // Fallback: si aún no practicó lo suficiente, usar el primer nivel de cada materia.
  if (pool.length < MIN_QUESTIONS) {
    SUBJECTS.forEach((subject) => {
      const levelId = subject.levels[0];
      const levelLessons = LESSONS[subject.id]?.[levelId] || [];
      levelLessons.slice(0, 1).forEach((lesson) => {
        itemsForStyle(lesson, learningStyle).forEach((item) => {
          pool.push({ ...item, subjectId: subject.id, levelId });
        });
      });
    });
  }

  // Quitar duplicados (misma pregunta en distintos niveles/variantes).
  const unique = [];
  const seen = new Set();
  pool.forEach((q) => {
    const key = `${q.subjectId}|${q.q}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  });

  return shuffle(unique).slice(0, MAX_QUESTIONS);
}

// Materia principal del examen (la más frecuente), para registrarla en la sesión.
export function examPrimarySubject(questions) {
  const counts = {};
  questions.forEach((q) => {
    counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
  });
  let best = null;
  let bestCount = -1;
  Object.entries(counts).forEach(([sid, c]) => {
    if (c > bestCount) {
      bestCount = c;
      best = sid;
    }
  });
  return best || 'math';
}
