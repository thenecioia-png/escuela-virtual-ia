/**
 * Worker /api/tutor — router multi-proveedor de IA con fallback automático.
 *
 * Concepto (pedido del usuario como "9Router"): UN endpoint que encadena
 * proveedores de IA GRATIS y usa el primero que responda bien:
 *   1. Google Gemini API (free tier)      — GEMINI_API_KEY
 *   2. Cloudflare Workers AI (Llama 3.1)  — binding AI o CF_ACCOUNT_ID + CF_API_TOKEN
 *   3. OpenRouter modelos ":free"         — OPENROUTER_API_KEY
 * Cada proveedor se SALTA si falta su env key. Si todos fallan → 502 con detalle.
 *
 * Acciones (POST /api/tutor, body { action, payload }):
 *   - generate_lesson : genera una lección JSON (explicación + 5 preguntas)
 *   - analyze         : analiza respuestas recientes → fortalezas/debilidades
 *   - recommend       : recomendación diaria corta para el estudiante
 *   - hint            : pista pedagógica corta ante una respuesta fallida
 *
 * Las API keys NUNCA llegan al frontend — solo viven aquí (regla §6).
 */

// ---------------------------------------------------------------------------
// Prompts en español, ajustados al país/grado del niño
// ---------------------------------------------------------------------------
function buildPrompt(action, payload = {}) {
  const { country, grade, subject, topic, age } = payload;
  const ctx = `Estudiante de ${grade || 'primaria'} en ${country || 'Latinoamérica'}${age ? `, ${age} años` : ''}.`;

  switch (action) {
    case 'generate_lesson':
      return `${ctx} Materia: ${subject}. Tema: ${topic}.
Genera una lección para niños en JSON ESTRICTO con esta forma exacta:
{"titulo": string, "explicacion": string (2-4 párrafos cortos, tono cálido), "preguntas": [{"pregunta": string, "opciones": [string, string, string, string], "correcta": 0-3}] }
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

// ---------------------------------------------------------------------------
// Proveedores (cada uno devuelve string o lanza; null = "no configurado, saltar")
// ---------------------------------------------------------------------------
async function callGemini(prompt, env) {
  if (!env.GEMINI_API_KEY) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: respuesta vacía');
  return text;
}

async function callWorkersAI(prompt, env) {
  const messages = [{ role: 'user', content: prompt }];
  // Camino A: binding nativo [ai] del wrangler.toml
  if (env.AI) {
    const out = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages });
    const text = out?.response;
    if (!text) throw new Error('Workers AI: respuesta vacía');
    return text;
  }
  // Camino B: REST con cuenta + token
  if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) return null;
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Workers AI HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.result?.response;
  if (!text) throw new Error('Workers AI: respuesta vacía');
  return text;
}

async function callOpenRouter(prompt, env) {
  if (!env.OPENROUTER_API_KEY) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://escuela-virtual-ia.app',
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

// Orden de fallback (gratis primero; se salta el que no tenga key)
const PROVIDERS = [
  { name: 'gemini', fn: callGemini },
  { name: 'workers-ai', fn: callWorkersAI },
  { name: 'openrouter', fn: callOpenRouter },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
// Extrae el primer bloque JSON válido del texto (por si el modelo mete ruido)
function parseJsonFromText(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió JSON');
  return JSON.parse(match[0]);
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // Health check
    if (request.method === 'GET' && url.pathname === '/api/tutor') {
      const providers = PROVIDERS.map((p) => ({
        name: p.name,
        configurado:
          (p.name === 'gemini' && !!env.GEMINI_API_KEY) ||
          (p.name === 'workers-ai' && !!(env.AI || (env.CF_ACCOUNT_ID && env.CF_API_TOKEN))) ||
          (p.name === 'openrouter' && !!env.OPENROUTER_API_KEY),
      }));
      return jsonResponse({ ok: true, providers }, 200, env);
    }

    if (request.method !== 'POST' || url.pathname !== '/api/tutor') {
      return jsonResponse({ error: 'Usa POST /api/tutor con { action, payload }' }, 404, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Body JSON inválido' }, 400, env);
    }

    const { action, payload } = body || {};
    const prompt = buildPrompt(action, payload);
    if (!prompt) {
      return jsonResponse({ error: `Acción desconocida: ${action}. Usa generate_lesson | analyze | recommend | hint` }, 400, env);
    }

    // Router con fallback: primer proveedor configurado que responda bien gana
    const errores = [];
    for (const provider of PROVIDERS) {
      try {
        const text = await provider.fn(prompt, env);
        if (text === null) continue; // no configurado → saltar
        const data = parseJsonFromText(text);
        return jsonResponse({ ok: true, provider: provider.name, data }, 200, env);
      } catch (err) {
        errores.push(`${provider.name}: ${err.message}`);
      }
    }

    return jsonResponse(
      { ok: false, error: 'Todos los proveedores fallaron o ninguno está configurado', detalles: errores },
      502,
      env
    );
  },
};
