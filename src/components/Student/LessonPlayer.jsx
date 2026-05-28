import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, RotateCcw, Star, Trophy, Home, Coffee, Heart, Volume2 } from 'lucide-react';
import { getLesson } from '../../data/lessons';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';
import ProgressRing from './ProgressRing';

export default function LessonPlayer({ subjectId, levelId, lessonIndex, learningStyle, profile, adaptiveEngine, onFinish, onHome }) {
  const [lesson, setLesson] = useState(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showBreak, setShowBreak] = useState(false);
  const [breakData, setBreakData] = useState(null);
  const [sessionStartTime] = useState(Date.now());
  const timerRef = useRef(null);

  const { getLessonForStudent, getBreakRecommendation, getEncouragementMessage, adaptations = [] } = adaptiveEngine;

  useEffect(() => {
    const studentLesson = getLessonForStudent(subjectId, levelId, lessonIndex);
    if (!studentLesson) return;
    setLesson(studentLesson);
    setCurrentItem(0);
    setScore(0);
    setAnswers([]);
    setLessonComplete(false);
    setSelectedOption(null);
    setShowResult(false);
    setExplanationVisible(false);
    setEncouragement(getEncouragementMessage('start'));
    setShowBreak(false);
  }, [subjectId, levelId, lessonIndex, learningStyle, getLessonForStudent, getEncouragementMessage]);

  // Timer para breaks basado en duración de sesión
  useEffect(() => {
    if (!lesson || lessonComplete) return;
    const maxDuration = (profile.accessibility?.sessionDuration || 15) * 60 * 1000;
    const breakRec = getBreakRecommendation();
    const breakInterval = breakRec.afterMinutes * 60 * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      if (elapsed >= breakInterval && !showBreak) {
        setBreakData(breakRec);
        setShowBreak(true);
      }
      if (elapsed >= maxDuration && !lessonComplete) {
        // Auto-finalizar si se pasa el tiempo máximo
        setLessonComplete(true);
      }
    }, 10000); // revisar cada 10 segundos

    return () => clearInterval(timerRef.current);
  }, [lesson, lessonComplete, profile.accessibility, sessionStartTime, getBreakRecommendation, showBreak]);

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    const correct = option === lesson.items[currentItem].answer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore((s) => s + 1);
      setEncouragement(getEncouragementMessage('correct'));
    } else {
      setEncouragement(getEncouragementMessage('incorrect'));
    }
    setAnswers((a) => [...a, { item: currentItem, correct, selected: option }]);
    setTimeout(() => setExplanationVisible(true), 400);
  };

  const handleNext = () => {
    if (currentItem < lesson.items.length - 1) {
      setCurrentItem((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(false);
      setExplanationVisible(false);
      setEncouragement('');
    } else {
      setLessonComplete(true);
    }
  };

  const handleFinish = useCallback(() => {
    const total = lesson.items.length;
    const percentage = Math.round((score / total) * 100);
    const timeMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    onFinish(subjectId, levelId, percentage, timeMinutes);
  }, [lesson, score, startTime, subjectId, levelId, onFinish]);

  const handleRetry = () => {
    setCurrentItem(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setAnswers([]);
    setLessonComplete(false);
    setExplanationVisible(false);
    setEncouragement(getEncouragementMessage('start'));
    setShowBreak(false);
  };

  if (!lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-forest-400 animate-pulse">Cargando lección...</div>
      </div>
    );
  }

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const colors = COLOR_MAP[subject?.color] || COLOR_MAP.forest;
  const item = lesson.items[currentItem];
  const percentage = lessonComplete ? Math.round((score / lesson.items.length) * 100) : Math.round(((currentItem) / lesson.items.length) * 100);

  // Pantalla de descanso
  if (showBreak) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto glass-card rounded-3xl p-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          ☕
        </motion.div>
        <h2 className="text-2xl font-black text-forest-900 mb-2">¡Momento de descanso!</h2>
        <p className="text-forest-600 mb-6">{breakData?.activity || '¡Estira los brazos y respira profundo!'}</p>
        <div className="bg-forest-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-forest-600">
            {profile.accessibility?.breakFrequency === 'often'
              ? 'Tu cerebro y cuerpo necesitan moverse. ¡Es perfecto!'
              : 'Un pequeño descanso ayuda a que aprendas mejor.'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowBreak(false)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg"
        >
          <Coffee size={18} />
          Continuar aprendiendo
        </motion.button>
      </motion.div>
    );
  }

  // Pantalla de resultado final
  if (lessonComplete) {
    const stars = Math.ceil((score / lesson.items.length) * 5);
    const isStruggling = score < lesson.items.length * 0.5;
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
          {percentage >= 80 ? '¡Excelente trabajo!' : percentage >= 50 ? '¡Muy bien hecho!' : '¡Sigue practicando!'}
        </h2>
        <p className="text-forest-600 mb-4">
          Respondiste <strong>{score}</strong> de <strong>{lesson.items.length}</strong> correctamente
        </p>

        {/* Mensaje adaptativo */}
        {isStruggling && adaptations.includes('extra_encouragement') && (
          <div className="bg-rose-50 rounded-2xl p-4 mb-4 border border-rose-200">
            <p className="text-rose-700 font-bold text-sm">
              ❤️ Estoy orgulloso/a de tu esfuerzo. Lo importante es que intentaste.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: s <= stars ? 1 : 0.5 }}
              transition={{ delay: s * 0.15 }}
            >
              <Star
                size={32}
                className={s <= stars ? 'text-sun-400 fill-sun-400' : 'text-forest-200'}
              />
            </motion.div>
          ))}
        </div>

        <ProgressRing progress={percentage} size={140} strokeWidth={10} color={percentage >= 80 ? '#4a7c59' : percentage >= 50 ? '#f59e0b' : '#ec4899'} />

        {/* Adaptaciones sugeridas si tuvo dificultades */}
        {isStruggling && (
          <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-amber-700 font-bold text-sm mb-1">💡 Para la próxima:</p>
            <p className="text-sm text-forest-600">
              {profile.pedagogicalModel === 'adaptive'
                ? 'Voy a ajustar la dificultad y probar otra forma de explicar.'
                : 'Puedes cambiar tu modelo de aprendizaje en los ajustes.'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white text-forest-700 border-2 border-forest-200 hover:border-forest-400 transition-all"
          >
            <RotateCcw size={18} />
            Intentar de nuevo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg shadow-forest-500/25"
          >
            <Trophy size={18} />
            Guardar progreso
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{subject?.icon}</span>
          <div>
            <h2 className="font-black text-forest-900 text-lg">{lesson.title}</h2>
            <p className="text-xs text-forest-400 font-bold">{subject?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-forest-500">
            {currentItem + 1} / {lesson.items.length}
          </span>
          <button onClick={onHome} className="p-2 rounded-xl hover:bg-forest-50 text-forest-500 transition-colors">
            <Home size={18} />
          </button>
        </div>
      </div>

      {/* Mensaje de ánimo */}
      <AnimatePresence>
        {encouragement && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-2 text-center"
          >
            <p className="text-sm font-bold text-sky-700 flex items-center justify-center gap-2">
              <Heart size={14} className="text-sky-400" />
              {encouragement}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="h-3 bg-forest-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className={`h-full rounded-full ${colors.bg.replace('-50', '-500')}`}
          style={{ backgroundColor: colors.bg.includes('sky') ? '#0ea5e9' : colors.bg.includes('sun') ? '#f59e0b' : colors.bg.includes('berry') ? '#ec4899' : colors.bg.includes('lavender') ? '#8b5cf6' : '#4a7c59' }}
          initial={{ width: `${((currentItem) / lesson.items.length) * 100}%` }}
          animate={{ width: `${((currentItem + (showResult ? 1 : 0)) / lesson.items.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timer / Break indicator */}
      {profile.accessibility?.breakFrequency !== 'rarely' && (
        <div className="flex items-center justify-between mb-4 text-xs text-forest-400">
          <span className="flex items-center gap-1">
            <Coffee size={12} />
            Descanso en {Math.max(1, Math.ceil(((profile.accessibility?.sessionDuration || 15) * 60 * 1000 - (Date.now() - sessionStartTime)) / 60000))} min
          </span>
        </div>
      )}

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold mb-4 ${colors.soft} ${colors.text}`}>
            <span className="text-lg">💡</span>
            {lesson.instruction}
          </div>

          {/* Si hay multi-instruction (modelo multisensorial) */}
          {item.multiInstruction && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-bold text-amber-700">🎯 Usa todos tus sentidos:</p>
              <p className="text-xs text-amber-600">{item.multiInstruction}</p>
            </div>
          )}

          <h3 className="text-xl font-black text-forest-900 mb-6 leading-relaxed">{item.q}</h3>

          {/* Visual hint para modelos multisensoriales */}
          {(item.visualHint || item.auditoryHint || item.kinestheticHint) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {item.visualHint && (
                <div className="bg-sky-50 rounded-xl p-2 text-center">
                  <span className="text-xs font-bold text-sky-600">👁️ {item.visualHint}</span>
                </div>
              )}
              {item.auditoryHint && (
                <div className="bg-violet-50 rounded-xl p-2 text-center">
                  <span className="text-xs font-bold text-violet-600">👂 {item.auditoryHint}</span>
                </div>
              )}
              {item.kinestheticHint && (
                <div className="bg-emerald-50 rounded-xl p-2 text-center">
                  <span className="text-xs font-bold text-emerald-600">✋ {item.kinestheticHint}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {item.options.map((opt) => {
              let btnClass = 'choice-btn bg-white border-2 border-forest-100 text-forest-800 hover:border-forest-300';
              if (showResult) {
                if (opt === item.answer) {
                  btnClass = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800';
                } else if (opt === selectedOption && !isCorrect) {
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
                  {showResult && opt === item.answer && <Check size={18} className="text-emerald-600 shrink-0" />}
                  {showResult && opt === selectedOption && !isCorrect && <X size={18} className="text-rose-600 shrink-0" />}
                  <span>{opt}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {explanationVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isCorrect ? '¡Correcto! 🎉' : 'Casi... 💡'}
                  </p>
                  <p className="text-sm text-forest-700">{item.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
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
                  {currentItem < lesson.items.length - 1 ? 'Siguiente' : 'Ver resultado'}
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
