# Plan: Escuela Virtual Real (reconstrucción funcional)

> Fecha: 2026-08-26. Repo: `C:/Users/susecomp/projects/escuela-virtual-ia`
> Decisiones del usuario: **Supabase** (BD + auth) · **Grado y país seleccionables por estudiante** (currículo adaptado al país) · **TODO GRATIS** (capas gratuitas solamente, $0/mes).

## Restricción dura: $0/mes (todo en capa gratuita)
| Pieza | Servicio gratis | Límite de la capa |
|---|---|---|
| Hosting web | **Cloudflare Pages** (o Netlify) | ancho de banda ilimitado, builds gratis |
| Función proxy IA | **Cloudflare Workers** | 100.000 req/día gratis |
| Base de datos + cuentas + tiempo real | **Supabase Free** | 500 MB BD, 50.000 usuarios — de sobra |
| IA | **Google Gemini API (free tier)** como motor principal — 1.500 req/día gratis; **Kimi/Moonshot** como opción de pago futura (no es gratis: ~$0.12/millón tokens) | Con caché de lecciones en BD, 1.500 req/día sobran |
| Correo/reportes | Resend free (100/día) o solo in-app | — |
> Cambio vs. versión anterior: Fly.io (~$2-5/mes mínimo) sale; Kimi API se deja como *fallback* configurable, no como motor por defecto, porque no tiene capa gratis.

## Diagnóstico (estado actual)
- Frontend estático React 19 + Vite + Tailwind v4. Sin backend, sin cuentas, sin BD.
- Datos en localStorage (prefijo `evi_`, `src/utils/storage.js`) — se pierden al cambiar de dispositivo.
- "IA" simulada con heurística local (`src/hooks/useAdaptiveEngine.js`).
- 14 lecciones hardcodeadas (`src/data/lessons.js`); sin grados escolares reales.
- Panel de padres existe pero lee datos locales, sin cuenta propia.
- Deploy: nginx estático en Fly.io (`Dockerfile`, `fly.toml`, app `escuela-virtual-ia`).

## Arquitectura objetivo
```
React (Vite) en Cloudflare Pages ──► Supabase (Postgres + Auth + Realtime, free)
      │
      └──► Cloudflare Worker /api/tutor (proxy) ──► Gemini API free tier (fallback: Kimi)
            (la API key NUNCA va en el frontend — regla §6)
```
- **Auth:** Supabase Auth (email del padre). Estudiantes = perfiles con PIN de 4 dígitos (no email).
- **BD (Postgres):** tablas `families`, `students`, `countries_curricula`, `grades`, `subjects`, `lessons`, `sessions` (tiempo, puntaje), `grades_record` (calificaciones por período), `ai_insights` (análisis IA), `recommendations`.
- **Tiempo real:** Supabase Realtime suscribe el panel del padre a `sessions`/`grades_record` del hijo.
- **IA:** Worker `/api/tutor` que llama Gemini API (fallback Kimi): genera lecciones adaptadas, analiza errores por tema, produce recomendaciones. Cachear lecciones generadas en tabla `lessons` para no pagar dos veces.

## Modelo de datos (resumen)
- `students`: id, family_id, nombre, país (ISO), grado, pin, avatar, necesidades (TDAH etc., migrar de perfil actual).
- `countries_curricula`: país → estructura de grados y materias oficiales (semilla: RD, México, Colombia, España, USA-español; extensible).
- `sessions`: student_id, lesson_id, inicio/fin, tiempo_min, puntaje, respuestas (jsonb), emoción.
- `grades_record`: student_id, materia, período (P1–P4), nota calculada 0–100.
- `ai_insights`: student_id, fecha, fortalezas[], debilidades[], foco_sugerido, generado_por.

## Fases de construcción

### Fase 0 — Preparación (30 min)
- Crear proyecto Supabase, guardar keys en `.env` (NUNCA commitear; `.env.example` con placeholders).
- `npm i @supabase/supabase-js`. Crear Worker con `GEMINI_API_KEY` (y `KIMI_API_KEY` opcional como fallback).
- **Verificación:** conexión a Supabase desde la app en local; función `/api/tutor` responde "hola" de Kimi.

### Fase 1 — Cuentas y perfiles reales
- Registro/login padre (email+password, Supabase Auth).
- Onboarding: crear estudiante → elegir **país** → sistema muestra **grados de ese país** → elegir grado → PIN.
- Migrar lógica de `useStudentProfile` a Supabase; localStorage solo como caché offline.
- **Verificación:** crear familia + 2 estudiantes; cerrar navegador, abrir en otro dispositivo → datos intactos.

### Fase 2 — Registro académico
- `recordSession` escribe a `sessions` en la nube (tiempo real medido por la app).
- Cálculo de calificaciones: promedio ponderado por materia → `grades_record` por período; boleta visible.
- Vista estudiante: su grado, sus materias, su racha y tiempo de hoy.
- **Verificación:** completar una lección → aparece sesión con tiempo y nota en BD y en boleta.

### Fase 3 — IA pedagógica (Gemini free, fallback Kimi)
- Generador de lecciones: prompt con país+grado+materia+tema → lección JSON (explicación + 5 preguntas) → guardar en `lessons` (caché).
- Analizador: tras cada 5 sesiones, IA analiza respuestas → `ai_insights` (temas débiles, nivel de concentración estimado por tiempo/errores).
- Recomendación diaria en el dashboard del estudiante ("hoy: 15 min de fracciones").
- **Verificación:** generar lección nueva de un tema no hardcodeado; provocar errores a propósito → insight detecta la debilidad correcta.

### Fase 4 — Panel del padre en tiempo real
- Login del padre → lista de hijos → por hijo: hoy (minutos, lecciones), calificaciones por materia/período, racha, fortalezas/debilidades de la IA, alertas (3+ días sin estudiar X).
- Supabase Realtime: el panel se actualiza en vivo mientras el niño estudia.
- Reporte semanal generado por IA (texto en lenguaje humano).
- **Verificación (modo humano, §2):** dos navegadores — niño completa lección en uno → padre lo ve aparecer sin recargar.

### Fase 5 — Migración de contenido y diseño
- Migrar las 14 lecciones existentes a la BD (semilla).
- Diseño anti-genérico (§3): mantener identidad actual pero sin emojis en producción, tipografía distintiva.
- Rebuild + deploy a Cloudflare Pages (`npm run build` → `dist/`). El dominio `escuela-virtual-ia.fly.dev` se puede redirigir o apuntar DNS al nuevo hosting gratis.
- **Verificación final:** flujo completo con datos reales y raros (nombres con ñ/acentos, sesión de 0 min, apagar net a mitad), en 1920×1080 / 1366×768 / 390×844, capturas revisadas.

## Riesgos y líneas rojas
- API key de Kimi solo en servidor (serverless), nunca en el bundle.
- Sin PII de menores en logs; datos mínimos (nombre de pila, grado, país).
- Supabase gratis: 500 MB BD — suficiente; monitorear con `metrics`.
- RLS (Row Level Security) en Supabase: cada familia solo ve sus datos — obligatorio antes de deploy.
