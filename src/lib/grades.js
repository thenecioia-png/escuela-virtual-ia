// Cálculo de calificaciones (boleta) a partir del historial de sesiones.
// Nota 0–100 por materia y período. Período = trimestre del año en curso:
// P1 = ene–mar, P2 = abr–jun, P3 = jul–sep, P4 = oct–dic.
import { supabase, isCloudConfigured } from './supabase';

export function currentPeriod(date = new Date()) {
  return `P${Math.floor(date.getMonth() / 3) + 1}`;
}

// Filtra las sesiones que pertenecen al período indicado (por su fecha)
export function sessionsInPeriod(sessions, period = currentPeriod()) {
  return (sessions || []).filter((s) => currentPeriod(new Date(s.date || Date.now())) === period);
}

// Promedio de puntaje por materia en un período → [{ subject, score }]
export function computeGrades(sessions, period = currentPeriod()) {
  const bySubject = {};
  sessionsInPeriod(sessions, period).forEach((s) => {
    if (typeof s.score !== 'number') return;
    if (!bySubject[s.subjectId]) bySubject[s.subjectId] = { total: 0, count: 0 };
    bySubject[s.subjectId].total += s.score;
    bySubject[s.subjectId].count += 1;
  });
  return Object.entries(bySubject).map(([subject, { total, count }]) => ({
    subject,
    score: Math.round(total / count),
  }));
}

// Actualiza `grades_record` en la nube tras cada sesión (fire-and-forget).
// Solo corre si hay nube configurada y el estudiante tiene id de la nube.
export function upsertGrades(studentId, sessions, period = currentPeriod()) {
  if (!isCloudConfigured || !studentId || String(studentId).startsWith('local-')) return;
  const grades = computeGrades(sessions, period);
  if (grades.length === 0) return;
  const rows = grades.map((g) => ({
    student_id: studentId,
    subject: g.subject,
    period,
    score: g.score,
    computed_at: new Date().toISOString(),
  }));
  supabase
    .from('grades_record')
    .upsert(rows, { onConflict: 'student_id,subject,period' })
    .then(() => {});
}

// Lee las notas del período desde la nube (para el panel del padre).
// Devuelve null si no hay nube o falla (el llamador usa el cálculo local).
export async function fetchGrades(studentId, period = currentPeriod()) {
  if (!isCloudConfigured || !studentId || String(studentId).startsWith('local-')) return null;
  const { data, error } = await supabase
    .from('grades_record')
    .select('subject, score, period')
    .eq('student_id', studentId)
    .eq('period', period);
  if (error) return null;
  return data;
}
