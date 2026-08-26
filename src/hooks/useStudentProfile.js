// Hook de perfiles de estudiante — MULTI-ESTUDIANTE por familia.
// - Fuente de verdad: Supabase (tabla `students`) cuando hay nube + login.
// - localStorage (prefijo evi_) actúa como caché offline: la app funciona
//   sin red y sincroniza al volver.
// - Migración: perfiles viejos guardados como `evi_profile` se convierten en
//   estudiantes al primer login.
import { useState, useCallback, useEffect, useRef } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';
import { supabase, isCloudConfigured } from '../lib/supabase';

export const DEFAULT_PROFILE = {
  name: '',
  age: null,
  avatar: '🦉',
  countryCode: null,   // ISO del país (define el currículo)
  gradeId: null,       // grado dentro del currículo del país
  pin: null,           // PIN de 4 dígitos; null = sin PIN (perfiles migrados)
  learningStyle: null, // 'visual' | 'auditivo' | 'kinestesico' | 'lector' | 'multisensorial'
  interests: [],
  strengths: [],
  weaknesses: [],
  createdAt: null,
  onboardingComplete: false,

  // ===== Necesidades y dificultades =====
  needsAssessment: {
    completed: false,
    readingDifficulty: null, // 'none' | 'mild' | 'moderate' | 'severe' (dislexia)
    mathDifficulty: null,    // 'none' | 'mild' | 'moderate' | 'severe' (discalculia)
    attentionType: null,     // 'typical' | 'adhd_inattentive' | 'adhd_hyperactive' | 'adhd_combined'
    autismTraits: null,      // 'none' | 'mild' | 'moderate' (TEA)
    sensorySensitivity: [],  // ['sound', 'light', 'touch', 'movement']
    processingSpeed: 'average', // 'slow' | 'average' | 'fast'
    memoryType: 'average',   // 'visual_strong' | 'auditory_strong' | 'kinesthetic_strong' | 'average'
    emotionalRegulation: 'typical', // 'typical' | 'needs_support' | 'intense'
  },

  // ===== Modelo pedagógico preferido =====
  pedagogicalModel: 'adaptive', // 'adaptive' | 'montessori' | 'flipped' | 'gamified' | 'udl' | 'multisensory'

  // ===== Configuración de accesibilidad =====
  accessibility: {
    highContrast: false,
    largeText: false,
    dyslexicFont: false,
    reduceMotion: false,
    reduceSound: false,
    showPictograms: false,
    sessionDuration: 15,     // minutos preferidos por sesión
    breakFrequency: 'medium', // 'often' (cada 5min) | 'medium' (cada 10min) | 'rarely' (cada 15min)
    pacing: 'self',          // 'self' | 'guided' | 'structured'
    positiveReinforcement: 'badges', // 'badges' | 'animations' | 'voice' | 'simple'
  },

  // ===== Historial emocional =====
  emotionalHistory: [], // { date, mood, energy, frustration, notes }
};

const AVATARS = ['🦉', '🦊', '🐢', '🦋', '🐼', '🦁', '🐰', '🐨', '🦄', '🐙', '🐸', '🐞'];

// Modelos pedagógicos disponibles
export const PEDAGOGICAL_MODELS = {
  adaptive: {
    id: 'adaptive',
    name: 'Adaptativo IA',
    description: 'La app elige automáticamente el mejor método para cada momento.',
    icon: '🤖',
    bestFor: ['Todos los estilos', 'Dificultades mixtas'],
  },
  montessori: {
    id: 'montessori',
    name: 'Montessori',
    description: 'Aprendizaje sensorial, autodirigido, con materiales manipulativos.',
    icon: '🌱',
    bestFor: ['Kinestésico', 'TDAH', 'Necesita movimiento'],
  },
  flipped: {
    id: 'flipped',
    name: 'Aula Invertida',
    description: 'Explora primero, luego practica con guía.',
    icon: '🔄',
    bestFor: ['Visual', 'Autónomo', 'Lector'],
  },
  gamified: {
    id: 'gamified',
    name: 'Gamificación',
    description: 'Misiones, niveles, recompensas y desafíos divertidos.',
    icon: '🎮',
    bestFor: ['Motivación baja', 'TDAH', 'Kinestésico'],
  },
  udl: {
    id: 'udl',
    name: 'Diseño Universal',
    description: 'Múltiples formas de presentar, expresar y comprometerse.',
    icon: '🌍',
    bestFor: ['Dificultades diversas', 'Inclusión'],
  },
  multisensory: {
    id: 'multisensory',
    name: 'Multi-sensorial',
    description: 'Ver, oír, tocar y moverse al mismo tiempo.',
    icon: '✨',
    bestFor: ['Dislexia', 'Discalculia', 'TEA'],
  },
};

// ---------------------------------------------------------------------------
// Mapeo perfil (app) <-> fila (tabla students de Supabase)
// Todo lo que no tiene columna propia viaja dentro de `needs` (jsonb).
// ---------------------------------------------------------------------------
const NO_CLOUD_PIN = '0000'; // la BD exige 4 dígitos; null local se guarda así

function profileToRow(p, familyId) {
  return {
    family_id: familyId,
    nombre: p.name,
    country_code: p.countryCode || 'do',
    grade_id: p.gradeId || '1',
    pin: p.pin || NO_CLOUD_PIN,
    avatar: p.avatar,
    needs: {
      age: p.age,
      learningStyle: p.learningStyle,
      interests: p.interests,
      strengths: p.strengths,
      weaknesses: p.weaknesses,
      onboardingComplete: p.onboardingComplete,
      createdAt: p.createdAt,
      needsAssessment: p.needsAssessment,
      pedagogicalModel: p.pedagogicalModel,
      accessibility: p.accessibility,
      emotionalHistory: p.emotionalHistory,
    },
  };
}

function rowToProfile(row) {
  const n = row.needs || {};
  return {
    ...DEFAULT_PROFILE,
    id: row.id,
    name: row.nombre,
    countryCode: row.country_code,
    gradeId: row.grade_id,
    pin: row.pin === NO_CLOUD_PIN ? null : row.pin,
    avatar: row.avatar,
    age: n.age ?? null,
    learningStyle: n.learningStyle ?? null,
    interests: n.interests || [],
    strengths: n.strengths || [],
    weaknesses: n.weaknesses || [],
    onboardingComplete: n.onboardingComplete ?? true,
    createdAt: n.createdAt || null,
    needsAssessment: { ...DEFAULT_PROFILE.needsAssessment, ...(n.needsAssessment || {}) },
    pedagogicalModel: n.pedagogicalModel || 'adaptive',
    accessibility: { ...DEFAULT_PROFILE.accessibility, ...(n.accessibility || {}) },
    emotionalHistory: n.emotionalHistory || [],
  };
}

const isLocalId = (id) => String(id).startsWith('local-');
const newLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Carga inicial desde caché + migración del perfil viejo (evi_profile)
function loadStudents() {
  const cached = getStorage('students', null);
  if (cached && cached.length > 0) return cached;

  // Migración: perfil único de la versión anterior → primer estudiante
  const legacy = getStorage('profile', null);
  if (legacy && legacy.name) {
    const migrated = {
      ...DEFAULT_PROFILE,
      ...legacy,
      needsAssessment: { ...DEFAULT_PROFILE.needsAssessment, ...(legacy.needsAssessment || {}) },
      accessibility: { ...DEFAULT_PROFILE.accessibility, ...(legacy.accessibility || {}) },
      id: newLocalId(),
      pin: null, // los perfiles viejos no tenían PIN: entran directo
    };
    setStorage('students', [migrated]);
    setStorage('active_student', migrated.id);
    removeStorage('profile'); // ya migrado
    return [migrated];
  }
  return [];
}

export function useStudentProfile(familyId) {
  const [students, setStudents] = useState(loadStudents);
  const [activeId, setActiveId] = useState(() => getStorage('active_student', null));
  const [draft, setDraft] = useState(() => ({ ...DEFAULT_PROFILE, id: newLocalId() }));
  const [syncing, setSyncing] = useState(false);
  const migratedRef = useRef(false);

  const useCloud = isCloudConfigured && familyId && !String(familyId).startsWith('demo-');

  // Perfil activo (mantiene la API anterior para el resto de la app)
  const profile = students.find((s) => s.id === activeId) || { ...DEFAULT_PROFILE };

  const persist = useCallback((next) => {
    setStudents(next);
    setStorage('students', next);
  }, []);

  // Recargar caché cuando llegan estudiantes por link/QR compartido
  useEffect(() => {
    const reload = () => setStudents(getStorage('students', []));
    window.addEventListener('evi-students-updated', reload);
    return () => window.removeEventListener('evi-students-updated', reload);
  }, []);

  // Subir un estudiante a la nube (fire-and-forget; la caché local ya quedó)
  const pushToCloud = useCallback(
    (student) => {
      if (!useCloud || isLocalId(student.id)) return;
      supabase
        .from('students')
        .update(profileToRow(student, familyId))
        .eq('id', student.id)
        .then(() => {});
    },
    [useCloud, familyId]
  );

  // ---- Sincronización nube → local y migración local → nube al primer login
  useEffect(() => {
    if (!useCloud || migratedRef.current) return;
    migratedRef.current = true;

    (async () => {
      setSyncing(true);
      try {
        // 1. Migrar estudiantes solo-locales a Supabase
        const current = getStorage('students', []);
        const merged = [...current];
        for (let i = 0; i < merged.length; i++) {
          if (!isLocalId(merged[i].id)) continue;
          const { data, error } = await supabase
            .from('students')
            .insert(profileToRow(merged[i], familyId))
            .select()
            .single();
          if (!error && data) merged[i] = rowToProfile(data);
        }

        // 2. Traer de la nube los que no estén en caché (otro dispositivo)
        const { data: rows } = await supabase
          .from('students')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: true });
        (rows || []).forEach((row) => {
          if (!merged.some((s) => s.id === row.id)) merged.push(rowToProfile(row));
        });

        persist(merged);
      } finally {
        setSyncing(false);
      }
    })();
  }, [useCloud, familyId, persist]);

  // -------------------------------------------------------------------------
  // Draft: estudiante en construcción durante el onboarding
  // -------------------------------------------------------------------------
  const updateDraft = useCallback((updates) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft({ ...DEFAULT_PROFILE, id: newLocalId() });
  }, []);

  // Crear estudiante: guarda local primero (offline-tolerant), luego nube
  const createStudent = useCallback(
    async (overrides = {}) => {
      const student = { ...draft, ...overrides, createdAt: draft.createdAt || Date.now() };
      let final = student;

      if (useCloud) {
        const { data, error } = await supabase
          .from('students')
          .insert(profileToRow(student, familyId))
          .select()
          .single();
        if (!error && data) final = rowToProfile(data);
      }

      const next = [...getStorage('students', students), final];
      persist(next);
      setActiveId(final.id);
      setStorage('active_student', final.id);
      resetDraft();
      return final;
    },
    [draft, useCloud, familyId, students, persist, resetDraft]
  );

  // -------------------------------------------------------------------------
  // Actualizaciones del perfil ACTIVO (API compatible con la versión anterior)
  // -------------------------------------------------------------------------
  const updateProfile = useCallback(
    (updates) => {
      setStudents((prev) => {
        const next = prev.map((s) => (s.id === activeId ? { ...s, ...updates } : s));
        setStorage('students', next);
        const updated = next.find((s) => s.id === activeId);
        if (updated) pushToCloud(updated);
        return next;
      });
    },
    [activeId, pushToCloud]
  );

  const setLearningStyle = useCallback((style) => {
    updateProfile({ learningStyle: style });
  }, [updateProfile]);

  const setPedagogicalModel = useCallback((model) => {
    updateProfile({ pedagogicalModel: model });
  }, [updateProfile]);

  const updateNeedsAssessment = useCallback(
    (updates) => {
      const current = students.find((s) => s.id === activeId);
      if (!current) return;
      updateProfile({ needsAssessment: { ...current.needsAssessment, ...updates } });
    },
    [students, activeId, updateProfile]
  );

  const updateAccessibility = useCallback(
    (updates) => {
      const current = students.find((s) => s.id === activeId);
      if (!current) return;
      updateProfile({ accessibility: { ...current.accessibility, ...updates } });
    },
    [students, activeId, updateProfile]
  );

  const addEmotionalCheckIn = useCallback(
    (checkIn) => {
      const current = students.find((s) => s.id === activeId);
      if (!current) return;
      updateProfile({
        emotionalHistory: [...current.emotionalHistory.slice(-30), { ...checkIn, date: Date.now() }],
      });
    },
    [students, activeId, updateProfile]
  );

  const addInterest = useCallback(
    (interest) => {
      const current = students.find((s) => s.id === activeId);
      if (!current || current.interests.includes(interest)) return;
      updateProfile({ interests: [...current.interests, interest] });
    },
    [students, activeId, updateProfile]
  );

  const completeOnboarding = useCallback(() => {
    updateProfile({ onboardingComplete: true, createdAt: Date.now() });
  }, [updateProfile]);

  const completeNeedsAssessment = useCallback(() => {
    updateNeedsAssessment({ completed: true });
  }, [updateNeedsAssessment]);

  // -------------------------------------------------------------------------
  // Multi-estudiante: selector con PIN
  // -------------------------------------------------------------------------
  const selectStudent = useCallback((id, pin) => {
    const student = getStorage('students', []).find((s) => s.id === id);
    if (!student) return false;
    // PIN '__remote__': perfil llegó por link/QR → verificar en el servidor (devuelve Promise)
    if (student.pin === '__remote__') {
      if (!isCloudConfigured) return false;
      return supabase
        .rpc('check_student_pin', { sid: id, pin_attempt: pin || '' })
        .then(({ data, error }) => {
          const ok = !error && data === true;
          if (ok) {
            setActiveId(id);
            setStorage('active_student', id);
          }
          return ok;
        });
    }
    if (student.pin && student.pin !== pin) return false;
    setActiveId(id);
    setStorage('active_student', id);
    return true;
  }, []);

  const lockStudent = useCallback(() => {
    setActiveId(null);
    removeStorage('active_student');
  }, []);

  const resetProfile = useCallback(() => {
    // Borra SOLO el estudiante activo (en la nube también, si aplica)
    const current = getStorage('students', []);
    const victim = current.find((s) => s.id === activeId);
    const next = current.filter((s) => s.id !== activeId);
    persist(next);
    setActiveId(null);
    removeStorage('active_student');
    if (useCloud && victim && !isLocalId(victim.id)) {
      supabase.from('students').delete().eq('id', victim.id).then(() => {});
    }
  }, [activeId, useCloud, persist]);

  // Helper: determinar si el niño necesita adaptaciones especiales
  const hasSpecialNeeds = useCallback(() => {
    const n = profile.needsAssessment;
    return (
      n.readingDifficulty !== 'none' && n.readingDifficulty !== null ||
      n.mathDifficulty !== 'none' && n.mathDifficulty !== null ||
      n.attentionType !== 'typical' && n.attentionType !== null ||
      n.autismTraits !== 'none' && n.autismTraits !== null ||
      n.sensorySensitivity.length > 0 ||
      n.processingSpeed === 'slow' ||
      n.emotionalRegulation !== 'typical'
    );
  }, [profile.needsAssessment]);

  // Helper: obtener adaptaciones recomendadas basadas en necesidades
  const getRecommendedAdaptations = useCallback(() => {
    const n = profile.needsAssessment;
    const adaptations = [];

    if (n.readingDifficulty === 'moderate' || n.readingDifficulty === 'severe') {
      adaptations.push({ type: 'font', value: 'opendyslexic', reason: 'Dislexia detectada' });
      adaptations.push({ type: 'spacing', value: 'wide', reason: 'Mejor lectura' });
      adaptations.push({ type: 'pictograms', value: true, reason: 'Apoyo visual' });
    }
    if (n.mathDifficulty === 'moderate' || n.mathDifficulty === 'severe') {
      adaptations.push({ type: 'manipulatives', value: true, reason: 'Discalculia: manipulativos' });
      adaptations.push({ type: 'abstract_delay', value: true, reason: 'Evitar abstracción temprana' });
    }
    if (n.attentionType && n.attentionType.startsWith('adhd')) {
      adaptations.push({ type: 'session_duration', value: 10, reason: 'TDAH: sesiones cortas' });
      adaptations.push({ type: 'movement_breaks', value: 'often', reason: 'Movimiento frecuente' });
      adaptations.push({ type: 'reinforcement', value: 'immediate', reason: 'Recompensas inmediatas' });
    }
    if (n.autismTraits && n.autismTraits !== 'none') {
      adaptations.push({ type: 'routine', value: 'structured', reason: 'TEA: rutinas claras' });
      adaptations.push({ type: 'predictability', value: 'high', reason: 'Predecibilidad' });
      adaptations.push({ type: 'sensory_reduce', value: true, reason: 'Reducir estimulación' });
    }
    if (n.sensorySensitivity.includes('light')) {
      adaptations.push({ type: 'contrast', value: 'soft', reason: 'Sensibilidad a la luz' });
    }
    if (n.processingSpeed === 'slow') {
      adaptations.push({ type: 'pacing', value: 'slow', reason: 'Procesamiento lento' });
      adaptations.push({ type: 'wait_time', value: 'extended', reason: 'Más tiempo para responder' });
    }
    if (n.emotionalRegulation === 'needs_support' || n.emotionalRegulation === 'intense') {
      adaptations.push({ type: 'emotional_checkin', value: 'frequent', reason: 'Regulación emocional' });
      adaptations.push({ type: 'positive_only', value: true, reason: 'Refuerzo positivo' });
    }

    return adaptations;
  }, [profile.needsAssessment]);

  return {
    // Perfil activo (API compatible)
    profile,
    updateProfile,
    setLearningStyle,
    setPedagogicalModel,
    updateNeedsAssessment,
    updateAccessibility,
    addEmotionalCheckIn,
    addInterest,
    completeOnboarding,
    completeNeedsAssessment,
    resetProfile,
    avatars: AVATARS,
    pedagogicalModels: PEDAGOGICAL_MODELS,
    hasSpecialNeeds,
    getRecommendedAdaptations,
    // Multi-estudiante
    students,
    activeId,
    selectStudent,
    lockStudent,
    syncing,
    // Onboarding (borrador)
    draft,
    updateDraft,
    resetDraft,
    createStudent,
  };
}
