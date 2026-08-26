// Edge Function "tutor" — router de IAs gratis con fallback (concepto "9Router").
// Proveedores en orden: 1) Google Gemini free tier, 2) OpenRouter modelos :free.
// Las API keys viven SOLO aquí (secretos de Supabase), nunca en el frontend.
//
// POST /tutor  { action: 'generate_lesson'|'analyze'|'recommend'|'hint', payload }

function buildPrompt(action: string, payload: any = {}): string | null {
  const { country, grade, subject, topic, age } = payload;
  const ctx = `Estudiante de ${grade || 'primaria'} en ${country || 'Latinoamérica'}${age ? `, ${age} años` : ''}.`;

  switch (action) {
    case 'generate_lesson':
      return `${ctx} Materia: ${subject}. Tema: ${topic}.
Genera una lección para niños en JSON ESTRICTO con esta forma exacta:
{"titulo": string, "explicacion": string (2-4 párrafos cortos, tono cálido), "preguntas": [{"pregunta": string, "opciones": [string, string, string, string], "correcta": 0-3}]}
Debe tener EXACTAMENTE 5 preguntas de dificultad creciente. Responde SOLO el JSON, sin markdown.`;

    case 'analyze':
      return `${ctx} Estas son sus últimas respuestas (JSON):
${JSON.stringify(payload.answers || [])}
Analiza y responde SOLO JSON ESTRICTO:
{"fortalezas": [string], "debilidades": [string], "foco_sugerido": string (una frase accionable para hoy)}`;

    case 'recommend':
      return `${ctx} Materias con menor progreso: ${(payload.weakSubjects || []).join(', ') || 'ninguna aún'}.
Escribe UNA recomendación diaria de máximo 25 palabras, cálida y concreta (ej: "Hoy: 15 minutos de fracciones").
Responde SOLO JSON: {"texto": string}`;

    case 'hint':
      return `${ctx} Materia: ${subject}. Tema: ${topic}.
Pregunta: "${payload.question}"
El niño respondió: "${payload.wrongAnswer}" (incorrecto). La respuesta correcta es: "${payload.correctAnswer}".
Escribe UNA pista pedagógica corta (máximo 30 palabras) que lo ayude a descubrir la respuesta SIN decírsela directamente, apropiada para su edad. Tono de ánimo, nunca de regaño.
Responde SOLO JSON: {"pista": string}`;

    default:
      return null;
  }
}

// --- Proveedores (devuelven string; null = no configurado → saltar) ---
async function callGemini(prompt: string): Promise<string | null> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: respuesta vacía');
  return text;
}

async function callOpenRouter(prompt: string): Promise<string | null> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'Escuela Virtual Inteligente',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter: respuesta vacía');
  return text;
}

const PROVIDERS = [
  { name: 'gemini', fn: callGemini },
  { name: 'openrouter', fn: callOpenRouter },
];

function parseJsonFromText(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió JSON');
  return JSON.parse(match[0]);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Usa POST con { action, payload }' }, 404);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Body JSON inválido' }, 400);
  }

  const { action, payload } = body || {};
  const prompt = buildPrompt(action, payload);
  if (!prompt) {
    return jsonResponse({ error: `Acción desconocida: ${action}. Usa generate_lesson | analyze | recommend | hint` }, 400);
  }

  const errores: string[] = [];
  for (const provider of PROVIDERS) {
    try {
      const text = await provider.fn(prompt);
      if (text === null) continue;
      const data = parseJsonFromText(text);
      return jsonResponse({ ok: true, provider: provider.name, data }, 200);
    } catch (err) {
      errores.push(`${provider.name}: ${(err as Error).message}`);
    }
  }

  return jsonResponse({ ok: false, error: 'Todos los proveedores fallaron', detalles: errores }, 502);
});
