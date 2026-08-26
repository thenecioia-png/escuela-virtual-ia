-- ============================================================================
-- Escuela Virtual Inteligente — Esquema completo (Fase 0/1)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar todo → Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FAMILIAS (vinculada 1:1 con auth.users — el padre/madre/tutor)
-- ----------------------------------------------------------------------------
create table if not exists public.families (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. ESTUDIANTES (perfiles de niños; entran con PIN, no con email)
-- ----------------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  nombre text not null,
  country_code text not null,
  grade_id text not null,
  pin text not null check (pin ~ '^[0-9]{4}$'),  -- exactamente 4 dígitos
  avatar text not null default '🦉',
  needs jsonb not null default '{}'::jsonb,      -- needsAssessment, estilo, accesibilidad, intereses
  created_at timestamptz not null default now()
);
create index if not exists students_family_idx on public.students (family_id);

-- ----------------------------------------------------------------------------
-- 3. CURRÍCULOS POR PAÍS (datos de referencia, lectura pública)
-- ----------------------------------------------------------------------------
create table if not exists public.countries_curricula (
  country_code text primary key,
  country_name text not null,
  grades jsonb not null
  -- grades: [{ id, label, subjects: [{ id, name, topics: [texto...] }] }]
);

-- ----------------------------------------------------------------------------
-- 4. LECCIONES (semilla hardcodeada o generadas por IA; caché del Worker)
-- ----------------------------------------------------------------------------
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  grade text not null,
  subject text not null,
  topic text not null,
  content jsonb not null,                        -- { explicacion, preguntas[], ... }
  source text not null default 'seed' check (source in ('seed', 'ai')),
  created_at timestamptz not null default now(),
  unique (country_code, grade, subject, topic)   -- una lección cacheada por tema
);

-- ----------------------------------------------------------------------------
-- 5. SESIONES DE ESTUDIO (tiempo medido, puntaje, respuestas, emoción)
-- ----------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  time_minutes numeric not null default 0,
  score numeric check (score >= 0 and score <= 100),
  answers jsonb not null default '[]'::jsonb,
  emotion text
);
create index if not exists sessions_student_idx on public.sessions (student_id);

-- ----------------------------------------------------------------------------
-- 6. CALIFICACIONES por período (P1–P4), nota 0–100 calculada
-- ----------------------------------------------------------------------------
create table if not exists public.grades_record (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  subject text not null,
  period text not null,                          -- 'P1' | 'P2' | 'P3' | 'P4'
  score numeric not null check (score >= 0 and score <= 100),
  computed_at timestamptz not null default now(),
  unique (student_id, subject, period)
);

-- ----------------------------------------------------------------------------
-- 7. INSIGHTS DE IA (fortalezas, debilidades, foco sugerido)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  focus_suggestion text
);

-- ----------------------------------------------------------------------------
-- 8. RECOMENDACIONES DIARIAS
-- ----------------------------------------------------------------------------
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null default current_date,
  text text not null,
  unique (student_id, date)
);

-- ----------------------------------------------------------------------------
-- 9. MENSAJES DEL PADRE AL NIÑO (ánimo, pistas, notas)
-- ----------------------------------------------------------------------------
create table if not exists public.parent_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  tipo text not null check (tipo in ('animo', 'pista', 'nota')),
  texto text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists parent_messages_student_idx on public.parent_messages (student_id);

-- ============================================================================
-- ROW LEVEL SECURITY (obligatorio antes de deploy)
-- Regla: el padre (auth.uid) solo ve/edita SU familia, SUS estudiantes y
-- todo lo que cuelga de sus estudiantes. Los currículos y lecciones son
-- datos de referencia de lectura pública.
-- ============================================================================
alter table public.families enable row level security;
alter table public.students enable row level security;
alter table public.countries_curricula enable row level security;
alter table public.lessons enable row level security;
alter table public.sessions enable row level security;
alter table public.grades_record enable row level security;
alter table public.ai_insights enable row level security;
alter table public.recommendations enable row level security;
alter table public.parent_messages enable row level security;

-- families: solo la propia fila
create policy "familia propia: select" on public.families
  for select using (auth.uid() = id);
create policy "familia propia: insert" on public.families
  for insert with check (auth.uid() = id);
create policy "familia propia: update" on public.families
  for update using (auth.uid() = id);

-- students: solo los de mi familia
create policy "estudiantes de mi familia: select" on public.students
  for select using (family_id = auth.uid());
create policy "estudiantes de mi familia: insert" on public.students
  for insert with check (family_id = auth.uid());
create policy "estudiantes de mi familia: update" on public.students
  for update using (family_id = auth.uid());
create policy "estudiantes de mi familia: delete" on public.students
  for delete using (family_id = auth.uid());

-- countries_curricula: referencia pública (solo lectura)
create policy "curriculos lectura publica" on public.countries_curricula
  for select using (true);

-- lessons: contenido de referencia (solo lectura desde la app;
-- la escritura la hace el Worker con la service-role key, que ignora RLS)
create policy "lecciones lectura publica" on public.lessons
  for select using (true);

-- Función helper: ¿este estudiante pertenece a la familia autenticada?
create or replace function public.es_mi_estudiante(p_student_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.students
    where id = p_student_id and family_id = auth.uid()
  );
$$;

-- sessions: solo de mis estudiantes
create policy "sesiones de mis estudiantes: select" on public.sessions
  for select using (public.es_mi_estudiante(student_id));
create policy "sesiones de mis estudiantes: insert" on public.sessions
  for insert with check (public.es_mi_estudiante(student_id));
create policy "sesiones de mis estudiantes: update" on public.sessions
  for update using (public.es_mi_estudiante(student_id));

-- grades_record: solo de mis estudiantes
create policy "notas de mis estudiantes: select" on public.grades_record
  for select using (public.es_mi_estudiante(student_id));
create policy "notas de mis estudiantes: insert" on public.grades_record
  for insert with check (public.es_mi_estudiante(student_id));
create policy "notas de mis estudiantes: update" on public.grades_record
  for update using (public.es_mi_estudiante(student_id));

-- ai_insights: solo de mis estudiantes (lectura; escritura vía Worker)
create policy "insights de mis estudiantes: select" on public.ai_insights
  for select using (public.es_mi_estudiante(student_id));
create policy "insights de mis estudiantes: insert" on public.ai_insights
  for insert with check (public.es_mi_estudiante(student_id));

-- recommendations: solo de mis estudiantes
create policy "recomendaciones de mis estudiantes: select" on public.recommendations
  for select using (public.es_mi_estudiante(student_id));
create policy "recomendaciones de mis estudiantes: insert" on public.recommendations
  for insert with check (public.es_mi_estudiante(student_id));
create policy "recomendaciones de mis estudiantes: update" on public.recommendations
  for update using (public.es_mi_estudiante(student_id));

-- parent_messages: solo de mi familia (padre envía; el niño lee con la sesión del padre)
create policy "mensajes de mi familia: select" on public.parent_messages
  for select using (family_id = auth.uid());
create policy "mensajes de mi familia: insert" on public.parent_messages
  for insert with check (family_id = auth.uid() and public.es_mi_estudiante(student_id));
create policy "mensajes de mi familia: update" on public.parent_messages
  for update using (family_id = auth.uid());
create policy "mensajes de mi familia: delete" on public.parent_messages
  for delete using (family_id = auth.uid());

-- ============================================================================
-- REALTIME (el panel del padre se actualiza en vivo; mensajes llegan al niño)
-- ============================================================================
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.grades_record;
alter publication supabase_realtime add table public.parent_messages;

-- ============================================================================
-- SEMILLA: currículos por país (espejo de src/lib/curricula.js)
-- ============================================================================
insert into public.countries_curricula (country_code, country_name, grades) values
  ('do', 'República Dominicana', '[{"id":"1","label":"1° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Letras y sonidos","Sílabas","Palabras y oraciones","Lectura de cuentos cortos"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 100","Sumas y restas","Figuras geométricas","Medidas sencillas"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Los seres vivos","El cuerpo humano","Los sentidos","El tiempo atmosférico"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi familia","Mi comunidad","Símbolos patrios","Normas de convivencia"]},{"id":"ingles","name":"Inglés","topics":["Saludos","Colores y números","La familia","Animales"]}]},{"id":"2","label":"2° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Lectura comprensiva","Uso de la b/v","Sustantivos y adjetivos","Escritura de oraciones"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 1,000","Sumas y restas llevando","Introducción a la multiplicación","El reloj y el dinero"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Plantas","Animales y hábitats","El agua","Salud e higiene"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi provincia","Medios de transporte","Oficios y profesiones","Tradiciones dominicanas"]},{"id":"ingles","name":"Inglés","topics":["Partes del cuerpo","La escuela","Días y meses","Comida"]}]},{"id":"3","label":"3° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Comprensión lectora","Verbos","Párrafos","La tilde"]},{"id":"matematicas","name":"Matemáticas","topics":["Multiplicación","División","Fracciones sencillas","Perímetros"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Ecosistemas","Materia y energía","Nutrición","El sistema solar"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Geografía de RD","Taínos","Descubrimiento de América","Regiones del país"]},{"id":"ingles","name":"Inglés","topics":["Presente simple","La casa","El clima","Rutinas diarias"]}]},{"id":"4","label":"4° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Textos narrativos","Pronombres","Signos de puntuación","Redacción de párrafos"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta millones","Fracciones","Decimales","Ángulos"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Cuerpo humano: sistemas","Cadena alimentaria","Recursos naturales","Conservación ambiental"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Historia colonial","Economía dominicana","Mapas y coordenadas","Derechos del niño"]},{"id":"ingles","name":"Inglés","topics":["Pasado simple","Descripciones","Preguntas y respuestas","Vocabulario escolar"]}]},{"id":"5","label":"5° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Textos expositivos","Adverbios","Ortografía","Comprensión inferencial"]},{"id":"matematicas","name":"Matemáticas","topics":["Operaciones combinadas","Fracciones y decimales","Porcentajes","Áreas"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Ecosistemas dominicanos","Fuerza y movimiento","La Tierra y sus capas","Salud integral"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Independencia nacional","Trujillo y democracia","Instituciones del Estado","Migración"]},{"id":"ingles","name":"Inglés","topics":["Futuro simple","Narración de eventos","Conectores","Lectura de textos cortos"]}]},{"id":"6","label":"6° de Primaria","subjects":[{"id":"lengua","name":"Lengua Española","topics":["Ensayo corto","Análisis gramatical","Literatura dominicana","Comprensión crítica"]},{"id":"matematicas","name":"Matemáticas","topics":["Números enteros","Razones y proporciones","Geometría: sólidos","Estadística básica"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Reproducción","Electricidad","Cambios de la materia","Desastres naturales"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Restauración y anexión","Constitución dominicana","Relaciones internacionales","Ciudadanía"]},{"id":"ingles","name":"Inglés","topics":["Tiempos verbales","Escritura guiada","Conversación","Comprensión auditiva"]}]}]'::jsonb),
  ('mx', 'México', '[{"id":"1","label":"1° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Letras y sonidos","Sílabas","Lectura inicial","Escritura de palabras"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 100","Sumas y restas","Figuras","Comparar cantidades"]},{"id":"conocimiento","name":"Conocimiento del Medio","topics":["Mi cuerpo","Mi familia","Mi escuela","La naturaleza"]},{"id":"civica","name":"Formación Cívica y Ética","topics":["Normas","Emociones","Respeto","Mi identidad"]},{"id":"ingles","name":"Inglés","topics":["Saludos","Colores","Números","Familia"]}]},{"id":"2","label":"2° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Comprensión lectora","Sustantivos y adjetivos","Uso de la b/v","Escritura de textos"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 1,000","Sumas y restas","Multiplicación inicial","El dinero"]},{"id":"conocimiento","name":"Conocimiento del Medio","topics":["Seres vivos","El clima","Mi localidad","Cuidado del ambiente"]},{"id":"civica","name":"Formación Cívica y Ética","topics":["Derechos","Convivencia","Cuidado personal","Valores"]},{"id":"ingles","name":"Inglés","topics":["El cuerpo","La escuela","Días y meses","Animales"]}]},{"id":"3","label":"3° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Verbos","Párrafos","La tilde","Textos narrativos"]},{"id":"matematicas","name":"Matemáticas","topics":["Multiplicación","División","Fracciones","Medición"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Ecosistemas","El sistema solar","Nutrición","Materia"]},{"id":"entidad","name":"La Entidad donde Vivo","topics":["Geografía de mi estado","Historia local","Tradiciones","Economía local"]},{"id":"ingles","name":"Inglés","topics":["Presente simple","La casa","El clima","Comida"]}]},{"id":"4","label":"4° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Pronombres","Signos de puntuación","Textos expositivos","Redacción"]},{"id":"matematicas","name":"Matemáticas","topics":["Números grandes","Fracciones","Decimales","Ángulos"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Sistemas del cuerpo","Cadenas alimentarias","Recursos naturales","Energía"]},{"id":"geografia","name":"Geografía","topics":["México en el mundo","Relieve y climas","Mapas","Regiones naturales"]},{"id":"ingles","name":"Inglés","topics":["Pasado simple","Descripciones","Rutinas","Preguntas"]}]},{"id":"5","label":"5° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Adverbios","Ortografía","Comprensión inferencial","Textos argumentativos"]},{"id":"matematicas","name":"Matemáticas","topics":["Operaciones combinadas","Porcentajes","Áreas y perímetros","Problemas"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Fuerza y movimiento","La Tierra","Salud","Ecosistemas de México"]},{"id":"historia","name":"Historia","topics":["México prehispánico","La Conquista","La Independencia","Virreinato"]},{"id":"ingles","name":"Inglés","topics":["Futuro","Conectores","Lectura","Narración"]}]},{"id":"6","label":"6° de Primaria","subjects":[{"id":"espanol","name":"Español","topics":["Análisis gramatical","Ensayo corto","Literatura mexicana","Comprensión crítica"]},{"id":"matematicas","name":"Matemáticas","topics":["Números con signo","Proporcionalidad","Sólidos","Estadística"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Electricidad","Cambios de la materia","Reproducción","Desastres naturales"]},{"id":"historia","name":"Historia","topics":["Reforma","Revolución mexicana","México contemporáneo","Constitución"]},{"id":"ingles","name":"Inglés","topics":["Tiempos verbales","Escritura guiada","Conversación","Comprensión auditiva"]}]}]'::jsonb),
  ('co', 'Colombia', '[{"id":"1","label":"1° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Letras y sonidos","Sílabas","Palabras y oraciones","Cuentos cortos"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 100","Sumas y restas","Figuras geométricas","Comparar cantidades"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Los seres vivos","El cuerpo","Los sentidos","El clima"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi familia","Mi comunidad","Símbolos patrios","Normas"]},{"id":"ingles","name":"Inglés","topics":["Saludos","Colores y números","Familia","Animales"]}]},{"id":"2","label":"2° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Comprensión lectora","Sustantivos","Uso de b/v","Escritura"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 1,000","Sumas y restas","Multiplicación inicial","El dinero"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Plantas","Animales","El agua","Higiene"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi departamento","Transportes","Oficios","Tradiciones"]},{"id":"ingles","name":"Inglés","topics":["El cuerpo","La escuela","Días y meses","Comida"]}]},{"id":"3","label":"3° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Verbos","Párrafos","La tilde","Comprensión lectora"]},{"id":"matematicas","name":"Matemáticas","topics":["Multiplicación","División","Fracciones","Medidas"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Ecosistemas","Materia","Nutrición","Sistema solar"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Geografía de Colombia","Pueblos indígenas","Descubrimiento","Regiones"]},{"id":"ingles","name":"Inglés","topics":["Presente simple","La casa","El clima","Rutinas"]}]},{"id":"4","label":"4° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Narrativa","Pronombres","Puntuación","Redacción"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta millones","Fracciones","Decimales","Ángulos"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Sistemas del cuerpo","Cadenas alimentarias","Recursos naturales","Ambiente"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Colonia","Economía","Mapas","Derechos del niño"]},{"id":"ingles","name":"Inglés","topics":["Pasado simple","Descripciones","Preguntas","Vocabulario escolar"]}]},{"id":"5","label":"5° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Textos expositivos","Adverbios","Ortografía","Inferencias"]},{"id":"matematicas","name":"Matemáticas","topics":["Operaciones combinadas","Porcentajes","Áreas","Problemas"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Ecosistemas de Colombia","Fuerza y movimiento","La Tierra","Salud"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Independencia","República","Instituciones","Diversidad cultural"]},{"id":"ingles","name":"Inglés","topics":["Futuro","Conectores","Lectura de textos","Narración"]}]},{"id":"6","label":"6° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana","topics":["Ensayo","Gramática","Literatura colombiana","Lectura crítica"]},{"id":"matematicas","name":"Matemáticas","topics":["Enteros","Proporciones","Sólidos","Estadística"]},{"id":"naturales","name":"Ciencias Naturales","topics":["Reproducción","Electricidad","Cambios de la materia","Riesgos naturales"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Siglo XX colombiano","Constitución de 1991","Ciudadanía","Paz y convivencia"]},{"id":"ingles","name":"Inglés","topics":["Tiempos verbales","Escritura","Conversación","Comprensión auditiva"]}]}]'::jsonb),
  ('es', 'España', '[{"id":"1","label":"1° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Letras y sonidos","Sílabas","Lectura inicial","Escritura"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 100","Sumas y restas","Figuras","Series y patrones"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Seres vivos","El cuerpo","Los sentidos","El tiempo"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi familia","Mi pueblo o ciudad","Fiestas","Normas"]},{"id":"ingles","name":"Inglés","topics":["Saludos","Colores","Números","Familia"]}]},{"id":"2","label":"2° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Comprensión lectora","Sustantivos","B y V","Escritura de textos"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 1,000","Sumas llevando","Multiplicación inicial","El euro"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Plantas","Animales","El agua","Salud"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Mi comunidad autónoma","Oficios","Transportes","Paisajes"]},{"id":"ingles","name":"Inglés","topics":["El cuerpo","La escuela","Días y meses","Animales"]}]},{"id":"3","label":"3° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Verbos","Párrafos","Acentuación","Narrativa"]},{"id":"matematicas","name":"Matemáticas","topics":["Multiplicación","División","Fracciones","Medidas"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Ecosistemas","Materia","Nutrición","Universo"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Geografía de España","Hispania romana","Pueblos antiguos","Mapas"]},{"id":"ingles","name":"Inglés","topics":["Presente simple","La casa","El clima","Comida"]}]},{"id":"4","label":"4° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Pronombres","Puntuación","Textos expositivos","Redacción"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta millones","Fracciones","Decimales","Ángulos"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Cuerpo humano","Cadenas alimentarias","Energía","Medio ambiente"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Edad Media en España","Economía","Provincias","Derechos del niño"]},{"id":"ingles","name":"Inglés","topics":["Pasado simple","Descripciones","Rutinas","Preguntas"]}]},{"id":"5","label":"5° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Adverbios","Ortografía","Inferencias","Textos argumentativos"]},{"id":"matematicas","name":"Matemáticas","topics":["Operaciones combinadas","Porcentajes","Áreas","Problemas"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Fuerzas","La Tierra","Salud","Ecosistemas españoles"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Descubrimiento de América","Siglos XVI-XVIII","Instituciones","España en Europa"]},{"id":"ingles","name":"Inglés","topics":["Futuro","Conectores","Lectura","Narración"]}]},{"id":"6","label":"6° de Primaria","subjects":[{"id":"lengua","name":"Lengua Castellana y Literatura","topics":["Análisis gramatical","Ensayo","Literatura española","Lectura crítica"]},{"id":"matematicas","name":"Matemáticas","topics":["Enteros","Proporcionalidad","Sólidos","Estadística"]},{"id":"naturales","name":"Ciencias de la Naturaleza","topics":["Reproducción","Electricidad","Materia y cambios","Riesgos naturales"]},{"id":"sociales","name":"Ciencias Sociales","topics":["Siglo XIX","Siglo XX","Constitución de 1978","Ciudadanía europea"]},{"id":"ingles","name":"Inglés","topics":["Tiempos verbales","Escritura guiada","Conversación","Comprensión auditiva"]}]}]'::jsonb),
  ('us', 'Estados Unidos (español)', '[{"id":"1","label":"1° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Letras y sonidos","Sílabas","Lectura inicial","Escritura"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 100","Sumas y restas","Figuras","Patrones"]},{"id":"ciencias","name":"Ciencias","topics":["Seres vivos","El cuerpo","Los sentidos","El clima"]},{"id":"sociales","name":"Estudios Sociales","topics":["Mi familia","Mi comunidad","Símbolos de EE. UU.","Reglas"]},{"id":"esl","name":"Inglés (ESL)","topics":["Saludos","Colores","Números","Familia"]}]},{"id":"2","label":"2° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Comprensión lectora","Sustantivos","B y V","Escritura"]},{"id":"matematicas","name":"Matemáticas","topics":["Números hasta 1,000","Sumas y restas","Multiplicación inicial","Dinero"]},{"id":"ciencias","name":"Ciencias","topics":["Plantas","Animales","El agua","Salud"]},{"id":"sociales","name":"Estudios Sociales","topics":["Mi estado","Transportes","Oficios","Tradiciones"]},{"id":"esl","name":"Inglés (ESL)","topics":["El cuerpo","La escuela","Días y meses","Comida"]}]},{"id":"3","label":"3° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Verbos","Párrafos","La tilde","Narrativa"]},{"id":"matematicas","name":"Matemáticas","topics":["Multiplicación","División","Fracciones","Medidas"]},{"id":"ciencias","name":"Ciencias","topics":["Ecosistemas","Materia","Nutrición","Sistema solar"]},{"id":"sociales","name":"Estudios Sociales","topics":["Geografía de EE. UU.","Pueblos originarios","Colonización","Regiones"]},{"id":"esl","name":"Inglés (ESL)","topics":["Presente simple","La casa","El clima","Rutinas"]}]},{"id":"4","label":"4° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Pronombres","Puntuación","Expositivos","Redacción"]},{"id":"matematicas","name":"Matemáticas","topics":["Números grandes","Fracciones","Decimales","Ángulos"]},{"id":"ciencias","name":"Ciencias","topics":["Cuerpo humano","Cadenas alimentarias","Energía","Ambiente"]},{"id":"sociales","name":"Estudios Sociales","topics":["Independencia de EE. UU.","Gobierno","Mapas","Derechos"]},{"id":"esl","name":"Inglés (ESL)","topics":["Pasado simple","Descripciones","Preguntas","Vocabulario"]}]},{"id":"5","label":"5° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Adverbios","Ortografía","Inferencias","Argumentativos"]},{"id":"matematicas","name":"Matemáticas","topics":["Operaciones combinadas","Porcentajes","Áreas","Problemas"]},{"id":"ciencias","name":"Ciencias","topics":["Fuerza y movimiento","La Tierra","Salud","Ecosistemas"]},{"id":"sociales","name":"Estudios Sociales","topics":["Guerra Civil","Expansión","Instituciones","Inmigración"]},{"id":"esl","name":"Inglés (ESL)","topics":["Futuro","Conectores","Lectura","Narración"]}]},{"id":"6","label":"6° Grade","subjects":[{"id":"lengua","name":"Artes del Lenguaje","topics":["Gramática","Ensayo","Literatura latina en EE. UU.","Lectura crítica"]},{"id":"matematicas","name":"Matemáticas","topics":["Enteros","Proporciones","Sólidos","Estadística"]},{"id":"ciencias","name":"Ciencias","topics":["Reproducción","Electricidad","Materia","Fenómenos naturales"]},{"id":"sociales","name":"Estudios Sociales","topics":["Siglo XX","Derechos civiles","Constitución","Ciudadanía"]},{"id":"esl","name":"Inglés (ESL)","topics":["Tiempos verbales","Escritura","Conversación","Comprensión auditiva"]}]}]'::jsonb)
on conflict (country_code) do update
  set country_name = excluded.country_name,
      grades = excluded.grades;
