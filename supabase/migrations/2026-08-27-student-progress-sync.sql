-- Sincroniza el progreso completo del estudiante a la nube para que el panel
-- del padre lo vea en tiempo real desde otro dispositivo.
--
-- El objeto `progress` (subjectProgress, totalStars, streakDays, sessionHistory,
-- timeSpentMinutes, answers, achievements) antes vivía solo en el localStorage
-- del teléfono del niño. Ahora se guarda un snapshot en `students.progress`.

-- 1) Columna para el snapshot del progreso.
alter table public.students
  add column if not exists progress jsonb;

-- 2) RPC security definer: el teléfono del niño (anon) no puede hacer select/update
--    directo sobre `students` por RLS, así que escribe vía esta función.
create or replace function public.save_student_progress(sid uuid, p jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.students set progress = p where id = sid;
$$;

grant execute on function public.save_student_progress(uuid, jsonb) to anon, authenticated;

-- 3) Publica cambios de `students` por realtime para que el padre reciba el avance en vivo.
alter publication supabase_realtime add table public.students;
