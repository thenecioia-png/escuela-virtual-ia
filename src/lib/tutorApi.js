// Cliente del Worker /api/tutor (router de IAs gratis con fallback).
// Si VITE_TUTOR_API_URL no está definida, todo devuelve null y la app sigue
// funcionando sin IA (las funciones son opcionales hasta la Fase 3).

const TUTOR_URL = import.meta.env.VITE_TUTOR_API_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isTutorConfigured = Boolean(TUTOR_URL);

export async function tutorRequest(action, payload = {}) {
  if (!isTutorConfigured) return null;
  try {
    // La Edge Function exige JWT: la anon key pública basta (los secretos IA viven en el servidor)
    const headers = { 'Content-Type': 'application/json' };
    if (ANON_KEY) {
      headers['Authorization'] = `Bearer ${ANON_KEY}`;
      headers['apikey'] = ANON_KEY;
    }
    const res = await fetch(TUTOR_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, payload }),
    });
    const body = await res.json();
    if (!res.ok || !body.ok) return null;
    return body.data;
  } catch {
    return null; // sin red o worker caído → degradar en silencio
  }
}

// Genera una pista pedagógica corta para una respuesta fallida (o null)
export async function getHint({ country, grade, age, subject, topic, question, wrongAnswer, correctAnswer }) {
  const data = await tutorRequest('hint', { country, grade, age, subject, topic, question, wrongAnswer, correctAnswer });
  return data?.pista || null;
}

// Alias de compatibilidad (código anterior)
export const generateHint = getHint;

// Genera una lección completa para un tema del currículo (o null).
// Formato del Worker: { titulo, explicacion, preguntas: [{ pregunta, opciones[4], correcta }] }
export async function generateLesson({ country, grade, subject, topic, age }) {
  return tutorRequest('generate_lesson', { country, grade, subject, topic, age });
}

// Analiza las respuestas recientes del estudiante (o null).
// Devuelve: { fortalezas: string[], debilidades: string[], foco_sugerido: string }
export async function analyzeProgress({ country, grade, age, subject, answers }) {
  return tutorRequest('analyze', { country, grade, age, subject, answers });
}

// Recomendación diaria / resumen corto en lenguaje humano (o null).
// Devuelve el texto directamente.
export async function dailyRecommendation({ country, grade, age, weakSubjects }) {
  const data = await tutorRequest('recommend', { country, grade, age, weakSubjects });
  return data?.texto || null;
}

// Adapta el JSON del Worker ({ titulo, explicacion, preguntas }) al formato
// que espera LessonPlayer ({ title, instruction, explanation, items }).
// Devuelve null si el contenido no es jugable.
export function adaptAiLesson(data, meta = {}) {
  if (!data || !Array.isArray(data.preguntas) || data.preguntas.length === 0) return null;
  const items = data.preguntas
    .filter((p) => p && p.pregunta && Array.isArray(p.opciones) && p.opciones.length >= 2)
    .map((p) => {
      const options = p.opciones.map(String);
      const idx = Number.isInteger(p.correcta) && p.correcta >= 0 && p.correcta < options.length ? p.correcta : 0;
      const answer = options[idx];
      return {
        q: String(p.pregunta),
        options,
        answer,
        explanation: `La respuesta correcta es: ${answer}`,
      };
    });
  if (items.length === 0) return null;
  return {
    id: `ai-${Date.now()}`,
    title: data.titulo || 'Lección nueva',
    subjectName: meta.subjectName || null,
    instruction: 'Lee la explicación y responde las preguntas.',
    explanation: data.explicacion || null,
    items,
    totalItems: items.length,
    adaptations: [],
  };
}
