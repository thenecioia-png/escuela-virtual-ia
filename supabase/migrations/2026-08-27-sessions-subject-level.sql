-- Guarda la materia y el nivel de cada sesión para análisis/boleta más fino.
-- Antes `sessions` solo guardaba lesson_id; con esto el panel del padre puede
-- saber exactamente qué materia y nivel practicó en cada sesión.
alter table public.sessions
  add column if not exists subject_id text;

alter table public.sessions
  add column if not exists level_id text;
