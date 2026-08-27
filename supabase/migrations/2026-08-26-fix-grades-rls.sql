-- Fix: el dispositivo del niño (por link/QR, sin login del padre) no podía
-- actualizar las calificaciones en la nube — faltaban políticas para
-- grades_record, recommendations y ai_insights. Por eso la nota se congelaba.

-- Helper: el estudiante existe (válido para escribir sus datos académicos)
create or replace function public.estudiante_existe(p_student_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.students s where s.id = p_student_id);
$$;

grant execute on function public.estudiante_existe(uuid) to anon, authenticated;

-- grades_record: insertar/actualizar notas desde cualquier dispositivo del estudiante
drop policy if exists "escribir notas dispositivo estudiante" on public.grades_record;
create policy "escribir notas dispositivo estudiante"
  on public.grades_record for insert to anon, authenticated
  with check (public.estudiante_existe(student_id));

drop policy if exists "actualizar notas dispositivo estudiante" on public.grades_record;
create policy "actualizar notas dispositivo estudiante"
  on public.grades_record for update to anon, authenticated
  using (public.estudiante_existe(student_id))
  with check (public.estudiante_existe(student_id));

-- ai_insights: guardar análisis de la IA desde el dispositivo del estudiante
drop policy if exists "insert insights dispositivo estudiante" on public.ai_insights;
create policy "insert insights dispositivo estudiante"
  on public.ai_insights for insert to anon, authenticated
  with check (public.estudiante_existe(student_id));

-- recommendations: recomendación diaria desde el dispositivo del estudiante
drop policy if exists "escribir recomendaciones dispositivo estudiante" on public.recommendations;
create policy "escribir recomendaciones dispositivo estudiante"
  on public.recommendations for insert to anon, authenticated
  with check (public.estudiante_existe(student_id));

drop policy if exists "actualizar recomendaciones dispositivo estudiante" on public.recommendations;
create policy "actualizar recomendaciones dispositivo estudiante"
  on public.recommendations for update to anon, authenticated
  using (public.estudiante_existe(student_id))
  with check (public.estudiante_existe(student_id));
