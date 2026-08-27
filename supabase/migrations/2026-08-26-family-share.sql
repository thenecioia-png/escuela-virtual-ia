-- Compartir familia por link/QR: el estudiante entra con PIN desde su teléfono.
-- No expone el PIN ni datos sensibles; solo permite lo mínimo necesario.

-- 1. Lista pública de estudiantes de una familia (sin PIN)
create or replace function public.family_students(fid uuid)
returns table (id uuid, nombre text, avatar text, country_code text, grade_id text, has_pin boolean)
language sql security definer stable
set search_path = public
as $$
  select id, nombre, avatar, country_code, grade_id, (pin is not null) as has_pin
  from public.students
  where family_id = fid
  order by created_at asc;
$$;

-- 2. Verificar PIN sin exponerlo (devuelve solo true/false)
create or replace function public.check_student_pin(sid uuid, pin_attempt text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce(
    (select (pin is null or pin = pin_attempt) from public.students where id = sid),
    false
  );
$$;

-- Helper: ¿existe el estudiante? (SECURITY DEFINER: puede leer `students`
-- aunque el rol anónimo del dispositivo no tenga permiso de lectura directo).
create or replace function public.estudiante_existe(p_student_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.students s where s.id = p_student_id);
$$;

-- 3. El dispositivo del niño puede registrar sus sesiones sin login
drop policy if exists "insert sesiones dispositivo estudiante" on public.sessions;
create policy "insert sesiones dispositivo estudiante"
  on public.sessions for insert to anon, authenticated
  with check (public.estudiante_existe(student_id));

-- 4. El dispositivo del niño puede leer mensajes del padre dirigidos a él
drop policy if exists "leer mensajes del padre desde dispositivo" on public.parent_messages;
create policy "leer mensajes del padre desde dispositivo"
  on public.parent_messages for select to anon, authenticated
  using (public.estudiante_existe(student_id));

-- Permisos de ejecución para usuarios anónimos
grant execute on function public.family_students(uuid) to anon, authenticated;
grant execute on function public.check_student_pin(uuid, text) to anon, authenticated;
grant execute on function public.estudiante_existe(uuid) to anon, authenticated;

-- 5. Sesiones de examen (retención): se marcan para no subir de nivel
alter table public.sessions add column if not exists is_exam boolean not null default false;
