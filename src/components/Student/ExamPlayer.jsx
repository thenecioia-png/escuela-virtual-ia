import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Star, Trophy, Home, ClipboardList } from 'lucide-react';

// Reproductor de examen de repaso. Una pregunta por vez, sin pistas (modo examen),
// feedback inmediato y pantalla final con estrellas + botón Guardar.
export default function ExamPlayer({ questions, onFinish, onHome }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [complete, setComplete] = useState(false);
  const startTime = useRef(Date.now());

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-forest-500 font-bold">Todavía no hay preguntas para repasar.</p>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const q = questions[current];

  const handleSelect = (opt) => {
    if (showResult) return;
    const correct = opt === q.answer;
    setSelected(opt);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { q: q.q, selected: opt, correct }]);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((i) => i + 1);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setComplete(true);
    }
  };

  const handleFinish = () => {
    const percentage = Math.round((score / questions.length) * 100);
    const timeMinutes = Math.max(1, Math.round((Date.now() - startTime.current) / 60000));
    onFinish(percentage, timeMinutes, answers);
  };

  // Pantalla final
  if (complete) {
    const percentage = Math.round((score / questions.length) * 100);
    const stars = Math.ceil((score / questions.length) * 5);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto glass-card rounded-3xl p-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          {percentage >= 80 ? '🏆' : percentage >= 50 ? '⭐' : '💪'}
        </motion.div>
        <h2 className="text-2xl font-black text-forest-900 mb-2">
          {percentage >= 80 ? '¡Excelente en tu examen!' : percentage >= 50 ? '¡Buen examen!' : '¡A seguir repasando!'}
        </h2>
        <p className="text-forest-600 mb-4">
          Respondiste <strong>{score}</strong> de <strong>{questions.length}</strong> correctamente
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: s <= stars ? 1 : 0.5 }}
              transition={{ delay: s * 0.15 }}
            >
              <Star size={32} className={s <= stars ? 'text-sun-400 fill-sun-400' : 'text-forest-200'} />
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-forest-500 mb-8">
          Este repaso mide lo que recuerdas, por eso no sube de nivel. ¡Sigue practicando para aprender más!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg shadow-forest-500/25"
          >
            <Trophy size={18} />
            Guardar resultado
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-100 text-forest-700 hover:bg-forest-200 transition-all"
          >
            <Home size={18} />
            Inicio
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Pantalla de pregunta
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-forest-500" />
          <div>
            <h2 className="font-black text-forest-900 text-lg">Examen de repaso</h2>
            <p className="text-xs text-forest-400 font-bold">Demuestra lo que recuerdas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-forest-500">
            {current + 1} / {questions.length}
          </span>
          <button onClick={onHome} className="p-2 rounded-xl hover:bg-forest-50 text-forest-500 transition-colors">
            <Home size={18} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-forest-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full bg-forest-500"
          initial={{ width: 0 }}
          animate={{ width: `${((current + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <h3 className="text-xl font-black text-forest-900 mb-6 leading-relaxed">{q.q}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt) => {
              let btnClass = 'choice-btn bg-white border-2 border-forest-100 text-forest-800 hover:border-forest-300';
              if (showResult) {
                if (opt === q.answer) {
                  btnClass = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800';
                } else if (opt === selected && !isCorrect) {
                  btnClass = 'bg-rose-50 border-2 border-rose-400 text-rose-800';
                } else {
                  btnClass = 'bg-white/50 border-2 border-forest-100 text-forest-300';
                }
              }
              return (
                <motion.button
                  key={opt}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  className={`p-4 rounded-2xl font-bold text-sm sm:text-base text-left transition-all flex items-center gap-3 ${btnClass}`}
                >
                  {showResult && opt === q.answer && <Check size={18} className="text-emerald-600 shrink-0" />}
                  {showResult && opt === selected && !isCorrect && <X size={18} className="text-rose-600 shrink-0" />}
                  <span>{opt}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isCorrect ? '¡Correcto! 🎉' : 'Respuesta correcta:'}
                  </p>
                  <p className="text-sm text-forest-700">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg shadow-forest-500/20"
                >
                  {current < questions.length - 1 ? 'Siguiente' : 'Ver resultado'}
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
