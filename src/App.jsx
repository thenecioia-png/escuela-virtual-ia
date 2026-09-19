import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useStudentProfile } from './hooks/useStudentProfile';
import { useProgress } from './hooks/useProgress';
import { useAdaptiveEngine } from './hooks/useAdaptiveEngine';
import { useParentMessages } from './hooks/useParentMessages';
import Layout from './components/Layout';
import ParentAuth from './components/Auth/ParentAuth';
import StudentPicker from './components/StudentPicker';
import Welcome from './components/Onboarding/Welcome';
import ProfileCreator from './components/Onboarding/ProfileCreator';
import NeedsAssessment from './components/Onboarding/NeedsAssessment';
import Dashboard from './components/Student/Dashboard';
import LessonPlayer from './components/Student/LessonPlayer';
import ExamPlayer from './components/Student/ExamPlayer';
import DiagnosticPlayer from './components/Student/DiagnosticPlayer';
import { generateAnyPracticeLesson } from './lib/lifeSkillMap';
import ParentDashboard from './components/Parent/ParentDashboard';
import EmotionalCheckIn from './components/Student/EmotionalCheckIn';
import AccessibilitySettings from './components/Student/AccessibilitySettings';
import { getSharedFamilyId, fetchSharedStudents, cacheSharedStudents } from './lib/familyShare';
import { buildExam, examPrimarySubject } from './lib/exams';
import { DEFAULT_PROFILE } from './hooks/useStudentProfile';

export default function App() {
  const auth = useAuth();
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
    students,
    activeId,
    selectStudent,
    lockStudent,
    draft,
    updateDraft,
    resetDraft,
    createStudent,
  } = useStudentProfile(auth.familyId);

  const { progress, recordSession, getNextRecommendation, getSubjectProgress, getLevelProgress, achievements, resetProgress } = useProgress(activeId, profile);
  const adaptiveEngine = useAdaptiveEngine(profile, progress);
  const { messages: parentMessages, sendMessage: sendParentMessage, markRead: markParentMessageRead } = useParentMessages(activeId, auth.familyId);

  const [view, setView] = useState('welcome');
  const [lessonParams, setLessonParams] = useState(null);
  const [examQuestions, setExamQuestions] = useState(null);
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [showEmotionalCheckIn, setShowEmotionalCheckIn] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false); // onboarding de estudiante nuevo (usa draft)

  // Modo "link/QR compartido": ?f=<familyId> → el estudiante entra con su PIN
  // desde su propio teléfono, sin la cuenta del padre.
  const [sharedFamilyId] = useState(getSharedFamilyId);
  const [sharedReady, setSharedReady] = useState(false);

  useEffect(() => {
    if (!sharedFamilyId || auth.session) return;
    fetchSharedStudents(sharedFamilyId).then((rows) => {
      if (rows.length > 0) {
        cacheSharedStudents(rows, DEFAULT_PROFILE);
        window.dispatchEvent(new Event('evi-students-updated'));
      }
      setSharedReady(true);
    });
  }, [sharedFamilyId, auth.session]);

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

  const startOnboarding = () => setView('auth'); // Welcome → cuenta de Papá/Mamá
  const goToNeedsAssessment = () => setView('needs');

  // Elegir estudiante existente en el selector (con o sin PIN; remoto = Promise)
  const handleSelectStudent = useCallback((id, pin) => {
    const after = (ok) => {
      if (ok) {
        setView('dashboard');
        setCurrentNav('dashboard');
      }
      return ok;
    };
    const r = selectStudent(id, pin);
    return r && typeof r.then === 'function' ? r.then(after) : after(r);
  }, [selectStudent]);

  // "Agregar estudiante" desde el selector → onboarding con borrador nuevo
  const startNewStudent = useCallback(() => {
    resetDraft();
    setCreatingNew(true);
    setView('profile');
  }, [resetDraft]);

  // Cerrar sesión de Papá/Mamá y volver al inicio
  const handleLogout = useCallback(async () => {
    await auth.logout();
    lockStudent();
    setCreatingNew(false);
    setView('welcome');
    setCurrentNav('dashboard');
  }, [auth, lockStudent]);

  const finishNeedsAssessment = useCallback(async (result) => {
    if (creatingNew) {
      // Estudiante nuevo: crear con todo lo del onboarding
      await createStudent({
        learningStyle: result.learningStyle,
        pedagogicalModel: result.pedagogicalModel,
        needsAssessment: { ...draft.needsAssessment, ...result.needsAssessment, completed: true },
        accessibility: { ...draft.accessibility, ...result.accessibility },
        onboardingComplete: true,
      });
      setCreatingNew(false);
    } else {
      setLearningStyle(result.learningStyle);
      setPedagogicalModel(result.pedagogicalModel);
      updateNeedsAssessment(result.needsAssessment);
      updateAccessibility(result.accessibility);
      completeNeedsAssessment();
      completeOnboarding();
    }
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [creatingNew, createStudent, draft, setLearningStyle, setPedagogicalModel, updateNeedsAssessment, updateAccessibility, completeNeedsAssessment, completeOnboarding]);

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

  const finishLesson = useCallback((subjectId, levelId, score, timeMinutes, extras = {}) => {
    const emotion = profile.emotionalHistory?.slice(-1)[0]?.mood || null;
    recordSession(subjectId, levelId, score, timeMinutes, { ...extras, emotion });
    setView('dashboard');
    setCurrentNav('dashboard');
    setLessonParams(null);
  }, [recordSession, profile.emotionalHistory]);

  // Lección generada por IA (desde el Dashboard del estudiante)
  const startAiLesson = useCallback((lesson, subjectId, topic) => {
    setLessonParams({ customLesson: lesson, subjectId, levelId: topic });
    setView('lesson');
  }, []);

  // Examen de repaso (retención): construye preguntas de lo ya practicado
  const startExam = useCallback(() => {
    const questions = buildExam(profile, progress);
    if (!questions || questions.length === 0) return;
    setExamQuestions(questions);
    setView('exam');
  }, [profile, progress]);

  // Diagnóstico adaptativo: ubicar el nivel real en restas y multiplicación
  const startDiagnostic = useCallback(() => {
    setView('diagnostic');
  }, []);

  const finishDiagnostic = useCallback((percentage, timeMinutes) => {
    // Cuenta como sesión (sin subir de nivel: es evaluación, tipo examen)
    const emotion = profile.emotionalHistory?.slice(-1)[0]?.mood || null;
    recordSession('math', 'diagnostico', percentage, timeMinutes, { isExam: true, emotion });
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [recordSession, profile.emotionalHistory]);

  // Práctica dirigida de una habilidad débil (ejercicios generados al azar,
  // de cualquier área: matemáticas, dinero, tiempo, medidas, lectura, ciencias)
  const startSkillPractice = useCallback((skillId) => {
    const lesson = generateAnyPracticeLesson(skillId, 8);
    if (!lesson) return;
    setLessonParams({ customLesson: lesson, subjectId: 'math', levelId: skillId });
    setView('lesson');
  }, []);

  const finishExam = useCallback((percentage, timeMinutes, answers) => {
    if (examQuestions && examQuestions.length > 0) {
      const subjectId = examPrimarySubject(examQuestions);
      recordSession(subjectId, 'repaso', percentage, timeMinutes, { answers, isExam: true });
    }
    setExamQuestions(null);
    setView('dashboard');
    setCurrentNav('dashboard');
  }, [examQuestions, recordSession]);

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
      setView('picker');
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

  // 1) Modo link/QR compartido sin sesión de padre: solo el selector del niño
  if (sharedFamilyId && !auth.session && !activeId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="shared-picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!sharedReady ? (
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-forest-500 font-bold animate-pulse">Buscando tu perfil…</p>
            </div>
          ) : (
            <StudentPicker
              students={students}
              onSelect={handleSelectStudent}
              onAddStudent={null}
              onLogout={() => { window.location.href = window.location.pathname; }}
              isDemo={false}
              sharedMode
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // 2) Sin sesión de Papá/Mamá (y sin link compartido): portada → login/registro (o modo demo)
  if (!auth.session && !sharedFamilyId) {
    return (
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div key="welcome" exit={{ opacity: 0 }}>
            <Welcome onStart={startOnboarding} />
          </motion.div>
        )}
        {view === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ParentAuth auth={auth} onAuthenticated={() => setView('picker')} onBack={() => setView('welcome')} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // 2) Con sesión pero sin estudiante activo: selector (o onboarding de uno nuevo)
  if (!activeId) {
    return (
      <AnimatePresence mode="wait">
        {view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileCreator
              profile={draft}
              updateProfile={updateDraft}
              avatars={avatars}
              onNext={goToNeedsAssessment}
              onBack={() => { setCreatingNew(false); setView('picker'); }}
            />
          </motion.div>
        )}
        {view === 'needs' && (
          <motion.div key="needs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NeedsAssessment
              profile={draft}
              onComplete={finishNeedsAssessment}
              onBack={() => setView('profile')}
            />
          </motion.div>
        )}
        {view !== 'profile' && view !== 'needs' && (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StudentPicker
              students={students}
              onSelect={handleSelectStudent}
              onAddStudent={startNewStudent}
              onLogout={handleLogout}
              isDemo={auth.isDemo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // 3) Estudiante seleccionado pero sin onboarding completo (perfil migrado viejo)
  if (!profile.onboardingComplete) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="needs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <NeedsAssessment
            profile={profile}
            onComplete={finishNeedsAssessment}
            onBack={() => { lockStudent(); setView('picker'); }}
          />
        </motion.div>
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
              onStartAiLesson={startAiLesson}
              onStartExam={startExam}
              onStartDiagnostic={startDiagnostic}
              onStartSkillPractice={startSkillPractice}
              onViewProgress={goToProgress}
              onOpenAccessibility={() => setShowAccessibility(true)}
              parentMessages={parentMessages}
              onReadMessage={markParentMessageRead}
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
              customLesson={lessonParams.customLesson || null}
              learningStyle={profile.learningStyle}
              profile={profile}
              adaptiveEngine={adaptiveEngine}
              onFinish={finishLesson}
              onHome={goHome}
            />
          </motion.div>
        )}

        {view === 'exam' && examQuestions && (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ExamPlayer
              questions={examQuestions}
              studentId={activeId}
              onFinish={finishExam}
              onHome={goHome}
            />
          </motion.div>
        )}

        {view === 'diagnostic' && (
          <motion.div
            key="diagnostic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <DiagnosticPlayer
              studentId={activeId}
              onFinish={finishDiagnostic}
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
              onSendMessage={sendParentMessage}
              studentId={activeId}
              familyId={auth.familyId}
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
