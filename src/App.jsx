import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudentProfile } from './hooks/useStudentProfile';
import { useProgress } from './hooks/useProgress';
import { useAdaptiveEngine } from './hooks/useAdaptiveEngine';
import Layout from './components/Layout';
import Welcome from './components/Onboarding/Welcome';
import ProfileCreator from './components/Onboarding/ProfileCreator';
import NeedsAssessment from './components/Onboarding/NeedsAssessment';
import Dashboard from './components/Student/Dashboard';
import LessonPlayer from './components/Student/LessonPlayer';
import ParentDashboard from './components/Parent/ParentDashboard';
import EmotionalCheckIn from './components/Student/EmotionalCheckIn';
import AccessibilitySettings from './components/Student/AccessibilitySettings';

export default function App() {
  const {
    profile,
    updateProfile,
    setLearningStyle,
    setPedagogicalModel,
    updateNeedsAssessment,
    updateAccessibility,
    addEmotionalCheckIn,
    completeOnboarding,
    completeNeedsAssessment,
    resetProfile,
    avatars,
    pedagogicalModels,
    hasSpecialNeeds,
    getRecommendedAdaptations,
  } = useStudentProfile();

  const { progress, recordSession, getNextRecommendation, getSubjectProgress, getLevelProgress, achievements, resetProgress } = useProgress();
  const adaptiveEngine = useAdaptiveEngine(profile, progress);

  const [view, setView] = useState('welcome');
  const [lessonParams, setLessonParams] = useState(null);
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [showEmotionalCheckIn, setShowEmotionalCheckIn] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Determinar si necesita check-in emocional antes de la lección
  const needsEmotionalCheckIn = useCallback(() => {
    const lastCheckIn = profile.emotionalHistory?.slice(-1)[0];
    if (!lastCheckIn) return true; // Primera vez
    const hoursSince = (Date.now() - lastCheckIn.date) / (1000 * 60 * 60);
    const freq = profile.accessibility?.emotionalCheckFrequency || 'daily';
    if (freq === 'every_session') return true;
    if (freq === 'daily') return hoursSince > 20;
    return hoursSince > 48;
  }, [profile.emotionalHistory, profile.accessibility]);

  const startOnboarding = () => setView('profile');
  const goToNeedsAssessment = () => setView('needs');

  const finishNeedsAssessment = useCallback((result) => {
    setLearningStyle(result.learningStyle);
    setPedagogicalModel(result.pedagogicalModel);
    updateNeedsAssessment(result.needsAssessment);
    updateAccessibility(result.accessibility);
    completeNeedsAssessment();
    completeOnboarding();
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [setLearningStyle, setPedagogicalModel, updateNeedsAssessment, updateAccessibility, completeNeedsAssessment, completeOnboarding]);

  const startLesson = useCallback((subjectId, levelId, index) => {
    // Si necesita check-in emocional, mostrar primero
    if (needsEmotionalCheckIn() && profile.accessibility?.emotionalCheckFrequency !== 'never') {
      setLessonParams({ subjectId, levelId, index });
      setShowEmotionalCheckIn(true);
    } else {
      setLessonParams({ subjectId, levelId, index });
      setView('lesson');
    }
  }, [needsEmotionalCheckIn, profile.accessibility]);

  const handleEmotionalCheckIn = useCallback((checkIn) => {
    addEmotionalCheckIn(checkIn);
    setShowEmotionalCheckIn(false);
    setView('lesson');
  }, [addEmotionalCheckIn]);

  const finishLesson = useCallback((subjectId, levelId, score, timeMinutes) => {
    recordSession(subjectId, levelId, score, timeMinutes);
    setView('dashboard');
    setCurrentNav('dashboard');
    setLessonParams(null);
  }, [recordSession]);

  const goHome = () => {
    setView('dashboard');
    setCurrentNav('dashboard');
    setLessonParams(null);
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
      setShowEmotionalCheckIn(false);
      setShowAccessibility(false);
    }
  };

  // Aplicar clases de accesibilidad al body/html
  useEffect(() => {
    const html = document.documentElement;
    const acc = profile.accessibility || {};
    html.classList.toggle('dyslexic-font', acc.dyslexicFont);
    html.classList.toggle('large-text', acc.largeText);
    html.classList.toggle('high-contrast', acc.highContrast);
    html.classList.toggle('reduce-motion', acc.reduceMotion);
  }, [profile.accessibility]);

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
              onNext={goToNeedsAssessment}
              onBack={() => setView('welcome')}
            />
          </motion.div>
        )}
        {view === 'needs' && (
          <motion.div key="needs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NeedsAssessment
              profile={profile}
              onComplete={finishNeedsAssessment}
              onBack={() => setView('profile')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Emotional check-in overlay
  if (showEmotionalCheckIn) {
    return (
      <div className="min-h-screen bg-cream-50">
        <EmotionalCheckIn
          profile={profile}
          onComplete={handleEmotionalCheckIn}
        />
      </div>
    );
  }

  // Main app
  return (
    <Layout
      currentView={currentNav}
      onNavigate={handleNav}
      profile={profile}
      onOpenAccessibility={() => setShowAccessibility(true)}
    >
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
              onOpenAccessibility={() => setShowAccessibility(true)}
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
              profile={profile}
              adaptiveEngine={adaptiveEngine}
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
            <ParentDashboard
              profile={profile}
              progress={progress}
              adaptiveEngine={adaptiveEngine}
              onOpenAccessibility={() => setShowAccessibility(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Settings Modal */}
      <AnimatePresence>
        {showAccessibility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAccessibility(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <AccessibilitySettings
                profile={{ ...profile, getRecommendedAdaptations }}
                onUpdate={(settings) => {
                  updateAccessibility(settings);
                }}
                onClose={() => setShowAccessibility(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
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
