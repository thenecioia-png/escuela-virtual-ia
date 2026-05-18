import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Ear, Hand, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const QUESTIONS = [
  {
    scenario: '¿Cómo prefieres aprender algo nuevo?',
    options: [
      { style: 'visual', label: 'Viendo imágenes, colores y diagramas', icon: <Eye size={18} /> },
      { style: 'auditivo', label: 'Escuchando explicaciones y canciones', icon: <Ear size={18} /> },
      { style: 'kinestesico', label: 'Haciéndolo con las manos o moviéndome', icon: <Hand size={18} /> },
      { style: 'lector', label: 'Leyendo e investigando por mi cuenta', icon: <BookOpen size={18} /> },
    ],
  },
  {
    scenario: 'Cuando cuentas algo que te pasó, ¿qué haces?',
    options: [
      { style: 'visual', label: 'Dibujo o muestro con gestos lo que vi', icon: <Eye size={18} /> },
      { style: 'auditivo', label: 'Lo cuento con sonidos y palabras', icon: <Ear size={18} /> },
      { style: 'kinestesico', label: 'Actúo lo que pasó con mi cuerpo', icon: <Hand size={18} /> },
      { style: 'lector', label: 'Lo escribo o describo con muchos detalles', icon: <BookOpen size={18} /> },
    ],
  },
  {
    scenario: 'En clase, ¿qué te ayuda más a entender?',
    options: [
      { style: 'visual', label: 'Cuando el maestro usa el pizarrón con colores', icon: <Eye size={18} /> },
      { style: 'auditivo', label: 'Cuando el maestro explica con voz clara', icon: <Ear size={18} /> },
      { style: 'kinestesico', label: 'Cuando hacemos experimentos o juegos', icon: <Hand size={18} /> },
      { style: 'lector', label: 'Cuando leo el libro y subrayo ideas', icon: <BookOpen size={18} /> },
    ],
  },
  {
    scenario: '¿Qué recuerdas mejor de un cuento?',
    options: [
      { style: 'visual', label: 'Los personajes y los colores de las ilustraciones', icon: <Eye size={18} /> },
      { style: 'auditivo', label: 'Las canciones o rimas del cuento', icon: <Ear size={18} /> },
      { style: 'kinestesico', label: 'Las acciones y movimientos de los personajes', icon: <Hand size={18} /> },
      { style: 'lector', label: 'Las palabras exactas y la moraleja', icon: <BookOpen size={18} /> },
    ],
  },
];

const STYLE_DESCRIPTIONS = {
  visual: {
    title: 'Explorador Visual 🎨',
    description: 'Aprendes mejor cuando ves imágenes, colores, diagramas y videos. Te encanta observar el mundo.',
    tip: 'Te mostraré lecciones con muchos colores, figuras y ejemplos visuales.',
  },
  auditivo: {
    title: 'Escucha Activa 🎵',
    description: 'Aprendes mejor escuchando, cantando y conversando. Las palabras y sonidos te llegan directo al corazón.',
    tip: 'Te enseñaré con narraciones, rimas y explicaciones habladas.',
  },
  kinestesico: {
    title: 'Aventurero en Movimiento 🤸',
    description: 'Aprendes mejor cuando te mueves, tocas y experimentas. Tu cuerpo es tu mejor herramienta.',
    tip: 'Te propondré actividades para hacer con las manos, saltar y sentir.',
  },
  lector: {
    title: 'Lector Curioso 📚',
    description: 'Aprendes mejor leyendo, escribiendo y pensando por tu cuenta. Las palabras son tu mundo.',
    tip: 'Te daré lecturas, historias y problemas para resolver con palabras.',
  },
};

export default function LearningStyleQuiz({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const selectOption = (style) => {
    const nextAnswers = [...answers, style];
    setAnswers(nextAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate dominant style
      const counts = {};
      nextAnswers.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(dominant);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {!result ? (
          <>
            <div className="flex gap-2 mb-8">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i <= step ? 'bg-lavender-500' : 'bg-lavender-200'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="glass-card rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-lavender-100 rounded-xl text-lavender-600">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-sm font-bold text-lavender-600 uppercase tracking-wider">Pregunta {step + 1} de {QUESTIONS.length}</span>
                </div>
                <h2 className="text-xl font-black text-forest-900 mb-6">{QUESTIONS[step].scenario}</h2>

                <div className="space-y-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <motion.button
                      key={opt.style}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectOption(opt.style)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-forest-100 hover:border-lavender-400 hover:bg-lavender-50 transition-all text-left group"
                    >
                      <div className="p-2.5 rounded-xl bg-forest-50 text-forest-600 group-hover:bg-lavender-100 group-hover:text-lavender-600 transition-colors">
                        {opt.icon}
                      </div>
                      <span className="font-bold text-forest-800 text-sm sm:text-base">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={onBack}
              className="mt-6 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-forest-600 hover:bg-white/80 transition-colors mx-auto"
            >
              <ArrowRight size={18} className="rotate-180" />
              Volver
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h2 className="text-2xl font-black text-forest-900 mb-2">{STYLE_DESCRIPTIONS[result].title}</h2>
            <p className="text-forest-600 mb-4 leading-relaxed">{STYLE_DESCRIPTIONS[result].description}</p>
            <div className="bg-lavender-50 rounded-2xl p-4 mb-6 border border-lavender-200">
              <p className="text-lavender-700 font-bold text-sm">💡 {STYLE_DESCRIPTIONS[result].tip}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onComplete(result)}
              className="inline-flex items-center gap-3 bg-forest-500 hover:bg-forest-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-forest-500/25 transition-colors"
            >
              <Sparkles size={22} />
              ¡Empezar a aprender!
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
