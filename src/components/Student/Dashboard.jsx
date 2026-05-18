import { motion } from 'framer-motion';
import { Star, Flame, Clock, TrendingUp, BookOpen, Zap, Target } from 'lucide-react';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';
import ProgressRing from './ProgressRing';

export default function Dashboard({ profile, progress, adaptiveEngine, onStartLesson, onViewProgress }) {
  const { recommendedPath, weakAreas, strongAreas, totalStars = progress.totalStars } = adaptiveEngine;

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
    const max = 5 * 3; // 5 levels, ~3 lessons each
    return Math.min((total / max) * 100, 100);
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
            ¡Hola, {profile.name}! 🌟
          </h2>
          <p className="text-forest-600 mt-1">
            Estilo de aprendizaje: <span className="font-bold text-forest-700 capitalize">{profile.learningStyle}</span>
          </p>
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
    </div>
  );
}
