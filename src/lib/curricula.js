// Currículos por país — FALLBACK LOCAL.
// Espejo de la tabla `countries_curricula` (semilla en supabase/schema.sql).
// La app usa la BD cuando hay Supabase configurado; si no, usa esta constante.
// Estructura: { code, name, flag, grades: [{ id, label, subjects: [{ id, name, topics[] }] }] }

const GRADES_6 = ['1', '2', '3', '4', '5', '6'];

// Helper: construye grados con las mismas materias y temas por grado
const buildGrades = (labelSuffix, subjectsByGrade) =>
  GRADES_6.map((g, i) => ({
    id: g,
    label: `${g}° ${labelSuffix}`,
    subjects: subjectsByGrade[i],
  }));

const s = (id, name, topics) => ({ id, name, topics });

export const COUNTRIES_CURRICULA = [
  {
    code: 'do',
    name: 'República Dominicana',
    flag: '🇩🇴',
    grades: buildGrades('de Primaria', [
      [
        s('lengua', 'Lengua Española', ['Letras y sonidos', 'Sílabas', 'Palabras y oraciones', 'Lectura de cuentos cortos']),
        s('matematicas', 'Matemáticas', ['Números hasta 100', 'Sumas y restas', 'Figuras geométricas', 'Medidas sencillas']),
        s('naturales', 'Ciencias Naturales', ['Los seres vivos', 'El cuerpo humano', 'Los sentidos', 'El tiempo atmosférico']),
        s('sociales', 'Ciencias Sociales', ['Mi familia', 'Mi comunidad', 'Símbolos patrios', 'Normas de convivencia']),
        s('ingles', 'Inglés', ['Saludos', 'Colores y números', 'La familia', 'Animales']),
      ],
      [
        s('lengua', 'Lengua Española', ['Lectura comprensiva', 'Uso de la b/v', 'Sustantivos y adjetivos', 'Escritura de oraciones']),
        s('matematicas', 'Matemáticas', ['Números hasta 1,000', 'Sumas y restas llevando', 'Introducción a la multiplicación', 'El reloj y el dinero']),
        s('naturales', 'Ciencias Naturales', ['Plantas', 'Animales y hábitats', 'El agua', 'Salud e higiene']),
        s('sociales', 'Ciencias Sociales', ['Mi provincia', 'Medios de transporte', 'Oficios y profesiones', 'Tradiciones dominicanas']),
        s('ingles', 'Inglés', ['Partes del cuerpo', 'La escuela', 'Días y meses', 'Comida']),
      ],
      [
        s('lengua', 'Lengua Española', ['Comprensión lectora', 'Verbos', 'Párrafos', 'La tilde']),
        s('matematicas', 'Matemáticas', ['Multiplicación', 'División', 'Fracciones sencillas', 'Perímetros']),
        s('naturales', 'Ciencias Naturales', ['Ecosistemas', 'Materia y energía', 'Nutrición', 'El sistema solar']),
        s('sociales', 'Ciencias Sociales', ['Geografía de RD', 'Taínos', 'Descubrimiento de América', 'Regiones del país']),
        s('ingles', 'Inglés', ['Presente simple', 'La casa', 'El clima', 'Rutinas diarias']),
      ],
      [
        s('lengua', 'Lengua Española', ['Textos narrativos', 'Pronombres', 'Signos de puntuación', 'Redacción de párrafos']),
        s('matematicas', 'Matemáticas', ['Números hasta millones', 'Fracciones', 'Decimales', 'Ángulos']),
        s('naturales', 'Ciencias Naturales', ['Cuerpo humano: sistemas', 'Cadena alimentaria', 'Recursos naturales', 'Conservación ambiental']),
        s('sociales', 'Ciencias Sociales', ['Historia colonial', 'Economía dominicana', 'Mapas y coordenadas', 'Derechos del niño']),
        s('ingles', 'Inglés', ['Pasado simple', 'Descripciones', 'Preguntas y respuestas', 'Vocabulario escolar']),
      ],
      [
        s('lengua', 'Lengua Española', ['Textos expositivos', 'Adverbios', 'Ortografía', 'Comprensión inferencial']),
        s('matematicas', 'Matemáticas', ['Operaciones combinadas', 'Fracciones y decimales', 'Porcentajes', 'Áreas']),
        s('naturales', 'Ciencias Naturales', ['Ecosistemas dominicanos', 'Fuerza y movimiento', 'La Tierra y sus capas', 'Salud integral']),
        s('sociales', 'Ciencias Sociales', ['Independencia nacional', 'Trujillo y democracia', 'Instituciones del Estado', 'Migración']),
        s('ingles', 'Inglés', ['Futuro simple', 'Narración de eventos', 'Conectores', 'Lectura de textos cortos']),
      ],
      [
        s('lengua', 'Lengua Española', ['Ensayo corto', 'Análisis gramatical', 'Literatura dominicana', 'Comprensión crítica']),
        s('matematicas', 'Matemáticas', ['Números enteros', 'Razones y proporciones', 'Geometría: sólidos', 'Estadística básica']),
        s('naturales', 'Ciencias Naturales', ['Reproducción', 'Electricidad', 'Cambios de la materia', 'Desastres naturales']),
        s('sociales', 'Ciencias Sociales', ['Restauración y anexión', 'Constitución dominicana', 'Relaciones internacionales', 'Ciudadanía']),
        s('ingles', 'Inglés', ['Tiempos verbales', 'Escritura guiada', 'Conversación', 'Comprensión auditiva']),
      ],
    ]),
  },
  {
    code: 'mx',
    name: 'México',
    flag: '🇲🇽',
    grades: buildGrades('de Primaria', [
      [
        s('espanol', 'Español', ['Letras y sonidos', 'Sílabas', 'Lectura inicial', 'Escritura de palabras']),
        s('matematicas', 'Matemáticas', ['Números hasta 100', 'Sumas y restas', 'Figuras', 'Comparar cantidades']),
        s('conocimiento', 'Conocimiento del Medio', ['Mi cuerpo', 'Mi familia', 'Mi escuela', 'La naturaleza']),
        s('civica', 'Formación Cívica y Ética', ['Normas', 'Emociones', 'Respeto', 'Mi identidad']),
        s('ingles', 'Inglés', ['Saludos', 'Colores', 'Números', 'Familia']),
      ],
      [
        s('espanol', 'Español', ['Comprensión lectora', 'Sustantivos y adjetivos', 'Uso de la b/v', 'Escritura de textos']),
        s('matematicas', 'Matemáticas', ['Números hasta 1,000', 'Sumas y restas', 'Multiplicación inicial', 'El dinero']),
        s('conocimiento', 'Conocimiento del Medio', ['Seres vivos', 'El clima', 'Mi localidad', 'Cuidado del ambiente']),
        s('civica', 'Formación Cívica y Ética', ['Derechos', 'Convivencia', 'Cuidado personal', 'Valores']),
        s('ingles', 'Inglés', ['El cuerpo', 'La escuela', 'Días y meses', 'Animales']),
      ],
      [
        s('espanol', 'Español', ['Verbos', 'Párrafos', 'La tilde', 'Textos narrativos']),
        s('matematicas', 'Matemáticas', ['Multiplicación', 'División', 'Fracciones', 'Medición']),
        s('naturales', 'Ciencias Naturales', ['Ecosistemas', 'El sistema solar', 'Nutrición', 'Materia']),
        s('entidad', 'La Entidad donde Vivo', ['Geografía de mi estado', 'Historia local', 'Tradiciones', 'Economía local']),
        s('ingles', 'Inglés', ['Presente simple', 'La casa', 'El clima', 'Comida']),
      ],
      [
        s('espanol', 'Español', ['Pronombres', 'Signos de puntuación', 'Textos expositivos', 'Redacción']),
        s('matematicas', 'Matemáticas', ['Números grandes', 'Fracciones', 'Decimales', 'Ángulos']),
        s('naturales', 'Ciencias Naturales', ['Sistemas del cuerpo', 'Cadenas alimentarias', 'Recursos naturales', 'Energía']),
        s('geografia', 'Geografía', ['México en el mundo', 'Relieve y climas', 'Mapas', 'Regiones naturales']),
        s('ingles', 'Inglés', ['Pasado simple', 'Descripciones', 'Rutinas', 'Preguntas']),
      ],
      [
        s('espanol', 'Español', ['Adverbios', 'Ortografía', 'Comprensión inferencial', 'Textos argumentativos']),
        s('matematicas', 'Matemáticas', ['Operaciones combinadas', 'Porcentajes', 'Áreas y perímetros', 'Problemas']),
        s('naturales', 'Ciencias Naturales', ['Fuerza y movimiento', 'La Tierra', 'Salud', 'Ecosistemas de México']),
        s('historia', 'Historia', ['México prehispánico', 'La Conquista', 'La Independencia', 'Virreinato']),
        s('ingles', 'Inglés', ['Futuro', 'Conectores', 'Lectura', 'Narración']),
      ],
      [
        s('espanol', 'Español', ['Análisis gramatical', 'Ensayo corto', 'Literatura mexicana', 'Comprensión crítica']),
        s('matematicas', 'Matemáticas', ['Números con signo', 'Proporcionalidad', 'Sólidos', 'Estadística']),
        s('naturales', 'Ciencias Naturales', ['Electricidad', 'Cambios de la materia', 'Reproducción', 'Desastres naturales']),
        s('historia', 'Historia', ['Reforma', 'Revolución mexicana', 'México contemporáneo', 'Constitución']),
        s('ingles', 'Inglés', ['Tiempos verbales', 'Escritura guiada', 'Conversación', 'Comprensión auditiva']),
      ],
    ]),
  },
  {
    code: 'co',
    name: 'Colombia',
    flag: '🇨🇴',
    grades: buildGrades('de Primaria', [
      [
        s('lengua', 'Lengua Castellana', ['Letras y sonidos', 'Sílabas', 'Palabras y oraciones', 'Cuentos cortos']),
        s('matematicas', 'Matemáticas', ['Números hasta 100', 'Sumas y restas', 'Figuras geométricas', 'Comparar cantidades']),
        s('naturales', 'Ciencias Naturales', ['Los seres vivos', 'El cuerpo', 'Los sentidos', 'El clima']),
        s('sociales', 'Ciencias Sociales', ['Mi familia', 'Mi comunidad', 'Símbolos patrios', 'Normas']),
        s('ingles', 'Inglés', ['Saludos', 'Colores y números', 'Familia', 'Animales']),
      ],
      [
        s('lengua', 'Lengua Castellana', ['Comprensión lectora', 'Sustantivos', 'Uso de b/v', 'Escritura']),
        s('matematicas', 'Matemáticas', ['Números hasta 1,000', 'Sumas y restas', 'Multiplicación inicial', 'El dinero']),
        s('naturales', 'Ciencias Naturales', ['Plantas', 'Animales', 'El agua', 'Higiene']),
        s('sociales', 'Ciencias Sociales', ['Mi departamento', 'Transportes', 'Oficios', 'Tradiciones']),
        s('ingles', 'Inglés', ['El cuerpo', 'La escuela', 'Días y meses', 'Comida']),
      ],
      [
        s('lengua', 'Lengua Castellana', ['Verbos', 'Párrafos', 'La tilde', 'Comprensión lectora']),
        s('matematicas', 'Matemáticas', ['Multiplicación', 'División', 'Fracciones', 'Medidas']),
        s('naturales', 'Ciencias Naturales', ['Ecosistemas', 'Materia', 'Nutrición', 'Sistema solar']),
        s('sociales', 'Ciencias Sociales', ['Geografía de Colombia', 'Pueblos indígenas', 'Descubrimiento', 'Regiones']),
        s('ingles', 'Inglés', ['Presente simple', 'La casa', 'El clima', 'Rutinas']),
      ],
      [
        s('lengua', 'Lengua Castellana', ['Narrativa', 'Pronombres', 'Puntuación', 'Redacción']),
        s('matematicas', 'Matemáticas', ['Números hasta millones', 'Fracciones', 'Decimales', 'Ángulos']),
        s('naturales', 'Ciencias Naturales', ['Sistemas del cuerpo', 'Cadenas alimentarias', 'Recursos naturales', 'Ambiente']),
        s('sociales', 'Ciencias Sociales', ['Colonia', 'Economía', 'Mapas', 'Derechos del niño']),
        s('ingles', 'Inglés', ['Pasado simple', 'Descripciones', 'Preguntas', 'Vocabulario escolar']),
      ],
      [
        s('lengua', 'Lengua Castellana', ['Textos expositivos', 'Adverbios', 'Ortografía', 'Inferencias']),
        s('matematicas', 'Matemáticas', ['Operaciones combinadas', 'Porcentajes', 'Áreas', 'Problemas']),
        s('naturales', 'Ciencias Naturales', ['Ecosistemas de Colombia', 'Fuerza y movimiento', 'La Tierra', 'Salud']),
        s('sociales', 'Ciencias Sociales', ['Independencia', 'República', 'Instituciones', 'Diversidad cultural']),
        s('ingles', 'Inglés', ['Futuro', 'Conectores', 'Lectura de textos', 'Narración']),
      ],
      [
        s('lengua', 'Lengua Castellana', ['Ensayo', 'Gramática', 'Literatura colombiana', 'Lectura crítica']),
        s('matematicas', 'Matemáticas', ['Enteros', 'Proporciones', 'Sólidos', 'Estadística']),
        s('naturales', 'Ciencias Naturales', ['Reproducción', 'Electricidad', 'Cambios de la materia', 'Riesgos naturales']),
        s('sociales', 'Ciencias Sociales', ['Siglo XX colombiano', 'Constitución de 1991', 'Ciudadanía', 'Paz y convivencia']),
        s('ingles', 'Inglés', ['Tiempos verbales', 'Escritura', 'Conversación', 'Comprensión auditiva']),
      ],
    ]),
  },
  {
    code: 'es',
    name: 'España',
    flag: '🇪🇸',
    grades: buildGrades('de Primaria', [
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Letras y sonidos', 'Sílabas', 'Lectura inicial', 'Escritura']),
        s('matematicas', 'Matemáticas', ['Números hasta 100', 'Sumas y restas', 'Figuras', 'Series y patrones']),
        s('naturales', 'Ciencias de la Naturaleza', ['Seres vivos', 'El cuerpo', 'Los sentidos', 'El tiempo']),
        s('sociales', 'Ciencias Sociales', ['Mi familia', 'Mi pueblo o ciudad', 'Fiestas', 'Normas']),
        s('ingles', 'Inglés', ['Saludos', 'Colores', 'Números', 'Familia']),
      ],
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Comprensión lectora', 'Sustantivos', 'B y V', 'Escritura de textos']),
        s('matematicas', 'Matemáticas', ['Números hasta 1,000', 'Sumas llevando', 'Multiplicación inicial', 'El euro']),
        s('naturales', 'Ciencias de la Naturaleza', ['Plantas', 'Animales', 'El agua', 'Salud']),
        s('sociales', 'Ciencias Sociales', ['Mi comunidad autónoma', 'Oficios', 'Transportes', 'Paisajes']),
        s('ingles', 'Inglés', ['El cuerpo', 'La escuela', 'Días y meses', 'Animales']),
      ],
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Verbos', 'Párrafos', 'Acentuación', 'Narrativa']),
        s('matematicas', 'Matemáticas', ['Multiplicación', 'División', 'Fracciones', 'Medidas']),
        s('naturales', 'Ciencias de la Naturaleza', ['Ecosistemas', 'Materia', 'Nutrición', 'Universo']),
        s('sociales', 'Ciencias Sociales', ['Geografía de España', 'Hispania romana', 'Pueblos antiguos', 'Mapas']),
        s('ingles', 'Inglés', ['Presente simple', 'La casa', 'El clima', 'Comida']),
      ],
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Pronombres', 'Puntuación', 'Textos expositivos', 'Redacción']),
        s('matematicas', 'Matemáticas', ['Números hasta millones', 'Fracciones', 'Decimales', 'Ángulos']),
        s('naturales', 'Ciencias de la Naturaleza', ['Cuerpo humano', 'Cadenas alimentarias', 'Energía', 'Medio ambiente']),
        s('sociales', 'Ciencias Sociales', ['Edad Media en España', 'Economía', 'Provincias', 'Derechos del niño']),
        s('ingles', 'Inglés', ['Pasado simple', 'Descripciones', 'Rutinas', 'Preguntas']),
      ],
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Adverbios', 'Ortografía', 'Inferencias', 'Textos argumentativos']),
        s('matematicas', 'Matemáticas', ['Operaciones combinadas', 'Porcentajes', 'Áreas', 'Problemas']),
        s('naturales', 'Ciencias de la Naturaleza', ['Fuerzas', 'La Tierra', 'Salud', 'Ecosistemas españoles']),
        s('sociales', 'Ciencias Sociales', ['Descubrimiento de América', 'Siglos XVI-XVIII', 'Instituciones', 'España en Europa']),
        s('ingles', 'Inglés', ['Futuro', 'Conectores', 'Lectura', 'Narración']),
      ],
      [
        s('lengua', 'Lengua Castellana y Literatura', ['Análisis gramatical', 'Ensayo', 'Literatura española', 'Lectura crítica']),
        s('matematicas', 'Matemáticas', ['Enteros', 'Proporcionalidad', 'Sólidos', 'Estadística']),
        s('naturales', 'Ciencias de la Naturaleza', ['Reproducción', 'Electricidad', 'Materia y cambios', 'Riesgos naturales']),
        s('sociales', 'Ciencias Sociales', ['Siglo XIX', 'Siglo XX', 'Constitución de 1978', 'Ciudadanía europea']),
        s('ingles', 'Inglés', ['Tiempos verbales', 'Escritura guiada', 'Conversación', 'Comprensión auditiva']),
      ],
    ]),
  },
  {
    code: 'us',
    name: 'Estados Unidos (español)',
    flag: '🇺🇸',
    grades: buildGrades('Grade', [
      [
        s('lengua', 'Artes del Lenguaje', ['Letras y sonidos', 'Sílabas', 'Lectura inicial', 'Escritura']),
        s('matematicas', 'Matemáticas', ['Números hasta 100', 'Sumas y restas', 'Figuras', 'Patrones']),
        s('ciencias', 'Ciencias', ['Seres vivos', 'El cuerpo', 'Los sentidos', 'El clima']),
        s('sociales', 'Estudios Sociales', ['Mi familia', 'Mi comunidad', 'Símbolos de EE. UU.', 'Reglas']),
        s('esl', 'Inglés (ESL)', ['Saludos', 'Colores', 'Números', 'Familia']),
      ],
      [
        s('lengua', 'Artes del Lenguaje', ['Comprensión lectora', 'Sustantivos', 'B y V', 'Escritura']),
        s('matematicas', 'Matemáticas', ['Números hasta 1,000', 'Sumas y restas', 'Multiplicación inicial', 'Dinero']),
        s('ciencias', 'Ciencias', ['Plantas', 'Animales', 'El agua', 'Salud']),
        s('sociales', 'Estudios Sociales', ['Mi estado', 'Transportes', 'Oficios', 'Tradiciones']),
        s('esl', 'Inglés (ESL)', ['El cuerpo', 'La escuela', 'Días y meses', 'Comida']),
      ],
      [
        s('lengua', 'Artes del Lenguaje', ['Verbos', 'Párrafos', 'La tilde', 'Narrativa']),
        s('matematicas', 'Matemáticas', ['Multiplicación', 'División', 'Fracciones', 'Medidas']),
        s('ciencias', 'Ciencias', ['Ecosistemas', 'Materia', 'Nutrición', 'Sistema solar']),
        s('sociales', 'Estudios Sociales', ['Geografía de EE. UU.', 'Pueblos originarios', 'Colonización', 'Regiones']),
        s('esl', 'Inglés (ESL)', ['Presente simple', 'La casa', 'El clima', 'Rutinas']),
      ],
      [
        s('lengua', 'Artes del Lenguaje', ['Pronombres', 'Puntuación', 'Expositivos', 'Redacción']),
        s('matematicas', 'Matemáticas', ['Números grandes', 'Fracciones', 'Decimales', 'Ángulos']),
        s('ciencias', 'Ciencias', ['Cuerpo humano', 'Cadenas alimentarias', 'Energía', 'Ambiente']),
        s('sociales', 'Estudios Sociales', ['Independencia de EE. UU.', 'Gobierno', 'Mapas', 'Derechos']),
        s('esl', 'Inglés (ESL)', ['Pasado simple', 'Descripciones', 'Preguntas', 'Vocabulario']),
      ],
      [
        s('lengua', 'Artes del Lenguaje', ['Adverbios', 'Ortografía', 'Inferencias', 'Argumentativos']),
        s('matematicas', 'Matemáticas', ['Operaciones combinadas', 'Porcentajes', 'Áreas', 'Problemas']),
        s('ciencias', 'Ciencias', ['Fuerza y movimiento', 'La Tierra', 'Salud', 'Ecosistemas']),
        s('sociales', 'Estudios Sociales', ['Guerra Civil', 'Expansión', 'Instituciones', 'Inmigración']),
        s('esl', 'Inglés (ESL)', ['Futuro', 'Conectores', 'Lectura', 'Narración']),
      ],
      [
        s('lengua', 'Artes del Lenguaje', ['Gramática', 'Ensayo', 'Literatura latina en EE. UU.', 'Lectura crítica']),
        s('matematicas', 'Matemáticas', ['Enteros', 'Proporciones', 'Sólidos', 'Estadística']),
        s('ciencias', 'Ciencias', ['Reproducción', 'Electricidad', 'Materia', 'Fenómenos naturales']),
        s('sociales', 'Estudios Sociales', ['Siglo XX', 'Derechos civiles', 'Constitución', 'Ciudadanía']),
        s('esl', 'Inglés (ESL)', ['Tiempos verbales', 'Escritura', 'Conversación', 'Comprensión auditiva']),
      ],
    ]),
  },
];

// Helpers de consulta
export const getCountry = (code) => COUNTRIES_CURRICULA.find((c) => c.code === code) || null;

export const getGradesForCountry = (code) => getCountry(code)?.grades || [];

export const getGrade = (countryCode, gradeId) =>
  getGradesForCountry(countryCode).find((g) => g.id === String(gradeId)) || null;
