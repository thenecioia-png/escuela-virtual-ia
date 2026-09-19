// Mapa de dominio por habilidad (skill mastery) — Matemáticas.
// Descompone la materia en habilidades granulares ordenadas por prerequisito.
// Cada intento de ejercicio se registra por habilidad (aciertos, errores, tiempo)
// y se persiste en localStorage siguiendo el patrón de utils/storage.js.
// Todo funciona SIN backend: el mapa vive en localStorage por estudiante.

import { getStorage, setStorage } from '../utils/storage';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Opciones de respuesta múltiple: la correcta + 3 distractores cercanos.
function mcq(correct, spread = 3) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const delta = rand(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const cand = correct + delta;
    if (cand >= 0 && cand !== correct) options.add(cand);
  }
  const shuffled = [...options].sort(() => Math.random() - 0.5).map(String);
  return { options: shuffled, answer: String(correct) };
}

function subQuestion(minA, maxA, borrow) {
  // borrow=true fuerza resta "llevando" (unidades del menor > unidades del mayor)
  let a = rand(minA, maxA);
  let b = rand(2, a - 1);
  if (borrow) {
    let tries = 0;
    while (a % 10 >= b % 10 && tries < 30) {
      a = rand(minA, maxA);
      b = rand(2, a - 1);
      tries++;
    }
    if (a % 10 >= b % 10) b = (a % 10) + rand(1, 9 - (a % 10)); // fuerza el préstamo
    if (b >= a) b = a - 1;
  } else {
    let tries = 0;
    while (a % 10 < b % 10 && tries < 30) {
      b = rand(2, a - 1);
      tries++;
    }
    if (a % 10 < b % 10) b = a % 10; // sin llevar: b termina en algo ≤ unidades de a
  }
  const result = a - b;
  return {
    q: `${a} - ${b} = ?`,
    ...mcq(result, 4),
    explanation: `${a} - ${b} = ${result}. ${borrow ? 'Como arriba hay menos unidades, pedimos prestada una decena.' : 'Resta las unidades y luego las decenas.'}`,
  };
}

function mulQuestion(tables) {
  const t = tables[rand(0, tables.length - 1)];
  const n = rand(1, 10);
  const result = t * n;
  return {
    q: `${t} × ${n} = ?`,
    ...mcq(result, Math.max(4, t)),
    explanation: `${t} × ${n} = ${result}. La tabla del ${t} va de ${t} en ${t}.`,
  };
}

export const MATH_SKILLS = [
  {
    id: 'conteo',
    name: 'Conteo y números hasta 20',
    emoji: '🔢',
    prereq: [],
    gen: () => {
      const n = rand(3, 18);
      return {
        q: `¿Qué número va justo después de ${n}?`,
        ...mcq(n + 1, 3),
        explanation: `Después de ${n} viene ${n + 1}. Cuenta: ${n}, ${n + 1}...`,
      };
    },
  },
  {
    id: 'suma_basica',
    name: 'Sumas hasta 20',
    emoji: '➕',
    prereq: ['conteo'],
    gen: () => {
      const a = rand(2, 12);
      const b = rand(2, 20 - a);
      return {
        q: `${a} + ${b} = ?`,
        ...mcq(a + b, 3),
        explanation: `${a} + ${b} = ${a + b}. Puedes contar desde ${a}: ${a + 1}... hasta llegar a ${a + b}.`,
      };
    },
  },
  {
    id: 'resta_sin_llevar',
    name: 'Restas sin llevar',
    emoji: '➖',
    prereq: ['suma_basica'],
    gen: () => subQuestion(10, 99, false),
  },
  {
    id: 'resta_llevando',
    name: 'Restas llevando (con préstamo)',
    emoji: '🧮',
    prereq: ['resta_sin_llevar'],
    gen: () => subQuestion(21, 99, true),
  },
  {
    id: 'tablas_2_5_10',
    name: 'Tablas del 2, 5 y 10',
    emoji: '✖️',
    prereq: ['suma_basica'],
    gen: () => mulQuestion([2, 5, 10]),
  },
  {
    id: 'tablas_3_4_6',
    name: 'Tablas del 3, 4 y 6',
    emoji: '🌟',
    prereq: ['tablas_2_5_10'],
    gen: () => mulQuestion([3, 4, 6]),
  },
  {
    id: 'tablas_7_8_9',
    name: 'Tablas del 7, 8 y 9',
    emoji: '🚀',
    prereq: ['tablas_3_4_6'],
    gen: () => mulQuestion([7, 8, 9]),
  },
  {
    id: 'multi_2_digitos',
    name: 'Multiplicación de 2 dígitos',
    emoji: '🏔️',
    prereq: ['tablas_7_8_9'],
    gen: () => {
      const a = rand(11, 25);
      const b = rand(2, 9);
      const result = a * b;
      return {
        q: `${a} × ${b} = ?`,
        ...mcq(result, Math.max(6, b * 2)),
        explanation: `${a} × ${b} = ${result}. Divide: ${a} × ${b} = (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`,
      };
    },
  },
  {
    id: 'division_basica',
    name: 'Divisiones exactas',
    emoji: '🍰',
    prereq: ['tablas_3_4_6'],
    gen: () => {
      const b = [2, 3, 4, 5, 6, 10][rand(0, 5)];
      const result = rand(2, 9);
      const a = b * result;
      return {
        q: `${a} ÷ ${b} = ?`,
        ...mcq(result, 3),
        explanation: `${a} ÷ ${b} = ${result}, porque ${b} × ${result} = ${a}.`,
      };
    },
  },
];

export const getSkill = (id) => MATH_SKILLS.find((s) => s.id === id) || null;

// ---- Persistencia (misma convención que useProgress: clave por estudiante) ----
function getSkillKey(studentId) {
  return studentId && !String(studentId).startsWith('local-') ? `skillmap:${studentId}` : 'skillmap';
}

export function loadSkillMap(studentId) {
  return getStorage(getSkillKey(studentId), {});
}

function saveSkillMap(studentId, map) {
  setStorage(getSkillKey(studentId), map);
}

// Registra un intento: { correct, q, wrong, answer, ms }
export function recordAttempt(studentId, skillId, { correct, q, wrong, answer, ms = 0 }) {
  if (!skillId) return;
  const map = loadSkillMap(studentId);
  const prev = map[skillId] || { attempts: 0, correct: 0, totalMs: 0, recentErrors: [], lastPracticed: null };
  const recentErrors = correct
    ? prev.recentErrors
    : [{ q, wrong, answer, date: Date.now() }, ...prev.recentErrors].slice(0, 10);
  map[skillId] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    totalMs: prev.totalMs + ms,
    recentErrors,
    lastPracticed: Date.now(),
  };
  saveSkillMap(studentId, map);
  return map[skillId];
}

// ---- Estado de dominio ----
// dominada: ≥4 intentos y ≥80% de acierto
// necesita_ayuda: ≥3 intentos y <60% de acierto
// en_progreso: el resto con datos; sin_datos: nunca practicada
export function skillStatus(stat) {
  if (!stat || stat.attempts === 0) return 'sin_datos';
  const acc = stat.correct / stat.attempts;
  if (stat.attempts >= 4 && acc >= 0.8) return 'dominada';
  if (stat.attempts >= 3 && acc < 0.6) return 'necesita_ayuda';
  return 'en_progreso';
}

export function accuracy(stat) {
  if (!stat || stat.attempts === 0) return null;
  return Math.round((stat.correct / stat.attempts) * 100);
}

// Estado completo del camino: dominadas, actual (la primera desbloqueada no
// dominada) y bloqueadas. La práctica diaria prioriza la habilidad actual.
// Si una habilidad posterior ya tiene datos, las anteriores sin datos se
// consideran dominadas implícitamente (demostró saber más adelante).
export function getSkillPathState(studentId) {
  const map = loadSkillMap(studentId);
  const statuses = {};
  // Último índice con datos (attempts > 0)
  let lastWithData = -1;
  MATH_SKILLS.forEach((s, i) => {
    if ((map[s.id]?.attempts || 0) > 0) lastWithData = i;
  });
  MATH_SKILLS.forEach((s, i) => {
    const raw = skillStatus(map[s.id]);
    statuses[s.id] = raw === 'sin_datos' && i < lastWithData ? 'dominada' : raw;
  });
  const isUnlocked = (skill) => skill.prereq.every((p) => statuses[p] === 'dominada');
  const current = MATH_SKILLS.find((s) => isUnlocked(s) && statuses[s.id] !== 'dominada') || null;
  const mastered = MATH_SKILLS.filter((s) => statuses[s.id] === 'dominada');
  const locked = MATH_SKILLS.filter((s) => !isUnlocked(s) && statuses[s.id] !== 'dominada' && s !== current);
  const weak = MATH_SKILLS.filter((s) => statuses[s.id] === 'necesita_ayuda');
  const hasData = lastWithData >= 0;
  return { map, statuses, current, mastered, locked, weak, hasData };
}

// Inferir la habilidad de una pregunta de una lección existente (texto tipo "12 - 5 = ?").
export function inferSkillFromQuestion(q) {
  if (!q) return null;
  const m = String(q).match(/(\d+)\s*([-+×x*÷\/])\s*(\d+)/);
  if (!m) return null;
  const a = Number(m[1]);
  const op = m[2];
  const b = Number(m[3]);
  if (op === '+') return a + b <= 20 ? 'suma_basica' : 'suma_basica';
  if (op === '-') {
    if (a < b) return null;
    return a % 10 < b % 10 ? 'resta_llevando' : 'resta_sin_llevar';
  }
  if (op === '×' || op === 'x' || op === '*') {
    const big = Math.max(a, b);
    if (big >= 11) return 'multi_2_digitos';
    if ([7, 8, 9].includes(big)) return 'tablas_7_8_9';
    if ([3, 4, 6].includes(big)) return 'tablas_3_4_6';
    return 'tablas_2_5_10';
  }
  if (op === '÷' || op === '/') return 'division_basica';
  return null;
}

// ---- Práctica programática: lección generada con números aleatorios ----
// Devuelve el formato que espera LessonPlayer (customLesson).
export function generatePracticeLesson(skillId, count = 8) {
  const skill = getSkill(skillId);
  if (!skill) return null;
  const items = Array.from({ length: count }, () => skill.gen());
  return {
    id: `practice-${skillId}-${Date.now()}`,
    skillId,
    title: `Práctica: ${skill.name}`,
    subjectName: 'Matemáticas',
    instruction: `Vamos a practicar: ${skill.name.toLowerCase()}. ¡Tú puedes!`,
    explanation: null,
    items,
    totalItems: items.length,
    adaptations: [],
  };
}

// ---- Resumen para el tutor IA (contexto del diagnóstico) ----
export function getSkillSummaryForTutor(studentId) {
  const state = getSkillPathState(studentId);
  if (!state.hasData) return 'La estudiante aún no tiene datos de habilidades; es nueva o no ha hecho el diagnóstico.';
  const lines = [];
  if (state.mastered.length > 0) {
    lines.push(`Habilidades dominadas: ${state.mastered.map((s) => s.name).join(', ')}.`);
  }
  const debiles = MATH_SKILLS.filter((s) => {
    const st = state.map[s.id];
    return st && st.attempts > 0 && st.correct / st.attempts < 0.8;
  }).map((s) => `${s.name} (${accuracy(state.map[s.id])}% de acierto)`);
  if (debiles.length > 0) {
    lines.push(`Necesita más ayuda en: ${debiles.join(', ')}.`);
  }
  if (state.current) {
    lines.push(`Su habilidad actual de trabajo es: ${state.current.name}.`);
  }
  const errores = MATH_SKILLS.flatMap((s) =>
    (state.map[s.id]?.recentErrors || []).slice(0, 2).map((e) => `Falló "${e.q}" (dijo ${e.wrong}, era ${e.answer})`)
  ).slice(0, 5);
  if (errores.length > 0) {
    lines.push(`Errores recientes: ${errores.join(' | ')}.`);
  }
  return lines.join(' ');
}

// ---- Resumen para el panel de padres ----
export function getParentSkillSummary(studentId) {
  const state = getSkillPathState(studentId);
  const rows = MATH_SKILLS.map((s) => ({
    ...s,
    stat: state.map[s.id] || null,
    status: state.statuses[s.id],
    accuracy: accuracy(state.map[s.id]),
  }));
  let recommendation = null;
  if (state.weak.length > 0) {
    recommendation = `Practicar "${state.weak[0].name}" unos 10 minutos al día hasta que se sienta segura.`;
  } else if (state.current) {
    recommendation = `Su siguiente paso es "${state.current.name}". 10 minutos al día de práctica corta y constante.`;
  } else {
    recommendation = 'Ha dominado todo el camino de matemáticas. ¡Puede pasar a retos más avanzados!';
  }
  return { rows, recommendation, hasData: state.hasData, current: state.current, mastered: state.mastered, weak: state.weak };
}

// ---- Diagnóstico adaptativo ----
// Reglas: empezar fácil (sumas hasta 20), subir al acertar 2 de una habilidad,
// bajar al fallar 2. Máximo 12 preguntas, máximo 3 por habilidad.
export const DIAGNOSTIC_MAX_QUESTIONS = 12;
export const DIAGNOSTIC_MAX_PER_SKILL = 3;
export const DIAGNOSTIC_START_INDEX = 1; // suma_basica

export function diagnosticNextSkillIndex(currentIndex, skillResults) {
  // skillResults: { correct, wrong } de la habilidad actual
  if (skillResults.correct >= 2) {
    // Sube a la siguiente habilidad cuyo prerequisito esté "cubierto".
    // Camino principal del diagnóstico (orden lineal del array).
    return currentIndex + 1;
  }
  if (skillResults.wrong >= 2) return currentIndex - 1;
  return currentIndex; // sigue en la misma habilidad
}
