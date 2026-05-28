import { useState, useCallback } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const DEFAULT_PROFILE = {
  name: '',
  age: null,
  avatar: '🦉',
  learningStyle: null, // 'visual' | 'auditivo' | 'kinestesico' | 'lector' | 'multisensorial'
  interests: [],
  strengths: [],
  weaknesses: [],
  createdAt: null,
  onboardingComplete: false,

  // ===== NUEVO: Necesidades y dificultades =====
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

  // ===== NUEVO: Modelo pedagógico preferido =====
  pedagogicalModel: 'adaptive', // 'adaptive' | 'montessori' | 'flipped' | 'gamified' | 'udl' | 'multisensory'

  // ===== NUEVO: Configuración de accesibilidad =====
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

  // ===== NUEVO: Historial emocional =====
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

export function useStudentProfile() {
  const [profile, setProfile] = useState(() => getStorage('profile', DEFAULT_PROFILE));

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const setLearningStyle = useCallback((style) => {
    updateProfile({ learningStyle: style });
  }, [updateProfile]);

  const setPedagogicalModel = useCallback((model) => {
    updateProfile({ pedagogicalModel: model });
  }, [updateProfile]);

  const updateNeedsAssessment = useCallback((updates) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        needsAssessment: { ...prev.needsAssessment, ...updates },
      };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const updateAccessibility = useCallback((updates) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        accessibility: { ...prev.accessibility, ...updates },
      };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const addEmotionalCheckIn = useCallback((checkIn) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        emotionalHistory: [...prev.emotionalHistory.slice(-30), { ...checkIn, date: Date.now() }],
      };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const addInterest = useCallback((interest) => {
    setProfile((prev) => {
      if (prev.interests.includes(interest)) return prev;
      const next = { ...prev, interests: [...prev.interests, interest] };
      setStorage('profile', next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    updateProfile({ onboardingComplete: true, createdAt: Date.now() });
  }, [updateProfile]);

  const completeNeedsAssessment = useCallback(() => {
    updateNeedsAssessment({ completed: true });
  }, [updateNeedsAssessment]);

  const resetProfile = useCallback(() => {
    setStorage('profile', DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
  }, []);

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
  };
}
