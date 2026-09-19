import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Home, Compass, Star } from 'lucide-react';
import {
  MATH_SKILLS,
  recordAttempt,
  diagnosticNextSkillIndex,
  DIAGNOSTIC_MAX_QUESTIONS,
  DIAGNOSTIC_MAX_PER_SKILL,
  DIAGNOSTIC_START_INDEX,
} from '../../lib/skillMap';

// Evaluación diagnóstica adaptativa: empieza fácil y sube/baja de nivel según
// acierte o falle, hasta ubicar el nivel real en restas y multiplicación.
// Cada intento se registra en el mapa de habilidades (localStorage).
export default function DiagnosticPlayer({ studentId, onFinish, onHome }) {
  const [skillIndex, setSkillIndex] = useState(DIAGNOSTIC_START_INDEX);
  const [question, setQuestion] = useState(() => MATH_SKILLS[DIAGNOSTIC_START_INDEX].gen());
  const [skillResults, setSkillResults] = useState({ correct: 0, wrong: 0, asked: 1 });
  const [totalAsked, setTotalAsked] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [complete, setComplete] = useState(false);
  const [lastSkillName, setLastSkillName] = useState(null);
  const startTime = useRef(Date.now());
  const questionTime = useRef(Date.now());
  // La habilidad más alta donde acertó al menos 2 veces
  const bestSkillIndex = useRef(-1);

  const skill = MATH_SKILLS[skillIndex];

  const finish = (correctCount) => {
    setComplete(true);
    return correctCount;
  };

  const handleSelect = (opt) => {
    if (showResult) return;
    const correct = opt === question.answer;
    const ms = Date.now() - questionTime.current;
    setSelected(opt);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setTotalCorrect((c) => c + 1);
      if (skillResults.correct + 1 >= 2) bestSkillIndex.current = Math.max(bestSkillIndex.current, skillIndex);
    }
    recordAttempt(studentId, skill.id, { correct, q: question.q, wrong: opt, answer: question.answer, ms });
    setSkillResults((r) => ({ ...r, correct: r.correct + (correct ? 1 : 0), wrong: r.wrong + (correct ? 0 : 1) }));
  };

  const handleNext = () => {
    const results = {
      correct: skillResults.correct,
      wrong: skillResults.wrong,
    };
    let nextIndex = skillIndex;
    // ¿Cambiamos de habilidad? (2 aciertos → sube, 2 fallos → baja, 3 preguntas → decide por mayoría)
    if (results.correct >= 2) {
      nextIndex = diagnosticNextSkillIndex(skillIndex, results);
    } else if (results.wrong >= 2) {
      nextIndex = diagnosticNextSkillIndex(skillIndex, results);
    } else if (skillResults.asked >= DIAGNOSTIC_MAX_PER_SKILL) {
      nextIndex = results.correct > results.wrong ? skillIndex + 1 : skillIndex - 1;
    }
    nextIndex = Math.max(0, Math.min(MATH_SKILLS.length - 1, nextIndex));

    const done = totalAsked >= DIAGNOSTIC_MAX_QUESTIONS || (nextIndex !== skillIndex && totalAsked >= DIAGNOSTIC_MAX_QUESTIONS);
    if (done) {
      finish(totalCorrect);
      return;
    }

    if (nextIndex !== skillIndex) {
      setLastSkillName(skill.name);
      setSkillIndex(nextIndex);
      setSkillResults({ correct: 0, wrong: 0, asked: 1 });
      setQuestion(MATH_SKILLS[nextIndex].gen());
    } else {
      setSkillResults((r) => ({ ...r, asked: r.asked + 1 }));
      setQuestion(skill.gen());
    }
    setTotalAsked((t) => t + 1);
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
    questionTime.current = Date.now();
  };

  const handleFinish = () => {
    const percentage = Math.round((totalCorrect / totalAsked) * 100);
    const timeMinutes = Math.max(1, Math.round((Date.now() - startTime.current) / 60000));
    onFinish(percentage, timeMinutes);
  };

  // Pantalla final: celebra y muestra el punto de partida de su camino
  if (complete) {
    const best = bestSkillIndex.current >= 0 ? MATH_SKILLS[bestSkillIndex.current] : null;
    const nextSkill = MATH_SKILLS[Math.min((bestSkillIndex.current >= 0 ? bestSkillIndex.current : 0) + 1, MATH_SKILLS.length - 1)];
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
          🧭
        </motion.div>
        <h2 className="text-2xl font-black text-forest-900 mb-2">¡Ya conozco tu camino!</h2>
        <p className="text-forest-600 mb-4">
          Respondiste <strong>{totalCorrect}</strong> de <strong>{totalAsked}</strong> correctamente.
        </p>
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 mb-6 text-left">
          {best ? (
            <p className="text-sm font-bold text-sky-700 mb-1">
              Ya dominas muy bien: {best.name}
            </p>
          ) : (
            <p className="text-sm font-bold text-sky-700 mb-1">Vamos a empezar desde lo más fácil, sin prisa.</p>
          )}
          <p className="text-sm text-forest-700">
            Tu próxima aventura: <strong>{nextSkill?.name}</strong>. Practica un poquito cada día y verás qué rápido avanzas.
          </p>
        </div>
        <div className="flex justify-center gap-1.5 mb-6">
          {Array.from({ length: Math.max(1, Math.round((totalCorrect / totalAsked) * 5)) }).map((_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>
              <Star size={28} className="text-sun-400 fill-sun-400" />
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleFinish}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg shadow-forest-500/25 w-full"
        >
          <Compass size={18} />
          Ver mi camino
        </motion.button>
      </motion.div>
    );
  }

  // Pantalla de pregunta
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Compass size={22} className="text-sky-500" />
          <div>
            <h2 className="font-black text-forest-900 text-lg">Descubre tu camino</h2>
            <p className="text-xs text-forest-400 font-bold">
              {skill.name} · No es un examen, es un juego para conocerte
            </p>
          </div>
        </div>
        <button onClick={onHome} className="p-2 rounded-xl hover:bg-forest-50 text-forest-500 transition-colors">
          <Home size={18} />
        </button>
      </div>

      <div className="h-3 bg-forest-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full bg-sky-500"
          animate={{ width: `${(totalAsked / DIAGNOSTIC_MAX_QUESTIONS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={totalAsked}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          {lastSkillName && totalAsked > 1 && skillResults.asked === 1 && !showResult && (
            <p className="text-xs font-bold text-lavender-500 mb-3">
              Nueva mini-aventura: {skill.name}
            </p>
          )}
          <h3 className="text-3xl font-black text-forest-900 mb-6 text-center tracking-wide">{question.q}</h3>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt) => {
              let btnClass = 'choice-btn bg-white border-2 border-forest-100 text-forest-800 hover:border-sky-300';
              if (showResult) {
                if (opt === question.answer) {
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
                  whileHover={!showResult ? { scale: 1.03 } : {}}
                  whileTap={!showResult ? { scale: 0.97 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  className={`p-5 rounded-2xl font-black text-xl text-center transition-all flex items-center justify-center gap-2 ${btnClass}`}
                >
                  {showResult && opt === question.answer && <Check size={20} className="text-emerald-600 shrink-0" />}
                  {showResult && opt === selected && !isCorrect && <X size={20} className="text-rose-600 shrink-0" />}
                  {opt}
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
                    {isCorrect ? '¡Correcto! Qué bien lo haces.' : 'Casi... no pasa nada, así aprendo a ayudarte mejor.'}
                  </p>
                  <p className="text-sm text-forest-700">{question.explanation}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
                  >
                    Siguiente
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
