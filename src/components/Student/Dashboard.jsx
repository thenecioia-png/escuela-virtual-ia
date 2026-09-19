import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Clock, TrendingUp, BookOpen, Zap, Target, Brain, Accessibility, Volume2, VolumeX, Smile, MessageCircleHeart, Lightbulb, StickyNote, Sparkles, ClipboardList, Compass, CheckCircle2, Lock, Play } from 'lucide-react';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';
import { getCountry, getGrade } from '../../lib/curricula';
import { isTutorConfigured, generateLesson, adaptAiLesson } from '../../lib/tutorApi';
import { accuracy } from '../../lib/skillMap';
import { ALL_AREAS, getAreaPathState, getNextTeacherSkill } from '../../lib/lifeSkillMap';
import { supabase, isCloudConfigured } from '../../lib/supabase';
import { getStorage, setStorage, removeStorage } from '../../utils/storage';
import ProgressRing from './ProgressRing';

export default function Dashboard({ profile, progress, adaptiveEngine, onStartLesson, onStartAiLesson, onStartExam, onStartDiagnostic, onStartSkillPractice, onStartTeacherClass, onViewProgress, onOpenAccessibility, parentMessages = [], onReadMessage }) {
  const { recommendedPath, weakAreas, strongAreas, totalStars = progress.totalStars, adaptations = [], emotionalState = 'neutral' } = adaptiveEngine;
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [topicSel, setTopicSel] = useState({});        // tema elegido por materia del currículo
  const [generando, setGenerando] = useState(null);   // id de materia generando
  const [errorIA, setErrorIA] = useState(null);

  // Mapa de dominio por habilidad, por área (mates, dinero, tiempo, medidas,
  // lectura, ciencias). Se recalcula cuando cambia el progreso, porque cada
  // sesión de práctica también actualiza el mapa en localStorage.
  const areaPaths = useMemo(
    () => ALL_AREAS.map((area) => ({ area, state: getAreaPathState(profile.id, area) })),
    [profile.id, progress]
  );
  const anyHasData = areaPaths.some((a) => a.state.hasData);

  // Clase de hoy con la maestra IA: la habilidad que más necesita (de todos los mapas)
  const teacherTarget = useMemo(() => getNextTeacherSkill(profile.id), [profile.id, progress]);

  // Minutos estudiados hoy (del historial local de sesiones)
  const todayStr = new Date().toDateString();
  const todayMinutes = (progress.sessionHistory || [])
    .filter((s) => new Date(s.date).toDateString() === todayStr)
    .reduce((a, s) => a + (s.timeMinutes || 0), 0);

  // Examen de repaso "debido" cada 5 sesiones registradas (incluye el propio
  // examen, que al sumar 1 rompe el múltiplo y deja de mostrarse).
  const sessionCount = (progress.sessionHistory || []).length;
  const examDue = sessionCount > 0 && sessionCount % 5 === 0;

  // Materias del currículo del país/grado del estudiante
  const grade = getGrade(profile.countryCode, profile.gradeId);

  // Práctica automática del grado real: genera una lección de IA por materia
  // y la cachea en localStorage para no depender del "Recomendado para ti"
  // (que antes servía solo contenido hardcodeado de 1°-2°).
  const [gradeLessons, setGradeLessons] = useState(null);
  const [cargandoGrado, setCargandoGrado] = useState(false);
  const [errorGrado, setErrorGrado] = useState(null);
  const [regenerar, setRegenerar] = useState(0);

  const gradeCacheKey = `grado_${profile.id}_${profile.gradeId}`;

  useEffect(() => {
    if (!grade?.subjects?.length || !isTutorConfigured) return;

    const cached = getStorage(gradeCacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setGradeLessons(cached);
      return;
    }

    let cancelado = false;
    const preparar = async () => {
      setCargandoGrado(true);
      setErrorGrado(null);
      const results = [];
      for (const subject of grade.subjects) {
        if (cancelado) return;
        try {
          const data = await generateLesson({
            country: getCountry(profile.countryCode)?.name,
            grade: grade.label,
            subject: subject.name,
            topic: subject.topics[0],
            age: profile.age,
          });
          const lesson = adaptAiLesson(data, { subjectName: subject.name });
          if (lesson) {
            results.push({ ...lesson, subjectId: subject.id, topic: subject.topics[0] });
          }
        } catch {
          // una materia falló; continuamos con el resto
        }
      }
      if (!cancelado) {
        if (results.length > 0) {
          setStorage(gradeCacheKey, results);
          setGradeLessons(results);
        } else {
          setErrorGrado('No se pudieron preparar las lecciones ahora. Intenta de nuevo.');
        }
        setCargandoGrado(false);
      }
    };
    preparar();

    return () => { cancelado = true; };
  }, [grade, profile.id, profile.gradeId, profile.countryCode, profile.age, regenerar, gradeCacheKey]);

  // Crear una lección nueva con IA para un tema sin lección hardcodeada
  const crearLeccionIA = async (subject) => {
    const topic = topicSel[subject.id] || subject.topics[0];
    setGenerando(subject.id);
    setErrorIA(null);
    const data = await generateLesson({
      country: getCountry(profile.countryCode)?.name,
      grade: grade?.label,
      subject: subject.name,
      topic,
      age: profile.age,
    });
    const lesson = adaptAiLesson(data, { subjectName: subject.name });
    if (!lesson) {
      setGenerando(null);
      setErrorIA('No se pudo crear la lección ahora. Intenta de nuevo en un momento.');
      return;
    }
    // Cachear en la nube (si está configurada; la escritura puede requerir
    // service-role en el servidor — si falla, la lección igual se juega)
    if (isCloudConfigured && supabase) {
      try {
        await supabase.from('lessons').upsert(
          {
            country_code: profile.countryCode || 'do',
            grade: grade?.label || '',
            subject: subject.name,
            topic,
            content: data,
            source: 'ai',
          },
          { onConflict: 'country_code,grade,subject,topic' }
        );
      } catch {
        // sin permiso o sin red: no bloquea el juego
      }
    }
    setGenerando(null);
    onStartAiLesson(lesson, subject.id, topic);
  };

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
            <span className="flex items-center gap-1 text-xs font-bold bg-sky-50 text-sky-600 rounded-full px-2 py-1">
              <Clock size={12} />
              Hoy: {todayMinutes} min
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

      {/* Clase con tu maestra: la IA enseña paso a paso lo que más necesitas */}
      {onStartTeacherClass && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 sm:p-6 border-l-4 border-berry-400 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="text-4xl">👩‍🏫</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-forest-900">Clase con tu maestra</h3>
            <p className="text-sm text-forest-600">
              {teacherTarget
                ? `Hoy: ${teacherTarget.skill.name.toLowerCase()} ${teacherTarget.isWeak ? '— la repasamos porque es donde más te cuesta un poquito' : '— tu siguiente paso'}. Tu maestra te lo explica paso a paso.`
                : 'Tu maestra te dará una clase hecha a tu medida. Primero haz el diagnóstico para conocerte.'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartTeacherClass}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25 shrink-0"
          >
            <Sparkles size={18} />
            Empezar clase
          </motion.button>
        </motion.div>
      )}

      {/* Diagnóstico adaptativo: se ofrece automáticamente si aún no hay datos */}
      {!anyHasData && onStartDiagnostic && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 sm:p-6 border-l-4 border-sky-400 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="text-4xl">🧭</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-forest-900">Descubre tu camino</h3>
            <p className="text-sm text-forest-600">
              Un juego cortito de preguntas de matemáticas, dinero, tiempo, lectura y ciencias para conocerte mejor y prepararte un camino hecho a tu medida. No es un examen: ¡equivocarse también ayuda!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartDiagnostic}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25 shrink-0"
          >
            <Compass size={18} />
            Empezar
          </motion.button>
        </motion.div>
      )}

      {/* Tu camino: una sección por área con dominadas, la actual y bloqueadas */}
      {anyHasData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-sky-500" />
              <h3 className="text-lg font-black text-forest-900">Tu camino</h3>
            </div>
            {onStartDiagnostic && (
              <button
                onClick={onStartDiagnostic}
                className="text-xs font-bold text-sky-500 hover:text-sky-700 transition-colors"
              >
                Repetir diagnóstico
              </button>
            )}
          </div>
          <div className="space-y-6">
            {areaPaths.filter(({ state }) => state.hasData).map(({ area, state }) => (
              <div key={area.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{area.emoji}</span>
                  <div>
                    <p className="text-sm font-black text-forest-800">{area.name}</p>
                    <p className="text-xs text-forest-400">{area.blurb}</p>
                  </div>
                  {state.current && onStartSkillPractice && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onStartSkillPractice(state.current.id)}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-md shadow-sky-500/20 shrink-0"
                    >
                      <Play size={12} />
                      Practicar
                    </motion.button>
                  )}
                </div>
                <div className="space-y-2">
                  {area.skills.map((skill) => {
                    const status = state.statuses[skill.id];
                    const acc = accuracy(state.map[skill.id]);
                    const isCurrent = state.current?.id === skill.id;
                    const isLocked = state.locked.some((s) => s.id === skill.id);
                    return (
                      <div
                        key={skill.id}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                          isCurrent
                            ? 'bg-sky-50 border-2 border-sky-300'
                            : status === 'dominada'
                              ? 'bg-emerald-50/60'
                              : isLocked
                                ? 'bg-white/40 opacity-60'
                                : 'bg-white/60'
                        }`}
                      >
                        {status === 'dominada' ? (
                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        ) : isLocked ? (
                          <Lock size={18} className="text-forest-300 shrink-0" />
                        ) : (
                          <span className="text-lg shrink-0">{skill.emoji}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-forest-800 truncate">{skill.name}</p>
                          {acc !== null && (
                            <p className="text-xs text-forest-400 font-semibold">{acc}% de aciertos</p>
                          )}
                          {isCurrent && (
                            <p className="text-xs font-bold text-sky-600">Estás aquí · vamos a practicar esto</p>
                          )}
                        </div>
                        {isCurrent && onStartSkillPractice && (
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onStartSkillPractice(skill.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-md shadow-sky-500/20 shrink-0"
                          >
                            <Play size={12} />
                            Practicar
                          </motion.button>
                        )}
                        {status === 'dominada' && (
                          <span className="text-xs font-black text-emerald-600 shrink-0">¡Dominada!</span>
                        )}
                        {status === 'necesita_ayuda' && !isCurrent && onStartSkillPractice && (
                          <button
                            onClick={() => onStartSkillPractice(skill.id)}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 shrink-0"
                          >
                            Repasar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Áreas sin explorar todavía: invitación corta a probarlas */}
      {anyHasData && areaPaths.some(({ state }) => !state.hasData) && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {areaPaths.filter(({ state }) => !state.hasData).map(({ area }) => (
            <div key={area.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{area.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-forest-800">{area.name}</p>
                <p className="text-xs text-forest-400 truncate">{area.blurb}</p>
              </div>
              {onStartSkillPractice && (
                <button
                  onClick={() => onStartSkillPractice(area.skills[0].id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-forest-50 text-forest-600 hover:bg-forest-100 transition-colors shrink-0"
                >
                  <Play size={12} />
                  Probar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Examen de repaso (aparece cada 5 sesiones) */}
      {examDue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 sm:p-6 border-l-4 border-berry-400 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="text-4xl">📝</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-forest-900">¡Examen de repaso!</h3>
            <p className="text-sm text-forest-600">
              Demuestra todo lo que has aprendido. Mide lo que recuerdas (no sube de nivel).
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartExam}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25 shrink-0"
          >
            <ClipboardList size={18} />
            Hacer examen
          </motion.button>
        </motion.div>
      )}

      {/* Mensajes de Papá/Mamá (llegan en vivo si hay nube) */}
      {parentMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 border-l-4 border-berry-400 space-y-3"
        >
          <div className="flex items-center gap-2">
            <MessageCircleHeart size={18} className="text-berry-500" />
            <h3 className="text-sm font-black text-forest-900">Mensajes de Papá / Mamá</h3>
          </div>
          {parentMessages.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-3 bg-white/70 rounded-2xl px-4 py-3">
              <div className="flex items-start gap-2">
                {m.tipo === 'pista' ? (
                  <Lightbulb size={16} className="text-sun-500 shrink-0 mt-0.5" />
                ) : m.tipo === 'nota' ? (
                  <StickyNote size={16} className="text-sky-500 shrink-0 mt-0.5" />
                ) : (
                  <MessageCircleHeart size={16} className="text-berry-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-forest-400">
                    {m.tipo === 'pista' ? 'Pista' : m.tipo === 'nota' ? 'Nota' : 'Ánimo'}
                  </span>
                  <p className="text-sm font-semibold text-forest-800">{m.texto}</p>
                </div>
              </div>
              {!m.leido && onReadMessage && (
                <button
                  onClick={() => onReadMessage(m.id)}
                  className="text-xs font-bold text-berry-500 hover:text-berry-700 shrink-0"
                >
                  Marcar leído
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}

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

      {/* Práctica de tu grado (auto-generada con IA) */}
      {grade?.subjects?.length > 0 && isTutorConfigured && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-lavender-500" />
              <h3 className="text-lg font-black text-forest-900">Tu práctica de {grade.label}</h3>
            </div>
            {gradeLessons && gradeLessons.length > 0 && (
              <button
                onClick={() => {
                  removeStorage(gradeCacheKey);
                  setGradeLessons(null);
                  setRegenerar((r) => r + 1);
                }}
                className="text-sm font-bold text-forest-500 hover:text-forest-700 transition-colors"
              >
                Preparar más lecciones
              </button>
            )}
          </div>
          {cargandoGrado && (
            <p className="text-sm text-forest-500 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="animate-pulse" /> Preparando tus lecciones del grado…
            </p>
          )}
          {errorGrado && (
            <p className="mb-3 text-xs font-bold text-rose-500">{errorGrado}</p>
          )}
          {gradeLessons && gradeLessons.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gradeLessons.map((lesson, i) => {
                const subject = grade.subjects.find((s) => s.id === lesson.subjectId);
                return (
                  <motion.button
                    key={`${lesson.subjectId}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStartAiLesson(lesson, lesson.subjectId, lesson.topic)}
                    className="glass-card rounded-2xl p-5 text-left border-l-4 border-l-lavender-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-forest-400">
                        {lesson.subjectName || subject?.name}
                      </span>
                      <Sparkles size={14} className="text-lavender-500" />
                    </div>
                    <h4 className="font-black text-forest-900 mb-1">{lesson.title}</h4>
                    <p className="text-xs text-forest-500 mb-3">{lesson.totalItems} preguntas</p>
                    <div className="text-xs font-bold px-2 py-1 rounded-lg bg-lavender-50 text-lavender-600 inline-flex items-center gap-1">
                      <BookOpen size={12} /> Empezar
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  onClick={() => onStartLesson(lesson.subjectId, lesson.levelId, lesson.lessonIndex)}
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

      {/* Currículo de tu grado: crear lecciones nuevas con IA */}
      {grade?.subjects?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-lavender-500" />
            <h3 className="text-lg font-black text-forest-900">Materias de tu grado ({grade.label})</h3>
          </div>
          {errorIA && (
            <p className="mb-3 text-xs font-bold text-rose-500">{errorIA}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {grade.subjects.map((subject) => (
              <div key={subject.id} className="glass-card rounded-2xl p-4">
                <h4 className="font-black text-forest-900 text-sm mb-2">{subject.name}</h4>
                <select
                  value={topicSel[subject.id] || subject.topics[0]}
                  onChange={(e) => setTopicSel((prev) => ({ ...prev, [subject.id]: e.target.value }))}
                  className="w-full mb-3 bg-white border-2 border-forest-100 rounded-xl px-3 py-2 text-xs font-bold text-forest-700 focus:outline-none focus:border-forest-300"
                >
                  {subject.topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {isTutorConfigured ? (
                  <button
                    onClick={() => crearLeccionIA(subject)}
                    disabled={generando !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-lavender-500 text-white hover:bg-lavender-600 disabled:opacity-50 transition-all"
                  >
                    <Sparkles size={12} />
                    {generando === subject.id ? 'Creando tu lección…' : 'Crear lección nueva con IA'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-forest-300">Lecciones con IA: próximamente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {progress.achievements.length > 0 && (        <div>
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
