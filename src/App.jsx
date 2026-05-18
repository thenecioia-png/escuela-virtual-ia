import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudentProfile } from './hooks/useStudentProfile';
import { useProgress } from './hooks/useProgress';
import { useAdaptiveEngine } from './hooks/useAdaptiveEngine';
import Layout from './components/Layout';
import Welcome from './components/Onboarding/Welcome';
import ProfileCreator from './components/Onboarding/ProfileCreator';
import LearningStyleQuiz from './components/Onboarding/LearningStyleQuiz';
import Dashboard from './components/Student/Dashboard';
import LessonPlayer from './components/Student/LessonPlayer';
import ParentDashboard from './components/Parent/ParentDashboard';

export default function App() {
  const { profile, updateProfile, setLearningStyle, completeOnboarding, resetProfile, avatars } = useStudentProfile();
  const { progress, recordSession, getNextRecommendation, getSubjectProgress, getLevelProgress, achievements, resetProgress } = useProgress();
  const adaptiveEngine = useAdaptiveEngine(profile, progress);

  const [view, setView] = useState('welcome'); // welcome | profile | style | dashboard | lesson | parent
  const [lessonParams, setLessonParams] = useState(null);
  const [currentNav, setCurrentNav] = useState('dashboard');

  const startOnboarding = () => setView('profile');
  const goToStyleQuiz = () => setView('style');
  const finishStyleQuiz = useCallback((style) => {
    setLearningStyle(style);
    completeOnboarding();
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [setLearningStyle, completeOnboarding]);

  const startLesson = useCallback((subjectId, levelId, index) => {
    setLessonParams({ subjectId, levelId, index });
    setView('lesson');
  }, []);

  const finishLesson = useCallback((subjectId, levelId, score, timeMinutes) => {
    recordSession(subjectId, levelId, score, timeMinutes);
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [recordSession]);

  const goHome = () => {
    setView('dashboard');
    setCurrentNav('dashboard');
  };

  const goToParent = () => {
    setView('parent');
    setCurrentNav('parent');
  };

  const goToProgress = () => {
    setView('parent');
    setCurrentNav('progress');
  };

  const handleNav = (navId) => {
    setCurrentNav(navId);
    if (navId === 'dashboard') setView('dashboard');
    if (navId === 'learn') setView('dashboard');
    if (navId === 'progress') setView('parent');
    if (navId === 'parent') setView('parent');
  };

  const resetAll = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el progreso y empezar de nuevo?')) {
      resetProfile();
      resetProgress();
      setView('welcome');
      setCurrentNav('dashboard');
    }
  };

  // Onboarding flow
  if (!profile.onboardingComplete) {
    return (
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div key="welcome" exit={{ opacity: 0 }}>
            <Welcome onStart={startOnboarding} />
          </motion.div>
        )}
        {view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileCreator
              profile={profile}
              updateProfile={updateProfile}
              avatars={avatars}
              onNext={goToStyleQuiz}
              onBack={() => setView('welcome')}
            />
          </motion.div>
        )}
        {view === 'style' && (
          <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LearningStyleQuiz
              onComplete={finishStyleQuiz}
              onBack={() => setView('profile')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Main app
  return (
    <Layout currentView={currentNav} onNavigate={handleNav} profile={profile}>
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              profile={profile}
              progress={progress}
              adaptiveEngine={adaptiveEngine}
              onStartLesson={startLesson}
              onViewProgress={goToProgress}
            />
          </motion.div>
        )}

        {view === 'lesson' && lessonParams && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <LessonPlayer
              subjectId={lessonParams.subjectId}
              levelId={lessonParams.levelId}
              lessonIndex={lessonParams.index}
              learningStyle={profile.learningStyle}
              onFinish={finishLesson}
              onHome={goHome}
            />
          </motion.div>
        )}

        {view === 'parent' && (
          <motion.div
            key="parent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ParentDashboard profile={profile} progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button (subtle) */}
      <div className="mt-12 text-center">
        <button
          onClick={resetAll}
          className="text-xs text-forest-300 hover:text-forest-500 transition-colors font-medium"
        >
          Borrar datos y empezar de nuevo
        </button>
      </div>
    </Layout>
  );
}
