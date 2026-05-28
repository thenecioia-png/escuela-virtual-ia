import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Brain, Heart, Eye, Ear, Hand, BookOpen, Sparkles, Accessibility, Clock, Zap, Volume2, VolumeX } from 'lucide-react';

const PHASES = [
  { id: 'welcome', title: 'Conociéndonos mejor', icon: Sparkles },
  { id: 'learning', title: 'Cómo aprendes', icon: Brain },
  { id: 'needs', title: 'Tus superpoderes y desafíos', icon: Heart },
  { id: 'model', title: 'Tu forma ideal de aprender', icon: Zap },
];

// Fase 2: Preguntas ampliadas de estilo de aprendizaje
const LEARNING_QUESTIONS = [
  {
    id: 'lq1',
    question: 'Cuando ves un rompecabezas nuevo, ¿qué haces primero?',
    options: [
      { key: 'visual', label: 'Miro todas las piezas y busco colores o formas', emoji: '👁️' },
      { key: 'auditivo', label: 'Pido que alguien me explique cómo armarlo', emoji: '👂' },
      { key: 'kinestesico', label: 'Tomo las piezas y empiezo a probar con las manos', emoji: '✋' },
      { key: 'lector', label: 'Leo las instrucciones paso a paso', emoji: '📖' },
    ],
  },
  {
    id: 'lq2',
    question: '¿Qué tipo de cuentos te gustan más?',
    options: [
      { key: 'visual', label: 'Con muchas ilustraciones y colores', emoji: '🎨' },
      { key: 'auditivo', label: 'Que me lean en voz alta o en audiolibro', emoji: '🎧' },
      { key: 'kinestesico', label: 'Donde pueda actuar o moverme con la historia', emoji: '🎭' },
      { key: 'lector', label: 'Que tengan muchas palabras nuevas para leer', emoji: '📚' },
    ],
  },
  {
    id: 'lq3',
    question: 'Cuando estudias algo difícil, ¿qué te ayuda más?',
    options: [
      { key: 'visual', label: 'Ver videos, diagramas o mapas mentales', emoji: '📺' },
      { key: 'auditivo', label: 'Escuchar explicaciones o cantar la información', emoji: '🎵' },
      { key: 'kinestesico', label: 'Hacer experimentos, dibujar en el aire o saltar', emoji: '🔬' },
      { key: 'lector', label: 'Escribirlo, leerlo varias veces o resumirlo', emoji: '✍️' },
    ],
  },
  {
    id: 'lq4',
    question: '¿Cómo prefieres trabajar en equipo?',
    options: [
      { key: 'visual', label: 'Dibujando juntos en un pizarrón', emoji: '🖍️' },
      { key: 'auditivo', label: 'Hablando y discutiendo las ideas', emoji: '💬' },
      { key: 'kinestesico', label: 'Construyendo algo con materiales', emoji: '🏗️' },
      { key: 'lector', label: 'Escribiendo un plan y repartiendo tareas', emoji: '📝' },
    ],
  },
];

// Fase 3: Detección de necesidades (diseñada con sensibilidad, no es diagnóstico médico)
const NEEDS_QUESTIONS = [
  {
    id: 'n_reading',
    category: 'Lectura',
    question: 'Cuando lees, ¿cómo te sientes?',
    options: [
      { value: 'none', label: '¡Me encanta! Leo sin problemas', emoji: '😊' },
      { value: 'mild', label: 'A veces las letras se mueven o me confundo', emoji: '🤔' },
      { value: 'moderate', label: 'Me cuesta bastante, necesito que me ayuden', emoji: '😅' },
      { value: 'severe', label: 'Es muy difícil para mí, prefiero que me lean', emoji: '😰' },
    ],
    field: 'readingDifficulty',
  },
  {
    id: 'n_math',
    category: 'Números',
    question: '¿Qué tal te va con los números y cuentas?',
    options: [
      { value: 'none', label: '¡Súper bien! Me gustan las matemáticas', emoji: '🔢' },
      { value: 'mild', label: 'A veces me confundo con las operaciones', emoji: '🤯' },
      { value: 'moderate', label: 'Necesito usar los dedos o objetos para contar', emoji: '✋' },
      { value: 'severe', label: 'Los números me cuestan mucho trabajo', emoji: '😓' },
    ],
    field: 'mathDifficulty',
  },
  {
    id: 'n_attention',
    category: 'Atención',
    question: 'Cuando estás en clase o haciendo tarea...',
    options: [
      { value: 'typical', label: 'Puedo concentrarme bien en lo que me piden', emoji: '🎯' },
      { value: 'adhd_inattentive', label: 'Mi mente se va a otros pensamientos fácilmente', emoji: '💭' },
      { value: 'adhd_hyperactive', label: 'Me cuesta quedarme quieto/a, quiero moverme', emoji: '⚡' },
      { value: 'adhd_combined', label: 'A veces me distraigo y también necesito moverme', emoji: '🌀' },
    ],
    field: 'attentionType',
  },
  {
    id: 'n_autism',
    category: 'Social y sensorial',
    question: '¿Qué situaciones te resultan más difíciles?',
    options: [
      { value: 'none', label: 'Me siento cómodo/a en la mayoría de situaciones', emoji: '😌' },
      { value: 'mild', label: 'Los ruidos fuertes o luces brillantes me molestan', emoji: '🔊' },
      { value: 'moderate', label: 'Prefiero rutinas conocidas y me cuestan los cambios', emoji: '📅' },
    ],
    field: 'autismTraits',
  },
  {
    id: 'n_processing',
    category: 'Ritmo',
    question: 'Cuando te explican algo nuevo...',
    options: [
      { value: 'fast', label: '¡Lo entiendo rápido! Quiero ir al siguiente', emoji: '🚀' },
      { value: 'average', label: 'Necesito un momento, pero luego lo entiendo', emoji: '⏱️' },
      { value: 'slow', label: 'Necesito que me lo expliquen varias veces, con calma', emoji: '🐢' },
    ],
    field: 'processingSpeed',
  },
  {
    id: 'n_emotional',
    category: 'Emociones',
    question: 'Cuando te frustras con algo difícil...',
    options: [
      { value: 'typical', label: 'Respiro y sigo intentando', emoji: '🌬️' },
      { value: 'needs_support', label: 'Necesito que alguien me anime para seguir', emoji: '🤗' },
      { value: 'intense', label: 'Me cuesta mucho calmarme, siento mucha emoción', emoji: '🌊' },
    ],
    field: 'emotionalRegulation',
  },
];

// Fase 4: Modelo pedagógico
const MODEL_OPTIONS = [
  {
    id: 'adaptive',
    name: 'Déjame a la IA',
    description: 'Quiero que la app elija sola qué método usar según cómo me vaya.',
    icon: '🤖',
    color: 'bg-sky-50 border-sky-200 text-sky-700',
    activeColor: 'bg-sky-500 text-white border-sky-500',
  },
  {
    id: 'montessori',
    name: 'Con las manos',
    description: 'Quiero tocar, mover y explorar por mi cuenta antes de practicar.',
    icon: '🌱',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 text-white border-emerald-500',
  },
  {
    id: 'gamified',
    name: 'Como un juego',
    description: 'Misiones, puntos, niveles y desafíos. ¡Quiero divertirme!',
    icon: '🎮',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    activeColor: 'bg-violet-500 text-white border-violet-500',
  },
  {
    id: 'multisensory',
    name: 'Con todos los sentidos',
    description: 'Ver, oír, tocar y moverme todo al mismo tiempo.',
    icon: '✨',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 text-white border-amber-500',
  },
  {
    id: 'udl',
    name: 'Muchas opciones',
    description: 'Quiero elegir entre diferentes formas de aprender lo mismo.',
    icon: '🌍',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    activeColor: 'bg-rose-500 text-white border-rose-500',
  },
];

export default function NeedsAssessment({ profile, onComplete, onBack }) {
  const [phase, setPhase] = useState(0); // 0=welcome, 1=learning, 2=needs, 3=model
  const [learningAnswers, setLearningAnswers] = useState({});
  const [needsAnswers, setNeedsAnswers] = useState({});
  const [selectedModel, setSelectedModel] = useState(profile.pedagogicalModel || 'adaptive');
  const [accessibility, setAccessibility] = useState(profile.accessibility);

  const handleLearningAnswer = (questionId, key) => {
    setLearningAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleNeedsAnswer = (field, value) => {
    setNeedsAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDominantStyle = () => {
    const counts = {};
    Object.values(learningAnswers).forEach((k) => {
      counts[k] = (counts[k] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'visual';
  };

  const canProceed = () => {
    if (phase === 1) return Object.keys(learningAnswers).length >= 3;
    if (phase === 2) {
      const required = ['readingDifficulty', 'mathDifficulty', 'attentionType', 'processingSpeed'];
      return required.every((f) => needsAnswers[f] !== undefined);
    }
    if (phase === 3) return !!selectedModel;
    return true;
  };

  const handleComplete = () => {
    const dominantStyle = calculateDominantStyle();
    // Auto-detectar modelo si eligió adaptive
    let finalModel = selectedModel;
    if (selectedModel === 'adaptive') {
      if (needsAnswers.attentionType?.startsWith('adhd')) finalModel = 'gamified';
      else if (needsAnswers.readingDifficulty === 'moderate' || needsAnswers.readingDifficulty === 'severe' || needsAnswers.mathDifficulty === 'moderate' || needsAnswers.mathDifficulty === 'severe') finalModel = 'multisensory';
      else if (dominantStyle === 'kinestesico') finalModel = 'montessori';
    }

    // Auto-configurar accesibilidad basada en necesidades
    const newAccessibility = { ...accessibility };
    if (needsAnswers.readingDifficulty === 'moderate' || needsAnswers.readingDifficulty === 'severe') {
      newAccessibility.dyslexicFont = true;
      newAccessibility.largeText = true;
      newAccessibility.showPictograms = true;
    }
    if (needsAnswers.attentionType?.startsWith('adhd')) {
      newAccessibility.sessionDuration = 10;
      newAccessibility.breakFrequency = 'often';
      newAccessibility.positiveReinforcement = 'animations';
    }
    if (needsAnswers.autismTraits === 'moderate') {
      newAccessibility.reduceMotion = true;
      newAccessibility.reduceSound = true;
      newAccessibility.pacing = 'structured';
    }
    if (needsAnswers.processingSpeed === 'slow') {
      newAccessibility.pacing = 'self';
    }

    onComplete({
      learningStyle: dominantStyle,
      pedagogicalModel: finalModel,
      needsAssessment: {
        completed: true,
        readingDifficulty: needsAnswers.readingDifficulty || 'none',
        mathDifficulty: needsAnswers.mathDifficulty || 'none',
        attentionType: needsAnswers.attentionType || 'typical',
        autismTraits: needsAnswers.autismTraits || 'none',
        sensorySensitivity: needsAnswers.sensorySensitivity || [],
        processingSpeed: needsAnswers.processingSpeed || 'average',
        emotionalRegulation: needsAnswers.emotionalRegulation || 'typical',
      },
      accessibility: newAccessibility,
    });
  };

  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="text-6xl mb-4">🧠</div>
      <h2 className="text-3xl font-black text-forest-900 mb-3">
        Quiero conocerte de verdad
      </h2>
      <p className="text-forest-600 mb-6 leading-relaxed">
        No todas las personas aprendemos igual. A algunos nos gusta ver, a otros escuchar, 
        a otros movernos. Algunos necesitamos más tiempo, otros más movimiento.
      </p>
      <p className="text-forest-600 mb-8 leading-relaxed">
        Estas preguntas me ayudarán a <strong>enseñarte a TU manera</strong>, respetando 
        cómo funciona tu cerebro y tu corazón. No hay respuestas buenas ni malas.
      </p>
      <div className="flex items-center justify-center gap-4 text-sm text-forest-400">
        <span className="flex items-center gap-1"><Brain size={16} /> 4 preguntas de estilo</span>
        <span className="flex items-center gap-1"><Heart size={16} /> 6 preguntas de necesidades</span>
        <span className="flex items-center gap-1"><Zap size={16} /> Tu modelo ideal</span>
      </div>
    </motion.div>
  );

  const renderLearningPhase = () => {
    const currentQ = LEARNING_QUESTIONS[Math.min(Object.keys(learningAnswers).length, LEARNING_QUESTIONS.length - 1)];
    const answeredCount = Object.keys(learningAnswers).length;
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex gap-2 mb-6">
          {LEARNING_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${i < answeredCount ? 'bg-sky-500' : i === answeredCount ? 'bg-sky-300' : 'bg-forest-200'}`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain size={18} className="text-sky-500" />
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Pregunta {answeredCount + 1} de {LEARNING_QUESTIONS.length}</span>
            </div>
            <h3 className="text-xl font-black text-forest-900 mb-6">{currentQ.question}</h3>
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const selected = learningAnswers[currentQ.id] === opt.key;
                return (
                  <motion.button
                    key={opt.key}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLearningAnswer(currentQ.id, opt.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selected
                        ? 'bg-sky-50 border-sky-400 shadow-md'
                        : 'bg-white border-forest-100 hover:border-sky-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-bold text-forest-800">{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderNeedsPhase = () => {
    const answeredFields = Object.keys(needsAnswers);
    const currentQIndex = NEEDS_QUESTIONS.findIndex((q) => needsAnswers[q.field] === undefined);
    const currentQ = NEEDS_QUESTIONS[currentQIndex >= 0 ? currentQIndex : 0];
    const progress = answeredFields.length / NEEDS_QUESTIONS.length;

    return (
      <div className="max-w-lg mx-auto">
        <div className="flex gap-2 mb-6">
          <div className="h-2 flex-1 rounded-full bg-forest-200 overflow-hidden">
            <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <Heart size={18} className="text-rose-500" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">{currentQ.category}</span>
            </div>
            <h3 className="text-xl font-black text-forest-900 mb-6">{currentQ.question}</h3>
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const selected = needsAnswers[currentQ.field] === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNeedsAnswer(currentQ.field, opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selected
                        ? 'bg-rose-50 border-rose-400 shadow-md'
                        : 'bg-white border-forest-100 hover:border-rose-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-bold text-forest-800">{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-forest-400 text-center">
              💡 Esto no es un diagnóstico médico. Solo nos ayuda a adaptar la app para ti.
            </p>
          </motion.div>
        </AnimatePresence>
        {currentQIndex > 0 && (
          <button
            onClick={() => {
              const prevQ = NEEDS_QUESTIONS[currentQIndex - 1];
              setNeedsAnswers((prev) => { const n = { ...prev }; delete n[prevQ.field]; return n; });
            }}
            className="mt-4 mx-auto flex items-center gap-2 text-sm text-forest-500 hover:text-forest-700"
          >
            <ArrowLeft size={14} /> Corregir respuesta anterior
          </button>
        )}
      </div>
    );
  };

  const renderModelPhase = () => (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <Zap size={32} className="text-amber-500 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-forest-900">¿Cómo quieres aprender?</h2>
        <p className="text-forest-600 mt-1">Elige el estilo que más te emocione</p>
      </div>
      <div className="space-y-3">
        {MODEL_OPTIONS.map((model) => {
          const active = selectedModel === model.id;
          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedModel(model.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                active ? model.activeColor : `${model.color}`
              }`}
            >
              <span className="text-3xl">{model.icon}</span>
              <div>
                <h3 className="font-black">{model.name}</h3>
                <p className="text-sm opacity-90">{model.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Accesibilidad rápida */}
      <div className="mt-6 glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Accessibility size={18} className="text-forest-500" />
          <h3 className="font-bold text-forest-900">Ajustes rápidos</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'largeText', label: 'Texto grande', icon: '🔍' },
            { key: 'dyslexicFont', label: 'Fuente dislexia', icon: '🔤' },
            { key: 'highContrast', label: 'Alto contraste', icon: '👁️' },
            { key: 'reduceMotion', label: 'Menos animación', icon: '✋' },
            { key: 'showPictograms', label: 'Pictogramas', icon: '🖼️' },
            { key: 'reduceSound', label: 'Sin sonido', icon: '🔇' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setAccessibility((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${
                accessibility[opt.key]
                  ? 'bg-forest-500 text-white shadow-md'
                  : 'bg-white text-forest-600 border border-forest-200'
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Phase indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {PHASES.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                i === phase
                  ? 'bg-forest-500 text-white shadow-lg'
                  : i < phase
                  ? 'bg-forest-200 text-forest-600'
                  : 'bg-white text-forest-300 border border-forest-100'
              }`}
            >
              <p.icon size={14} />
              <span className="hidden sm:inline">{p.title}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="welcome" exit={{ opacity: 0, y: -20 }}>
              {renderWelcome()}
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="learning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderLearningPhase()}
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="needs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderNeedsPhase()}
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderModelPhase()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={phase === 0 ? onBack : () => setPhase((p) => p - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-forest-600 hover:bg-white/80 transition-colors"
          >
            <ArrowLeft size={18} />
            {phase === 0 ? 'Volver' : 'Anterior'}
          </button>

          {phase < 3 ? (
            <button
              onClick={() => setPhase((p) => p + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-forest-500/20"
            >
              {phase === 0 ? 'Empezar' : 'Siguiente'}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-forest-500/20"
            >
              <Sparkles size={18} />
              ¡Crear mi aventura!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
