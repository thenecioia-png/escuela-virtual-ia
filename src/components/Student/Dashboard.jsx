import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Clock, TrendingUp, BookOpen, Zap, Target, Brain, Accessibility, Volume2, VolumeX, Smile } from 'lucide-react';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';
import ProgressRing from './ProgressRing';

export default function Dashboard({ profile, progress, adaptiveEngine, onStartLesson, onViewProgress, onOpenAccessibility }) {
  const { recommendedPath, weakAreas, strongAreas, totalStars = progress.totalStars, adaptations = [], emotionalState = 'neutral' } = adaptiveEngine;
  const [showModelInfo, setShowModelInfo] = useState(false);

  const getOverallProgress = () => {
    const subjects = Object.keys(progress.subjectProgress);
    if (subjects.length === 0) return 0;
    let total = 0;
    let count = 0;
    subjects.forEach((sid) => {
      const levels = progress.subjectProgress[sid] || {};
      Object.values(levels).forEach((v) => { total += v; count++; });
    });
    return count > 0 ? Math.min((total / (count * 3)) * 100, 100) : 0;
  };

  const getSubjectProgressPercent = (subjectId) => {
    const levels = progress.subjectProgress[subjectId] || {};
    const total = Object.values(levels).reduce((a, b) => a + b, 0);
    const max = 5 * 3;
    return Math.min((total / max) * 100, 100);
  };

  const modelLabels = {
    adaptive: { name: 'Adaptativo IA', emoji: '🤖', desc: 'La app elige el mejor método automáticamente' },
    montessori: { name: 'Montessori', emoji: '🌱', desc: 'Explora con las manos y a tu propio ritmo' },
    flipped: { name: 'Aula Invertida', emoji: '🔄', desc: 'Descubre primero, practica después' },
    gamified: { name: 'Gamificación', emoji: '🎮', desc: 'Misiones, puntos y desafíos divertidos' },
    udl: { name: 'Diseño Universal', emoji: '🌍', desc: 'Muchas formas de aprender lo mismo' },
    multisensory: { name: 'Multi-sensorial', emoji: '✨', desc: 'Ver, oír, tocar y moverse juntos' },
  };

  const currentModel = modelLabels[profile.pedagogicalModel] || modelLabels.adaptive;

  // Mensaje emocional adaptativo
  const getEmotionalMessage = () => {
    if (emotionalState === 'frustrated') return 'Vamos a hacerlo más fácil hoy. Un pasito a la vez. 🤗';
    if (emotionalState === 'struggling') return 'Estoy aquí para ayudarte. Tú puedes. 💪';
    const lastCheck = profile.emotionalHistory?.slice(-1)[0];
    if (lastCheck?.mood === 'happy') return '¡Me alegra verte feliz! Vamos a aprender algo genial. 🌟';
    if (lastCheck?.mood === 'tired') return 'Hoy vamos tranquilitos. Sin prisa. 🐢';
    return `¡Hola, ${profile.name}! ¿Listo/a para una aventura de aprendizaje? 🚀`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="text-6xl animate-float">{profile.avatar}</div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-black text-forest-900">
            {getEmotionalMessage()}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-forest-600">
              Estilo: <span className="font-bold text-forest-700 capitalize">{profile.learningStyle}</span>
            </span>
            <button
              onClick={() => setShowModelInfo(!showModelInfo)}
              className="flex items-center gap-1 text-xs font-bold bg-forest-50 hover:bg-forest-100 rounded-full px-2 py-1 transition-colors"
            >
              <Brain size={12} className="text-forest-500" />
              {currentModel.emoji} {currentModel.name}
            </button>
          </div>
          {showModelInfo && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-forest-500 mt-2 bg-forest-50 rounded-xl p-3"
            >
              {currentModel.desc}
              {adaptations.length > 0 && (
                <span className="block mt-1 text-xs text-forest-400">
                  Adaptaciones activas: {adaptations.map(a => a.replace(/_/g, ' ')).join(', ')}
                </span>
              )}
            </motion.p>
          )}
          {weakAreas.length > 0 && (
            <p className="text-sm text-berry-500 mt-2 font-semibold">
              💪 Practiquemos un poco más: {weakAreas.map((w) => SUBJECTS.find((s) => s.id === w)?.name).join(', ')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <ProgressRing progress={getOverallProgress()} size={100} strokeWidth={8} />
          <span className="text-xs font-bold text-forest-500 mt-2">Tu avance</span>
        </div>
      </motion.div>

      {/* Accessibility quick actions */}
      {(profile.accessibility?.dyslexicFont || profile.accessibility?.largeText || profile.accessibility?.highContrast || profile.accessibility?.reduceMotion) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          <span className="text-xs font-bold text-forest-400 self-center mr-1">Adaptaciones activas:</span>
          {profile.accessibility?.dyslexicFont && (
            <span className="text-xs font-bold bg-sky-50 text-sky-600 rounded-full px-2 py-1 flex items-center gap-1">
              <Accessibility size={10} /> Fuente dislexia
            </span>
          )}
          {profile.accessibility?.largeText && (
            <span className="text-xs font-bold bg-amber-50 text-amber-600 rounded-full px-2 py-1">🔍 Texto grande</span>
          )}
          {profile.accessibility?.highContrast && (
            <span className="text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-1">👁️ Alto contraste</span>
          )}
          {profile.accessibility?.reduceMotion && (
            <span className="text-xs font-bold bg-violet-50 text-violet-600 rounded-full px-2 py-1">✋ Sin animación</span>
          )}
          {profile.accessibility?.reduceSound && (
            <span className="text-xs font-bold bg-rose-50 text-rose-600 rounded-full px-2 py-1 flex items-center gap-1">
              <VolumeX size={10} /> Silencio
            </span>
          )}
          <button
            onClick={onOpenAccessibility}
            className="text-xs font-bold text-forest-500 hover:text-forest-700 underline ml-auto"
          >
            Cambiar ajustes
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Estrellas', value: progress.totalStars, icon: Star, color: 'text-sun-500', bg: 'bg-sun-50' },
          { label: 'Racha', value: `${progress.streakDays} días`, icon: Flame, color: 'text-berry-500', bg: 'bg-berry-50' },
          { label: 'Minutos', value: progress.timeSpentMinutes, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Correctas', value: `${progress.answers.correct}`, icon: TrendingUp, color: 'text-forest-500', bg: 'bg-forest-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} mb-2`}>
              <stat.icon size={18} />
            </div>
            <span className="text-xl font-black text-forest-900">{stat.value}</span>
            <span className="text-xs font-bold text-forest-400">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendedPath.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-sun-500" />
            <h3 className="text-lg font-black text-forest-900">Recomendado para ti</h3>
            {emotionalState !== 'neutral' && (
              <span className="text-xs font-bold bg-rose-50 text-rose-500 rounded-full px-2 py-0.5">
                Adaptado a tu estado
              </span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedPath.map((lesson, i) => {
              const colors = COLOR_MAP[lesson.subjectColor] || COLOR_MAP.forest;
              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartLesson(lesson.subjectId, lesson.levelId, lesson.difficulty)}
                  className={`glass-card rounded-2xl p-5 text-left border-l-4 ${colors.border.replace('border-', 'border-l-')} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest-400">{lesson.subjectName}</span>
                    <span className="text-lg">{SUBJECTS.find((s) => s.id === lesson.subjectId)?.icon}</span>
                  </div>
                  <h4 className="font-black text-forest-900 mb-1">{lesson.title}</h4>
                  <p className="text-xs text-forest-500 mb-3">{lesson.difficulty === 0 ? 'Nivel: Principiante' : lesson.difficulty === 1 ? 'Nivel: Intermedio' : 'Nivel: Avanzado'}</p>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
                      <BookOpen size={12} className="inline mr-1" />
                      Empezar
                    </div>
                    {lesson.adaptations?.includes('reduce_difficulty') && (
                      <span className="text-xs bg-rose-50 text-rose-500 rounded-lg px-2 py-1 font-bold">Más fácil</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* All subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-forest-500" />
            <h3 className="text-lg font-black text-forest-900">Todas las materias</h3>
          </div>
          <button onClick={onViewProgress} className="text-sm font-bold text-forest-500 hover:text-forest-700 transition-colors">
            Ver progreso
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUBJECTS.map((subject, i) => {
            const colors = COLOR_MAP[subject.color] || COLOR_MAP.forest;
            const pct = getSubjectProgressPercent(subject.id);
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{subject.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-black text-forest-900 text-sm">{subject.name}</h4>
                    <p className="text-xs text-forest-400">{subject.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-forest-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}
                      style={{ backgroundColor: pct > 0 ? undefined : 'transparent' }}
                    />
                  </div>
                  <span className="text-xs font-black text-forest-500 w-10 text-right">{Math.round(pct)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-sun-500" />
            <h3 className="text-lg font-black text-forest-900">Tus logros</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.achievements.map((achId) => {
              const ach = adaptiveEngine.achievements?.find((a) => a.id === achId);
              if (!ach) return null;
              return (
                <motion.div
                  key={achId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="glass-card rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-lg">{ach.icon}</span>
                  <span className="text-xs font-bold text-forest-700">{ach.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emotional check-in quick button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { /* El layout maneja esto */ }}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-forest-600 hover:bg-rose-50 transition-colors"
      >
        <Smile size={18} className="text-rose-400" />
        <span className="text-sm font-bold">¿Cómo te sientes? Cuéntame en Papá/Mamá →</span>
      </motion.button>
    </div>
  );
}
