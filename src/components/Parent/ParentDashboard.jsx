import { motion } from 'framer-motion';
import { BarChart3, Clock, Star, TrendingUp, AlertCircle, Lightbulb, Calendar, BookOpen } from 'lucide-react';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';

export default function ParentDashboard({ profile, progress }) {
  const getSubjectProgress = (subjectId) => {
    const levels = progress.subjectProgress[subjectId] || {};
    const total = Object.values(levels).reduce((a, b) => a + b, 0);
    const max = 5 * 3;
    return Math.min((total / max) * 100, 100);
  };

  const getWeakSubjects = () => {
    return SUBJECTS.filter((s) => getSubjectProgress(s.id) < 30).map((s) => s.name);
  };

  const getStrongSubjects = () => {
    return SUBJECTS.filter((s) => getSubjectProgress(s.id) > 60).map((s) => s.name);
  };

  const weakSubjects = getWeakSubjects();
  const strongSubjects = getStrongSubjects();

  const getHomeTips = () => {
    const tips = [];
    if (weakSubjects.includes('Matemáticas')) {
      tips.push({
        subject: 'Matemáticas',
        tip: 'Usa objetos del hogar (frutas, bloques) para practicar sumas y restas de forma tangible.',
        icon: '🔢',
      });
    }
    if (weakSubjects.includes('Lectura')) {
      tips.push({
        subject: 'Lectura',
        tip: 'Lee juntos 15 minutos antes de dormir. Pregunta qué le pareció el cuento.',
        icon: '📖',
      });
    }
    if (weakSubjects.includes('Lógica')) {
      tips.push({
        subject: 'Lógica',
        tip: 'Juega a ordenar objetos por tamaño, color o forma. Los rompecabezas también ayudan.',
        icon: '🧩',
      });
    }
    if (weakSubjects.includes('Ciencias')) {
      tips.push({
        subject: 'Ciencias',
        tip: 'Salgan al jardín o parque. Observen plantas, insectos y hablen sobre ellos.',
        icon: '🔬',
      });
    }
    if (weakSubjects.includes('Emociones')) {
      tips.push({
        subject: 'Emociones',
        tip: 'Pregunta cómo se siente durante el día. Nombren juntos las emociones.',
        icon: '❤️',
      });
    }
    if (tips.length === 0) {
      tips.push({
        subject: 'General',
        tip: '¡Excelente progreso! Sigue fomentando la curiosidad con preguntas abiertas.',
        icon: '🌟',
      });
    }
    return tips;
  };

  const recentSessions = (progress.sessionHistory || []).slice(-7).reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8"
      >
        <h2 className="text-2xl font-black text-forest-900 mb-1">Panel de Papá / Mamá 👨‍👩‍👧</h2>
        <p className="text-forest-500 mb-6">Así va {profile.name || 'tu pequeño/a'} en su aventura de aprendizaje.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Estrellas totales', value: progress.totalStars, icon: Star, color: 'text-sun-500' },
            { label: 'Minutos estudiados', value: progress.timeSpentMinutes, icon: Clock, color: 'text-sky-500' },
            { label: 'Respuestas correctas', value: progress.answers.correct, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Racha actual', value: `${progress.streakDays} días`, icon: BarChart3, color: 'text-berry-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 rounded-2xl p-4 text-center"
            >
              <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <div className="text-xl font-black text-forest-900">{stat.value}</div>
              <div className="text-xs font-bold text-forest-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress by subject */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-forest-500" />
          <h3 className="text-lg font-black text-forest-900">Progreso por materia</h3>
        </div>
        <div className="space-y-4">
          {SUBJECTS.map((subject) => {
            const pct = getSubjectProgress(subject.id);
            const colors = COLOR_MAP[subject.color] || COLOR_MAP.forest;
            return (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{subject.icon}</span>
                    <span className="text-sm font-bold text-forest-800">{subject.name}</span>
                  </div>
                  <span className="text-xs font-black text-forest-500">{Math.round(pct)}%</span>
                </div>
                <div className="h-3 bg-forest-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.bg.includes('sky') ? '#0ea5e9' : colors.bg.includes('sun') ? '#f59e0b' : colors.bg.includes('berry') ? '#ec4899' : colors.bg.includes('lavender') ? '#8b5cf6' : '#4a7c59' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak / Strong areas */}
      <div className="grid sm:grid-cols-2 gap-4">
        {weakSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-6 border-l-4 border-amber-400"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-amber-500" />
              <h3 className="font-black text-forest-900">Áreas por reforzar</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {weakSubjects.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {strongSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-6 border-l-4 border-emerald-400"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-emerald-500" />
              <h3 className="font-black text-forest-900">Fortalezas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {strongSubjects.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Home tips */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb size={20} className="text-sun-500" />
          <h3 className="text-lg font-black text-forest-900">Consejos para apoyar en casa</h3>
        </div>
        <div className="space-y-3">
          {getHomeTips().map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 bg-white/60 rounded-2xl p-4"
            >
              <span className="text-xl shrink-0">{tip.icon}</span>
              <div>
                <span className="text-xs font-bold text-forest-400 uppercase tracking-wider">{tip.subject}</span>
                <p className="text-sm text-forest-700 font-medium mt-0.5">{tip.tip}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentSessions.length > 0 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={20} className="text-forest-500" />
            <h3 className="text-lg font-black text-forest-900">Actividad reciente</h3>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session, i) => {
              const date = new Date(session.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
              const subject = SUBJECTS.find((s) => s.id === session.subjectId);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span>{subject?.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-forest-800">{subject?.name}</p>
                      <p className="text-xs text-forest-400">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <BookOpen size={12} className="text-forest-400" />
                      <span className="text-xs font-bold text-forest-500">{session.timeMinutes} min</span>
                    </div>
                    <div className={`text-xs font-black px-2 py-1 rounded-lg ${session.score >= 80 ? 'bg-emerald-100 text-emerald-700' : session.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {session.score}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
