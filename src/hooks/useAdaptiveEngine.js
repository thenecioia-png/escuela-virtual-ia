import { useMemo } from 'react';
import { LESSONS, getLesson } from '../data/lessons';
import { SUBJECTS } from '../data/subjects';

/**
 * Motor adaptativo que selecciona lecciones, ajusta dificultad
 * y personaliza el contenido según el perfil del estudiante.
 */
export function useAdaptiveEngine(profile, progress) {
  const learningStyle = profile.learningStyle || 'visual';

  const adaptiveState = useMemo(() => {
    const state = {
      availableLessons: [],
      recommendedPath: [],
      difficultyAdjustment: 0,
      weakAreas: [],
      strongAreas: [],
      suggestedStyle: learningStyle,
    };

    // Identify weak and strong areas
    SUBJECTS.forEach((subject) => {
      const subjProg = progress.subjectProgress[subject.id] || {};
      const totalLevels = subject.levels.length;
      const completed = Object.values(subjProg).reduce((a, b) => a + b, 0);
      const ratio = completed / (totalLevels * 2); // approx 2 lessons per level

      if (ratio < 0.3) state.weakAreas.push(subject.id);
      else if (ratio > 0.7) state.strongAreas.push(subject.id);
    });

    // Build available lessons for each subject
    SUBJECTS.forEach((subject) => {
      const subjProg = progress.subjectProgress[subject.id] || {};
      subject.levels.forEach((levelId) => {
        const lessonCount = getLessonCount(subject.id, levelId);
        const completed = subjProg[levelId] || 0;
        if (completed < lessonCount) {
          const lesson = getLesson(subject.id, levelId, completed);
          if (lesson) {
            state.availableLessons.push({
              ...lesson,
              subjectId: subject.id,
              subjectName: subject.name,
              subjectColor: subject.color,
              levelId,
              difficulty: completed,
            });
          }
        }
      });
    });

    // Recommend next 3 lessons
    state.recommendedPath = state.availableLessons
      .sort((a, b) => {
        // Prioritize weak areas
        const aWeak = state.weakAreas.includes(a.subjectId) ? -2 : 0;
        const bWeak = state.weakAreas.includes(b.subjectId) ? -2 : 0;
        // Then lower difficulty
        return aWeak + a.difficulty - (bWeak + b.difficulty);
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
      }
    }

    return state;
  }, [profile, progress, learningStyle]);

  const getLessonForStudent = (subjectId, levelId, index) => {
    const lesson = getLesson(subjectId, levelId, index);
    if (!lesson) return null;
    const variant = lesson[learningStyle] || lesson.visual;
    return {
      id: lesson.id,
      title: lesson.title,
      instruction: variant.instruction,
      items: variant.items,
      totalItems: variant.items.length,
    };
  };

  return {
    ...adaptiveState,
    getLessonForStudent,
    learningStyle,
  };
}

function getLessonCount(subjectId, levelId) {
  const subject = LESSONS[subjectId];
  if (!subject) return 0;
  const level = subject[levelId];
  return level ? level.length : 0;
}
