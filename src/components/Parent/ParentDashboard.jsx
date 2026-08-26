import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Star, TrendingUp, AlertCircle, Lightbulb, Calendar, BookOpen, Brain, Heart, Accessibility, Shield, Zap, Send, Sparkles, MessageCircleHeart, GraduationCap, Radio, FileText, QrCode, Copy, Check } from 'lucide-react';
import { SUBJECTS, COLOR_MAP } from '../../data/subjects';
import { isTutorConfigured, generateHint, dailyRecommendation } from '../../lib/tutorApi';
import { getCountry, getGrade } from '../../lib/curricula';
import { supabase, isCloudConfigured } from '../../lib/supabase';
import { computeGrades, fetchGrades, currentPeriod } from '../../lib/grades';
import { buildShareLink } from '../../lib/familyShare';

export default function ParentDashboard({ profile, progress, adaptiveEngine, onOpenAccessibility, onSendMessage, studentId, familyId }) {
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
  const needs = profile.needsAssessment || {};

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

  const getNeedLabel = (field, value) => {
    const labels = {
      readingDifficulty: {
        none: 'Sin dificultades',
        mild: 'Leve',
        moderate: 'Moderada',
        severe: 'Significativa',
      },
      mathDifficulty: {
        none: 'Sin dificultades',
        mild: 'Leve',
        moderate: 'Moderada',
        severe: 'Significativa',
      },
      attentionType: {
        typical: 'Típica',
        adhd_inattentive: 'TDAH - Desatención',
        adhd_hyperactive: 'TDAH - Hiperactividad',
        adhd_combined: 'TDAH - Combinado',
      },
      autismTraits: {
        none: 'Sin rasgos significativos',
        mild: 'Rasgos leves',
        moderate: 'Rasgos moderados',
      },
      processingSpeed: {
        slow: 'Lento',
        average: 'Promedio',
        fast: 'Rápido',
      },
      emotionalRegulation: {
        typical: 'Típica',
        needs_support: 'Necesita apoyo',
        intense: 'Intensa',
      },
    };
    return labels[field]?.[value] || value;
  };

  const recentSessions = (progress.sessionHistory || []).slice(-7).reverse();
  const recentEmotions = (profile.emotionalHistory || []).slice(-5).reverse();

  // ---- Fase 2/4: nube (boleta, actividad de hoy en vivo, insights de IA) ----
  const useCloud = isCloudConfigured && studentId && !String(studentId).startsWith('local-');
  const [cloudGrades, setCloudGrades] = useState(null);   // null → usar cálculo local
  const [todayLive, setTodayLive] = useState(null);       // { minutes, count } de hoy en la nube
  const [insight, setInsight] = useState(null);           // último ai_insights
  const [resumen, setResumen] = useState(null);           // resumen semanal de la IA
  const [cargandoResumen, setCargandoResumen] = useState(false);

  // Actividad de hoy (local): fallback cuando no hay nube
  const todayStr = new Date().toDateString();
  const todayLocal = (progress.sessionHistory || [])
    .filter((s) => new Date(s.date).toDateString() === todayStr)
    .reduce((acc, s) => ({ minutes: acc.minutes + (s.timeMinutes || 0), count: acc.count + 1 }), { minutes: 0, count: 0 });
  const todayActivity = todayLive || todayLocal;

  // Boleta del período: nube si está disponible; si no, cálculo local
  const period = currentPeriod();
  const grades = cloudGrades || computeGrades(progress.sessionHistory, period);
  const subjectName = (id) =>
    SUBJECTS.find((s) => s.id === id)?.name ||
    getGrade(profile.countryCode, profile.gradeId)?.subjects?.find((s) => s.id === id)?.name ||
    id;

  // Alerta: materias con 3+ días sin estudiar
  const subjectAlerts = SUBJECTS.map((s) => {
    const last = (progress.sessionHistory || []).filter((x) => x.subjectId === s.id).slice(-1)[0];
    const days = last ? Math.floor((Date.now() - last.date) / 86400000) : null;
    return { subject: s, days, alert: days === null ? (progress.sessionHistory || []).length > 0 : days >= 3 };
  }).filter((a) => a.alert);

  useEffect(() => {
    if (!useCloud) return;
    let cancelled = false;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Carga inicial: sesiones de hoy, notas del período y último insight
    supabase
      .from('sessions')
      .select('time_minutes, started_at')
      .eq('student_id', studentId)
      .gte('started_at', startOfDay.toISOString())
      .then(({ data }) => {
        if (cancelled || !data) return;
        setTodayLive({
          minutes: data.reduce((a, s) => a + (Number(s.time_minutes) || 0), 0),
          count: data.length,
        });
      });
    fetchGrades(studentId, period).then((g) => {
      if (!cancelled && g && g.length > 0) setCloudGrades(g);
    });
    supabase
      .from('ai_insights')
      .select('strengths, weaknesses, focus_suggestion, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data?.[0]) setInsight(data[0]);
      });

    // Realtime: sesiones nuevas del estudiante actualizan "hoy" sin recargar
    const channel = supabase
      .channel(`sessions:${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sessions', filter: `student_id=eq.${studentId}` },
        (payload) => {
          const s = payload.new;
          if (new Date(s.started_at) >= startOfDay) {
            setTodayLive((prev) => ({
              minutes: (prev?.minutes || 0) + (Number(s.time_minutes) || 0),
              count: (prev?.count || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [studentId, useCloud, period]);

  // Resumen de la semana con IA (lenguaje humano)
  const generarResumen = async () => {
    setCargandoResumen(true);
    const texto = await dailyRecommendation({
      country: getCountry(profile.countryCode)?.name,
      grade: getGrade(profile.countryCode, profile.gradeId)?.label,
      age: profile.age,
      weakSubjects,
    });
    setCargandoResumen(false);
    setResumen(texto || 'No se pudo generar el resumen ahora. Intenta más tarde.');
  };

  // ---- Mensajes al niño (ánimo / pista / nota) ----
  const [msgTipo, setMsgTipo] = useState('animo');
  const [msgTexto, setMsgTexto] = useState('');
  const [msgEstado, setMsgEstado] = useState(null); // null | 'enviando' | 'ok' | 'error'
  const [generandoPista, setGenerandoPista] = useState(false);

  const enviarMensaje = async () => {
    if (!msgTexto.trim() || !onSendMessage) return;
    setMsgEstado('enviando');
    const ok = await onSendMessage(msgTipo, msgTexto);
    setMsgEstado(ok ? 'ok' : 'error');
    if (ok) setMsgTexto('');
    setTimeout(() => setMsgEstado(null), 3000);
  };

  // Redacta una pista con IA a partir de la última sesión con errores
  const generarPistaIA = async () => {
    const fallida = (progress.sessionHistory || []).slice().reverse().find((s) => s.score < 100);
    const subject = SUBJECTS.find((s) => s.id === fallida?.subjectId);
    setGenerandoPista(true);
    const pista = await generateHint({
      country: getCountry(profile.countryCode)?.name,
      grade: getGrade(profile.countryCode, profile.gradeId)?.label,
      age: profile.age,
      subject: subject?.name || fallida?.subjectId || 'general',
      topic: fallida?.levelId || 'repaso',
      question: msgTexto.trim() || 'Ejercicio de la última lección',
      wrongAnswer: '(respuesta incorrecta del niño)',
      correctAnswer: '',
    });
    setGenerandoPista(false);
    if (pista) setMsgTexto(pista);
  };

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

      {/* Compartir: link/QR para que el niño entre con su PIN desde su teléfono */}
      {familyId && isCloudConfigured && (
        <ShareFamilyCard familyId={familyId} />
      )}

      {/* Actividad de hoy (en vivo si hay nube) + resumen semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-sky-500" />
            <h3 className="text-lg font-black text-forest-900">Actividad de hoy</h3>
            {useCloud && (
              <span className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 border border-emerald-200">
                <Radio size={10} />
                En vivo
              </span>
            )}
          </div>
          {isTutorConfigured && (
            <button
              onClick={generarResumen}
              disabled={cargandoResumen}
              className="flex items-center gap-1.5 text-xs font-bold text-berry-500 hover:text-berry-700 disabled:opacity-50 transition-colors"
            >
              <FileText size={14} />
              {cargandoResumen ? 'Generando…' : 'Resumen de la semana'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-xl font-black text-forest-900">{todayActivity.minutes} min</div>
            <div className="text-xs font-bold text-forest-400">Tiempo de estudio hoy</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-xl font-black text-forest-900">{todayActivity.count}</div>
            <div className="text-xs font-bold text-forest-400">Lecciones completadas hoy</div>
          </div>
        </div>
        {resumen && (
          <div className="mt-4 bg-berry-50 rounded-2xl p-4 border border-berry-200">
            <p className="text-xs font-bold text-berry-500 uppercase tracking-wider mb-1">Resumen de la semana</p>
            <p className="text-sm text-forest-700 font-medium">{resumen}</p>
          </div>
        )}
      </motion.div>

      {/* Alertas: materias con 3+ días sin estudiar */}
      {subjectAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 border-l-4 border-rose-400"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-rose-500" />
            <h3 className="font-black text-forest-900">Materias que necesitan atención</h3>
          </div>
          <div className="space-y-2">
            {subjectAlerts.map((a) => (
              <p key={a.subject.id} className="text-sm font-semibold text-forest-700">
                {a.subject.icon} {a.subject.name}:{' '}
                <span className="text-rose-500 font-bold">
                  {a.days === null ? 'aún no la ha practicado' : `${a.days} días sin estudiarla`}
                </span>
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Boleta de calificaciones del período */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-forest-500" />
          <h3 className="text-lg font-black text-forest-900">Boleta de calificaciones</h3>
          <span className="text-xs font-bold text-forest-400">Período {period}</span>
        </div>
        {grades.length === 0 ? (
          <p className="text-sm text-forest-400 font-medium">
            Aún no hay notas este período. Aparecen cuando {profile.name || 'tu pequeño/a'} complete lecciones.
          </p>
        ) : (
          <div className="space-y-2">
            {grades.map((g) => (
              <div key={g.subject} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-forest-800">{subjectName(g.subject)}</span>
                <span
                  className={`text-sm font-black px-3 py-1 rounded-lg ${
                    g.score >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : g.score >= 60
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {Math.round(g.score)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Fortalezas y debilidades detectadas por la IA */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-lavender-400"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-lavender-500" />
            <h3 className="text-lg font-black text-forest-900">Análisis de la tutora IA</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {insight.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Fortalezas</p>
                <div className="flex flex-wrap gap-2">
                  {insight.strengths.map((s, i) => (
                    <span key={i} className="text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 border border-emerald-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {insight.weaknesses?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Por reforzar</p>
                <div className="flex flex-wrap gap-2">
                  {insight.weaknesses.map((s, i) => (
                    <span key={i} className="text-xs font-bold bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 border border-amber-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {insight.focus_suggestion && (
            <p className="mt-4 text-sm font-semibold text-forest-700 bg-lavender-50 rounded-2xl p-4 border border-lavender-200">
              Foco sugerido: {insight.focus_suggestion}
            </p>
          )}
        </motion.div>
      )}

      {/* Perfil cognitivo y necesidades */}
      {needs.completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-sky-400"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-sky-500" />
              <h3 className="text-lg font-black text-forest-900">Perfil de aprendizaje</h3>
            </div>
            <button
              onClick={onOpenAccessibility}
              className="flex items-center gap-1 text-sm font-bold text-sky-500 hover:text-sky-700"
            >
              <Accessibility size={14} />
              Ajustar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/60 rounded-2xl p-4">
              <p className="text-xs font-bold text-forest-400 uppercase tracking-wider mb-1">Estilo principal</p>
              <p className="text-lg font-black text-forest-800 capitalize">{profile.learningStyle || 'Por definir'}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4">
              <p className="text-xs font-bold text-forest-400 uppercase tracking-wider mb-1">Modelo pedagógico</p>
              <p className="text-lg font-black text-forest-800">
                {profile.pedagogicalModel === 'adaptive' ? 'Adaptativo IA' :
                 profile.pedagogicalModel === 'montessori' ? 'Montessori' :
                 profile.pedagogicalModel === 'gamified' ? 'Gamificación' :
                 profile.pedagogicalModel === 'multisensory' ? 'Multi-sensorial' :
                 profile.pedagogicalModel === 'udl' ? 'Diseño Universal' :
                 profile.pedagogicalModel === 'flipped' ? 'Aula Invertida' : 'Adaptativo'}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { field: 'readingDifficulty', label: 'Lectura', icon: '📖' },
              { field: 'mathDifficulty', label: 'Matemáticas', icon: '🔢' },
              { field: 'attentionType', label: 'Atención', icon: '🎯' },
              { field: 'autismTraits', label: 'Rasgos TEA', icon: '🧩' },
              { field: 'processingSpeed', label: 'Ritmo', icon: '⏱️' },
              { field: 'emotionalRegulation', label: 'Emociones', icon: '❤️' },
            ].map((item) => {
              const value = needs[item.field];
              const isConcern = value && value !== 'none' && value !== 'typical' && value !== 'average' && value !== 'fast';
              return (
                <div key={item.field} className={`rounded-xl p-3 border ${isConcern ? 'bg-amber-50 border-amber-200' : 'bg-white/60 border-transparent'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <span className="text-xs font-bold text-forest-500">{item.label}</span>
                  </div>
                  <p className={`text-sm font-black ${isConcern ? 'text-amber-700' : 'text-forest-700'}`}>
                    {getNeedLabel(item.field, value) || 'No evaluado'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Sensibilidades sensoriales */}
          {needs.sensorySensitivity?.length > 0 && (
            <div className="mt-4 bg-rose-50 rounded-2xl p-4 border border-rose-200">
              <p className="text-sm font-bold text-rose-700 mb-1">🔔 Sensibilidades sensoriales detectadas:</p>
              <div className="flex flex-wrap gap-2">
                {needs.sensorySensitivity.map((s) => (
                  <span key={s} className="text-xs font-bold bg-rose-100 text-rose-600 rounded-full px-2 py-1">
                    {s === 'sound' ? '🔊 Sonido' : s === 'light' ? '💡 Luz' : s === 'touch' ? '👋 Tacto' : s === 'movement' ? '🌀 Movimiento' : s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Adaptaciones activas */}
      {profile.accessibility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-emerald-500" />
              <h3 className="text-lg font-black text-forest-900">Adaptaciones activas</h3>
            </div>
            <button
              onClick={onOpenAccessibility}
              className="text-sm font-bold text-emerald-500 hover:text-emerald-700"
            >
              Editar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.accessibility).map(([key, value]) => {
              if (!value || value === false || value === 'medium' || value === 'badges') return null;
              const labels = {
                largeText: '🔍 Texto grande',
                dyslexicFont: '🔤 Fuente dislexia',
                highContrast: '👁️ Alto contraste',
                reduceMotion: '✋ Sin animación',
                reduceSound: '🔇 Sin sonido',
                showPictograms: '🖼️ Pictogramas',
                sessionDuration: `⏱️ ${value} min/sesión`,
                breakFrequency: value === 'often' ? '☕ Descansos frecuentes' : value === 'rarely' ? '⏳ Sesiones largas' : null,
                pacing: value === 'self' ? '🐢 A mi ritmo' : value === 'structured' ? '📋 Estructurado' : value === 'guided' ? '🧭 Con guía' : null,
                positiveReinforcement: value === 'animations' ? '✨ Animaciones' : value === 'voice' ? '🗣️ Voz' : value === 'simple' ? '💬 Simple' : null,
              };
              if (!labels[key]) return null;
              return (
                <span key={key} className="text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full px-3 py-1.5 border border-emerald-200">
                  {labels[key]}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Estado emocional reciente */}
      {recentEmotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-rose-500" />
            <h3 className="text-lg font-black text-forest-900">Estado emocional reciente</h3>
          </div>
          <div className="space-y-2">
            {recentEmotions.map((emo, i) => {
              const date = new Date(emo.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
              const moodEmojis = { happy: '😊', calm: '😌', excited: '🤩', tired: '😴', worried: '😰', sad: '😢', angry: '😠', frustrated: '😤' };
              return (
                <div key={i} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{moodEmojis[emo.mood] || '😐'}</span>
                    <div>
                      <p className="text-sm font-bold text-forest-800 capitalize">{emo.mood}</p>
                      <p className="text-xs text-forest-400">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-forest-500">
                      Energía: {'⭐'.repeat(emo.energy || 3)}
                    </div>
                    {emo.frustration > 2 && (
                      <span className="text-xs font-bold bg-rose-50 text-rose-500 rounded-full px-2 py-1">
                        Frustración: {emo.frustration}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

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

      {/* Enviar mensaje al niño */}
      {onSendMessage && (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircleHeart size={20} className="text-berry-500" />
            <h3 className="text-lg font-black text-forest-900">Enviar mensaje a {profile.name || 'tu pequeño/a'}</h3>
          </div>
          <div className="flex gap-2 mb-3">
            {[
              { id: 'animo', label: 'Ánimo' },
              { id: 'pista', label: 'Pista' },
              { id: 'nota', label: 'Nota' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setMsgTipo(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  msgTipo === t.id
                    ? 'bg-berry-500 text-white shadow-lg'
                    : 'bg-white text-forest-600 border border-forest-200 hover:border-forest-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={msgTexto}
            onChange={(e) => setMsgTexto(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder={
              msgTipo === 'animo'
                ? 'Ej: ¡Vas muy bien! Estoy orgulloso de ti.'
                : msgTipo === 'pista'
                  ? 'Ej: Recuerda: primero suma las unidades, luego las decenas.'
                  : 'Ej: Hoy repasamos juntos la tabla del 7 después de cenar.'
            }
            className="w-full bg-white border-2 border-forest-200 rounded-2xl px-4 py-3 text-sm font-medium text-forest-900 focus:outline-none focus:border-berry-400 transition-all placeholder:text-forest-300"
          />
          <div className="flex items-center justify-between mt-3">
            {isTutorConfigured && msgTipo === 'pista' ? (
              <button
                onClick={generarPistaIA}
                disabled={generandoPista}
                className="flex items-center gap-1.5 text-xs font-bold text-sun-600 hover:text-sun-700 disabled:opacity-50 transition-colors"
              >
                <Sparkles size={14} />
                {generandoPista ? 'Generando…' : 'Redactar pista con IA'}
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={enviarMensaje}
              disabled={!msgTexto.trim() || msgEstado === 'enviando'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-berry-500 text-white hover:bg-berry-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-berry-500/20"
            >
              <Send size={14} />
              {msgEstado === 'enviando' ? 'Enviando…' : msgEstado === 'ok' ? '¡Enviado!' : 'Enviar'}
            </button>
          </div>
          {msgEstado === 'error' && (
            <p className="mt-2 text-xs font-bold text-rose-500">No se pudo enviar. Revisa tu conexión.</p>
          )}
        </div>
      )}

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

// Tarjeta "Compartir": link + QR para que el niño entre con su PIN
// desde su propio teléfono (o el mismo), sin la cuenta del padre.
function ShareFamilyCard({ familyId }) {
  const [copied, setCopied] = useState(false);
  const link = buildShareLink(familyId);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(link)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia este enlace:', link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-emerald-400"
    >
      <div className="flex items-center gap-2 mb-2">
        <QrCode size={20} className="text-emerald-500" />
        <h3 className="text-lg font-black text-forest-900">Compartir con tu hijo/a</h3>
      </div>
      <p className="text-sm text-forest-500 mb-4">
        Escanea el código QR o envía el enlace al teléfono de tu hijo/a. Entrará con su perfil y su PIN,
        y todo lo que estudie se verá aquí en tiempo real.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <img
          src={qrUrl}
          alt="Código QR para entrar como estudiante"
          className="w-40 h-40 rounded-2xl border-2 border-forest-100 bg-white"
          loading="lazy"
        />
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 bg-white border-2 border-forest-200 rounded-2xl px-4 py-3">
            <span className="flex-1 text-sm font-semibold text-forest-700 truncate">{link}</span>
            <button
              onClick={copy}
              className="shrink-0 flex items-center gap-1 text-sm font-bold text-forest-500 hover:text-forest-700 transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-forest-400 mt-2">
            En este mismo teléfono también puedes cerrar tu sesión y dejar que el niño entre con su PIN.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
