import { useMemo, useCallback } from 'react';
import { LESSONS, getLesson } from '../data/lessons';
import { SUBJECTS } from '../data/subjects';

/**
 * Motor Adaptativo 2.0
 * Selecciona lecciones, ajusta dificultad y personaliza contenido
 * según el perfil completo del estudiante incluyendo:
 * - Estilo de aprendizaje VARK
 * - Necesidades especiales (dislexia, discalculia, TDAH, TEA)
 * - Modelo pedagógico preferido
 * - Configuración de accesibilidad
 * - Historial emocional
 */
export function useAdaptiveEngine(profile, progress) {
  const learningStyle = profile.learningStyle || 'visual';
  const needs = profile.needsAssessment || {};
  const model = profile.pedagogicalModel || 'adaptive';
  const accessibility = profile.accessibility || {};
  const emotionalHistory = profile.emotionalHistory || [];

  const adaptiveState = useMemo(() => {
    const state = {
      availableLessons: [],
      recommendedPath: [],
      difficultyAdjustment: 0,
      weakAreas: [],
      strongAreas: [],
      suggestedStyle: learningStyle,
      // NUEVO: metadatos adaptativos
      sessionMaxDuration: accessibility.sessionDuration || 15,
      breakFrequency: accessibility.breakFrequency || 'medium',
      needsReinforcement: false,
      emotionalState: 'neutral',
      pedagogicalStrategy: model,
      adaptations: [],
    };

    // Detectar estado emocional reciente
    const recentEmotions = emotionalHistory.slice(-3);
    if (recentEmotions.length > 0) {
      const avgFrustration = recentEmotions.reduce((s, e) => s + (e.frustration || 0), 0) / recentEmotions.length;
      if (avgFrustration > 3) {
        state.emotionalState = 'frustrated';
        state.needsReinforcement = true;
        state.difficultyAdjustment = -1;
        state.adaptations.push('reduce_difficulty');
        state.adaptations.push('extra_encouragement');
      } else if (avgFrustration > 1.5) {
        state.emotionalState = 'struggling';
        state.adaptations.push('moderate_support');
      }
    }

    // Ajustar duración de sesión según necesidades
    if (needs.attentionType?.startsWith('adhd')) {
      state.sessionMaxDuration = Math.min(state.sessionMaxDuration, 10);
      state.breakFrequency = 'often';
      state.adaptations.push('short_sessions');
      state.adaptations.push('movement_breaks');
    }
    if (needs.processingSpeed === 'slow') {
      state.sessionMaxDuration = Math.min(state.sessionMaxDuration, 12);
      state.adaptations.push('extended_wait_time');
      state.adaptations.push('repeat_instructions');
    }
    if (needs.emotionalRegulation === 'intense') {
      state.adaptations.push('emotional_checkin_before');
      state.adaptations.push('calm_feedback_only');
    }

    // Aplicar modelo pedagógico
    switch (model) {
      case 'montessori':
        state.adaptations.push('self_paced');
        state.adaptations.push('manipulatives_first');
        state.adaptations.push('discovery_learning');
        break;
      case 'gamified':
        state.adaptations.push('missions_not_lessons');
        state.adaptations.push('immediate_rewards');
        state.adaptations.push('streak_bonus');
        break;
      case 'multisensory':
        state.adaptations.push('multi_modal');
        state.adaptations.push('simultaneous_senses');
        state.suggestedStyle = 'multisensorial';
        break;
      case 'udl':
        state.adaptations.push('multiple_representations');
        state.adaptations.push('choice_in_engagement');
        break;
      case 'flipped':
        state.adaptations.push('explore_first');
        state.adaptations.push('practice_after');
        break;
      default:
        // adaptive: dejar que el motor decida
        break;
    }

    // Adaptaciones específicas para dificultades
    if (needs.readingDifficulty === 'moderate' || needs.readingDifficulty === 'severe') {
      state.adaptations.push('dyslexic_font');
      state.adaptations.push('increased_spacing');
      state.adaptations.push('pictogram_support');
      state.adaptations.push('audio_support');
      // Priorizar visual y auditivo sobre lector
      if (learningStyle === 'lector') {
        state.suggestedStyle = 'multisensorial';
      }
    }
    if (needs.mathDifficulty === 'moderate' || needs.mathDifficulty === 'severe') {
      state.adaptations.push('concrete_manipulatives');
      state.adaptations.push('avoid_abstract');
      state.adaptations.push('number_lines');
      state.difficultyAdjustment = -1;
    }
    if (needs.autismTraits === 'moderate') {
      state.adaptations.push('visual_schedule');
      state.adaptations.push('predictable_structure');
      state.adaptations.push('reduced_stimulation');
      state.adaptations.push('clear_transitions');
    }
    if (needs.sensorySensitivity?.includes('sound')) {
      state.adaptations.push('no_audio_effects');
    }
    if (needs.sensorySensitivity?.includes('light')) {
      state.adaptations.push('soft_contrast');
    }

    // Identify weak and strong areas
    SUBJECTS.forEach((subject) => {
      const subjProg = progress.subjectProgress[subject.id] || {};
      const totalLevels = subject.levels.length;
      const completed = Object.values(subjProg).reduce((a, b) => a + b, 0);
      const ratio = completed / (totalLevels * 2);

      if (ratio < 0.3) state.weakAreas.push(subject.id);
      else if (ratio > 0.7) state.strongAreas.push(subject.id);
    });

    // Build available lessons for each subject
    SUBJECTS.forEach((subject) => {
      const subjProg = progress.subjectProgress[subject.id] || {};
      subject.levels.forEach((levelId, levelIdx) => {
        const lessonCount = getLessonCount(subject.id, levelId);
        if (lessonCount === 0) return; // sin lecciones aún para este nivel

        // Progresión secuencial por nivel: el nivel 0 siempre está desbloqueado;
        // los siguientes se desbloquean cuando el anterior tiene al menos 1
        // sesión aprobada. Así la niña avanza nivel a nivel, como en una escuela
        // real, y siempre encuentra contenido nuevo al subir de nivel.
        if (levelIdx > 0) {
          const prevLevelId = subject.levels[levelIdx - 1];
          const prevCompleted = subjProg[prevLevelId] || 0;
          if (prevCompleted < 1) return; // nivel aún bloqueado
        }

        const completed = subjProg[levelId] || 0;
        // Ciclar lecciones: al terminar todas las de un nivel, se vuelve a
        // practicar desde la primera para que nunca se quede sin qué estudiar.
        const lessonIndex = completed % lessonCount;
        const lesson = getLesson(subject.id, levelId, lessonIndex);
        if (lesson) {
          state.availableLessons.push({
            ...lesson,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            levelId,
            lessonIndex,
            difficulty: completed,
          });
        }
      });
    });

    // Recommend next lessons with enhanced algorithm
    state.recommendedPath = state.availableLessons
      .sort((a, b) => {
        // Prioritize weak areas
        const aWeak = state.weakAreas.includes(a.subjectId) ? -3 : 0;
        const bWeak = state.weakAreas.includes(b.subjectId) ? -3 : 0;
        // Deprioritize strong areas
        const aStrong = state.strongAreas.includes(a.subjectId) ? 2 : 0;
        const bStrong = state.strongAreas.includes(b.subjectId) ? 2 : 0;
        // Consider emotional state
        const aEmotional = a.subjectId === 'emotions' && state.emotionalState !== 'neutral' ? -1 : 0;
        const bEmotional = b.subjectId === 'emotions' && state.emotionalState !== 'neutral' ? -1 : 0;
        // Then lower difficulty
        return aWeak + aStrong + aEmotional + a.difficulty - (bWeak + bStrong + bEmotional + b.difficulty);
      })
      .slice(0, 3);

    // Adjust difficulty based on recent performance
    const recent = progress.sessionHistory?.slice(-5) || [];
    if (recent.length >= 3) {
      const avgScore = recent.reduce((s, r) => s + r.score, 0) / recent.length;
      if (avgScore > 85) state.difficultyAdjustment = 1;
      else if (avgScore < 50) state.difficultyAdjustment = -1;
    }

    // Suggest alternative learning style if struggling in current one
    if (state.weakAreas.length >= 2 && recent.length >= 3) {
      const avgScore = recent.reduce((s, r) => s + r.score, 0) / recent.length;
      if (avgScore < 60) {
        const styles = ['visual', 'auditivo', 'kinestesico', 'lector'];
        const currentIdx = styles.indexOf(learningStyle);
        state.suggestedStyle = styles[(currentIdx + 1) % styles.length];
        state.adaptations.push('style_switch_suggested');
      }
    }

    return state;
  }, [profile, progress, learningStyle, needs, model, accessibility, emotionalHistory]);

  const getLessonForStudent = useCallback((subjectId, levelId, index) => {
    const lesson = getLesson(subjectId, levelId, index);
    if (!lesson) return null;

    // Determinar qué variante usar
    let variant = lesson[learningStyle] || lesson.visual;

    // Para modelo multisensorial o UDL, combinar variantes
    if (model === 'multisensory' || model === 'udl' || adaptiveState.suggestedStyle === 'multisensorial') {
      // Crear una variante combinada
      const visualItems = lesson.visual?.items || [];
      const auditoryItems = lesson.auditivo?.items || [];
      const kinestheticItems = lesson.kinestesico?.items || [];
      const readerItems = lesson.lector?.items || [];

      // Usar items del estilo principal pero enriquecer con otros
      const combinedItems = variant.items.map((item, i) => ({
        ...item,
        // Añadir hints de otros estilos
        visualHint: visualItems[i]?.q || null,
        auditoryHint: auditoryItems[i]?.q || null,
        kinestheticHint: kinestheticItems[i]?.q || null,
        // Añadir instrucciones combinadas
        multiInstruction: [
          lesson.visual?.instruction,
          lesson.auditivo?.instruction,
          lesson.kinestesico?.instruction,
        ].filter(Boolean).join(' • '),
      }));

      variant = {
        instruction: `${variant.instruction} (Usa todos tus sentidos)`,
        items: combinedItems,
      };
    }

    // Aplicar adaptaciones específicas
    let instruction = variant.instruction;
    let items = variant.items;

    // Adaptación: pictogramas para dislexia severa
    if (needs.readingDifficulty === 'severe' && accessibility.showPictograms) {
      instruction = `👁️ ${instruction}`;
      items = items.map((item) => ({
        ...item,
        q: `📝 ${item.q}`,
        options: item.options.map((opt) => `🔹 ${opt}`),
      }));
    }

    // Adaptación: reducir opciones para discalculia o TEA
    if ((needs.mathDifficulty === 'severe' || needs.autismTraits === 'moderate') && items[0]?.options?.length > 2) {
      items = items.map((item) => ({
        ...item,
        options: item.options.slice(0, 3), // Reducir a 3 opciones
      }));
    }

    // Adaptación: instrucciones más cortas para TDAH
    if (needs.attentionType?.startsWith('adhd')) {
      instruction = instruction.split('.')[0] + '.';
    }

    return {
      id: lesson.id,
      title: lesson.title,
      instruction,
      items,
      totalItems: items.length,
      adaptations: adaptiveState.adaptations,
      suggestedStyle: adaptiveState.suggestedStyle,
      emotionalState: adaptiveState.emotionalState,
      sessionMaxDuration: adaptiveState.sessionMaxDuration,
    };
  }, [learningStyle, needs, accessibility, model, adaptiveState]);

  const getBreakRecommendation = useCallback(() => {
    const freq = adaptiveState.breakFrequency;
    if (freq === 'often') return { afterMinutes: 5, activity: '¡Levántate y salta 3 veces! 🐸' };
    if (freq === 'medium') return { afterMinutes: 10, activity: '¡Estira los brazos y respira profundo! 🌬️' };
    return { afterMinutes: 15, activity: '¡Descansa los ojos un momento! 👀' };
  }, [adaptiveState.breakFrequency]);

  const getEncouragementMessage = useCallback((context) => {
    const messages = {
      start: [
        '¡Puedes con esto! 🌟',
        'Tu cerebro está listo para aprender. 🧠',
        'Un paso a la vez. 🐢',
      ],
      correct: [
        '¡Eso es! Lo estás haciendo genial. ✨',
        '¡Tu cerebro está creciendo! 🌱',
        '¡Excelente trabajo! 🎉',
        '¡Sigue así, campeón/a! 🏆',
      ],
      incorrect: [
        'Casi... ¡intenta de nuevo! 💪',
        'Los errores nos enseñan. ¡Sigue intentando! 🌈',
        'Respira profundo y prueba otra vez. 🌬️',
        'Esto es difícil, pero tú eres más fuerte. ❤️',
      ],
      frustrated: [
        'Es normal sentirse frustrado. Descansa un momento. 🤗',
        'Vamos a hacerlo más fácil. No pasa nada. 🌸',
        'Estoy orgulloso/a de tu esfuerzo. 💙',
      ],
    };
    const pool = messages[context] || messages.start;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  return {
    ...adaptiveState,
    getLessonForStudent,
    getBreakRecommendation,
    getEncouragementMessage,
    learningStyle,
  };
}

function getLessonCount(subjectId, levelId) {
  const subject = LESSONS[subjectId];
  if (!subject) return 0;
  const level = subject[levelId];
  return level ? level.length : 0;
}
