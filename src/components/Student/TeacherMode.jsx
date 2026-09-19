// Modo Profesor: una clase guiada paso a paso por la maestra IA sobre LA
// habilidad que más necesita la niña (tomada de los mapas de habilidades).
// Flujo: Aprende → Míralo resuelto → Practica conmigo → Cierre.
// Todo funciona sin red: cada paso tiene un fallback local escrito a mano.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Volume2, VolumeX, ArrowRight, Compass, Sparkles, Lightbulb, CheckCircle2, PartyPopper } from 'lucide-react';
import { getHint, lessonStep, isTutorConfigured } from '../../lib/tutorApi';
import { recordAttempt, loadSkillMap, accuracy } from '../../lib/skillMap';
import { getNextTeacherSkill, getNextSkillInPath, getFullSkillSummaryForTutor, getAnySkill, getAreaBySkill } from '../../lib/lifeSkillMap';
import { getCountry, getGrade } from '../../lib/curricula';

const PRACTICE_COUNT = 4;

// ---- Fallbacks locales (sin IA): explicación "Aprende" por habilidad ----
const APRENDE_LOCAL = {
  conteo: 'Contar es decir los números en orden, como cuando cuentas los plátanos del conuco: 1, 2, 3... Si sabes qué número va después de cada uno, ¡ya eres una experta contando hasta 20!',
  suma_basica: 'Sumar es juntar cosas. Si tienes 5 chin chin y tu amiga te regala 3 más, juntas todo y cuentas: ¡tienes 8! Puedes contar desde el número más grande para hacerlo más rápido.',
  resta_sin_llevar: 'Restar es quitar. Si tenías 25 pesos y gastaste 12 en un limber, te quedan 13. Resta primero las unidades (5 - 2 = 3) y luego las decenas (2 - 1 = 1).',
  resta_llevando: 'A veces, al restar, el número de arriba es más chiquito que el de abajo, como 52 - 27. Entonces le "pedimos prestada" una decena al vecino: el 5 le da 1 al 2, el 2 se convierte en 12 y ya sí podemos restar. ¡Es como pedirle un peso prestado a tu hermano!',
  tablas_2_5_10: 'Multiplicar es sumar lo mismo varias veces. La tabla del 2 va de 2 en 2 (2, 4, 6, 8...), la del 5 de 5 en 5 (5, 10, 15...) y la del 10 es facilita: le pones un cero al número (3 × 10 = 30).',
  tablas_3_4_6: 'La tabla del 3 va de 3 en 3: 3, 6, 9, 12... La del 4 es el doble de la del 2. Y la del 6 es el doble de la del 3. ¡Si sabes una, ya casi sabes las otras!',
  tablas_7_8_9: 'Estas tablas parecen difíciles, pero tienen trucos. Para el 9 usa los dedos: baja el dedo del número y cuenta. Y recuerda: 7 × 8 = 56 y 8 × 9 = 72 son las que más se practican.',
  multi_2_digitos: 'Para multiplicar un número grande como 14 × 3, lo partimos: 10 × 3 = 30 y 4 × 3 = 12, y luego juntamos: 30 + 12 = 42. ¡Partir el problema lo hace facilito!',
  division_basica: 'Dividir es repartir en partes iguales. Si tienes 12 mangos para 3 primos, ¿cuántos le tocan a cada uno? Piensa: ¿qué número por 3 da 12? ¡El 4! La división es la multiplicación al revés.',
  dinero_reconocer: 'En la República Dominicana usamos pesos: monedas de 1, 5, 10 y 25, y billetes de 50, 100, 200, 500, 1000 y 2000. Entre más grande el número, más vale. ¡Mira los billetes de mamá y practica!',
  dinero_sumar: 'Cuando compras varias cosas en el colmado, sumas los precios para saber cuánto pagas. Un jugo de RD$35 y una empanada de RD$25 son RD$60 en total. ¡Así no te pasas del dinero que traes!',
  dinero_cambio: 'La devuelta es lo que te sobra cuando pagas con un billete grande. Si algo cuesta RD$75 y pagas con RD$100, la devuelta es lo que falta para llegar a 100: ¡RD$25! Cuenta desde el precio hasta el billete.',
  dinero_comparar: 'Comparar precios es ver cuál es más barato. Si el mismo jugo cuesta RD$30 en un colmado y RD$40 en otro, escoges el de RD$30. ¡Así cuidas tu dinero como los grandes!',
  dinero_presupuesto: 'Un presupuesto es planear tu dinero: saber cuánto tienes y cuánto cuestan las cosas ANTES de comprar. Suma todo lo que quieres y compara con lo que traes. Si el total es menor, ¡te alcanza!',
  tiempo_en_punto: 'El reloj tiene dos agujas: la corta marca la hora y la larga los minutos. Cuando la larga está en el 12, es la hora en punto: si la corta está en el 3, ¡son las 3 en punto!',
  tiempo_media_cuartos: 'Cuando la aguja larga está en el 6, ya pasó media hora: "las 4 y media". En el 3 son 15 minutos: "las 4 y cuarto". Y cuando falta poquito para la próxima hora decimos "cuarto para las 5".',
  tiempo_falta_paso: 'Una hora tiene 60 minutos. Si son las 7:00 y tu programa empieza a las 7:30, faltan 30 minutos. Y si jugaste de las 3:00 a las 4:00, ¡jugaste una hora completa!',
  tiempo_dias_meses: 'La semana tiene 7 días: lunes, martes, miércoles, jueves, viernes, sábado y domingo. El año tiene 12 meses, de enero a diciembre. ¡Saberlos te ayuda a no perderte ningún cumpleaños!',
  medidas_unidades: 'Cada cosa se mide con su medida: los líquidos como el agua del moro en litros, las distancias en metros, y el peso del arroz y las habichuelas en libras o kilos. ¡Cada medida tiene su trabajo!',
  medidas_comparar: 'Para comparar, recuerda: 1 metro son 100 centímetros, y medio litro es la mitad de un litro. Cuando partes algo por la mitad, cada pedazo es igual.',
  medidas_problemas: 'Los problemas de medidas son cosas de la vida real: cuánta agua falta para la receta del moro, cuántos metros caminas al colmado ida y vuelta. Lee despacio, busca los números y decide si sumas, restas o multiplicas.',
  lectura_literal: 'Leer con atención es encontrar en el texto lo que dice con todas sus letras. Si el cuento dice "la gallina blanca", la respuesta a "¿de qué color es la gallina?" está ahí mismo. ¡Lee despacito!',
  lectura_inferencia: 'A veces el texto no dice la respuesta con todas sus letras: hay que adivinarla como una detective. Si dice que el huevo está calientito y la gallina lo acaba de poner... ¡ya sabes por qué está caliente!',
  lectura_idea: 'La idea principal es de QUÉ trata todo el cuento, en una sola frase. Pregúntate: "si le contara este cuento a mi amiga en una oración, ¿qué le diría?". ¡Esa es la idea principal!',
  ciencias_cuerpo: 'Tu cuerpo es una máquina increíble: los pulmones respiran, el corazón empuja la sangre como una bomba, y el cerebro es el jefe que piensa y recuerda. ¡Conócelo para cuidarlo!',
  ciencias_animales: 'Los animales son de muchos tipos: los mamíferos como la vaca y el perro tienen crías que maman leche, y las aves como la gallina ponen huevos. Cada uno vive y come de su manera.',
  ciencias_plantas: 'Las plantas necesitan agua, luz del sol y tierra para crecer. Toman el agua por las raíces y con las hojas agarran la luz para hacer su comida. ¡Por eso tu abuela riega sus matas!',
  ciencias_agua: 'El agua puede ser líquida, hielo o vapor. La lluvia viene de las nubes, y en nuestro país hay que cuidarse de los huracanes entre junio y noviembre. ¡Cuidar el agua es cuidar la vida!',
};

const REFUERZOS = ['¡Así se hace! 🌟', '¡Muy bien, mi reina! 💪', '¡Lo lograste! 🎉', '¡Eres una campeona! ⭐', '¡Eso es! ¡Qué inteligente! 🧠'];

function hablar(texto, activo) {
  if (!activo || typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-DO';
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export default function TeacherMode({ profile, studentId, onHome, onStartDiagnostic }) {
  const [targetId, setTargetId] = useState(() => getNextTeacherSkill(studentId)?.skill.id || null);
  const target = useMemo(() => {
    if (!targetId) return null;
    const skill = getAnySkill(targetId);
    const area = skill ? getAreaBySkill(targetId) : null;
    return skill && area ? { area, skill } : null;
  }, [targetId]);

  const [step, setStep] = useState('aprende'); // aprende | ejemplo | practica | cierre
  const [voz, setVoz] = useState(false);
  const [aprende, setAprende] = useState(null); // { titulo, texto }
  const [ejemploItem, setEjemploItem] = useState(null);
  const [pasos, setPasos] = useState(null); // string[]
  const [items, setItems] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [hint, setHint] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'ok' | 'fail'
  const [aciertos, setAciertos] = useState(0);
  const [cierre, setCierre] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  const skillSummary = useMemo(() => getFullSkillSummaryForTutor(studentId), [studentId]);
  const ctx = useMemo(() => ({
    country: getCountry(profile.countryCode)?.name || 'República Dominicana',
    grade: getGrade(profile.countryCode, profile.gradeId)?.label,
    age: profile.age || 10,
  }), [profile]);

  // Cargar paso "Aprende" (IA o fallback local)
  useEffect(() => {
    if (!target) return;
    let cancelado = false;
    const local = { titulo: `Hoy aprendemos: ${target.skill.name}`, texto: APRENDE_LOCAL[target.skill.id] || `Hoy vamos a aprender ${target.skill.name.toLowerCase()}. ¡Paso a paso, tú puedes!` };
    setAprende(local);
    setEjemploItem(target.skill.gen());
    lessonStep({
      ...ctx,
      step: 'aprende',
      skillName: target.skill.name,
      areaName: target.area.name,
      skillSummary,
    }).then((data) => {
      if (!cancelado && data?.texto) setAprende({ titulo: data.titulo || local.titulo, texto: data.texto });
    });
    return () => { cancelado = true; window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  // Cargar pasos del ejemplo resuelto cuando se entra a ese paso
  useEffect(() => {
    if (step !== 'ejemplo' || !target || !ejemploItem) return;
    // Fallback local: partir la explicación en pasos
    const local = (ejemploItem.explanation ? [ejemploItem.explanation] : []).concat([`La respuesta correcta es: ${ejemploItem.answer}.`]);
    setPasos(local);
    let cancelado = false;
    lessonStep({
      ...ctx,
      step: 'ejemplo',
      skillName: target.skill.name,
      areaName: target.area.name,
      skillSummary,
      question: ejemploItem.q,
      answer: ejemploItem.answer,
      explanation: ejemploItem.explanation || '',
    }).then((data) => {
      if (!cancelado && Array.isArray(data?.pasos) && data.pasos.length > 0) setPasos(data.pasos.map(String));
    });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, targetId]);

  const empezarPractica = () => {
    setItems(Array.from({ length: PRACTICE_COUNT }, () => target.skill.gen()));
    setQIndex(0);
    setSelected(null);
    setWrongOnce(false);
    setHint(null);
    setFeedback(null);
    setAciertos(0);
    setStartTime(Date.now());
    setStep('practica');
  };

  // Cargar cierre (IA o fallback local)
  useEffect(() => {
    if (step !== 'cierre' || !target) return;
    const local = aciertos === items.length
      ? `¡INCREÍBLE! Acertaste las ${items.length} preguntas de "${target.skill.name}". Estoy tan orgullosa de ti como tu abuela cuando sale el mangú perfecto. ¡La próxima clase seguimos subiendo!`
      : `Muy buen trabajo hoy con "${target.skill.name}": acertaste ${aciertos} de ${items.length}. Lo importante es que no te rendiste. Cada error nos enseña algo. ¡La próxima clase lo hacemos aún mejor!`;
    setCierre(local);
    let cancelado = false;
    lessonStep({
      ...ctx,
      step: 'cierre',
      skillName: target.skill.name,
      areaName: target.area.name,
      skillSummary,
      aciertos,
      total: items.length,
    }).then((data) => {
      if (!cancelado && data?.texto) setCierre(data.texto);
    });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const responder = async (opt) => {
    if (selected !== null && feedback === 'ok') return; // ya acertó
    const item = items[qIndex];
    const correct = opt === item.answer;
    recordAttempt(studentId, target.skill.id, {
      correct,
      q: item.q,
      wrong: correct ? null : opt,
      answer: item.answer,
      ms: Date.now() - startTime,
    });
    if (correct) {
      setSelected(opt);
      setFeedback('ok');
      if (!wrongOnce) setAciertos((a) => a + 1); // solo cuenta si acertó a la primera
      hablar(REFUERZOS[Math.floor(Math.random() * REFUERZOS.length)], voz);
    } else {
      if (!wrongOnce) {
        // Primer fallo: pista de la IA y reintento
        setWrongOnce(true);
        setSelected(opt);
        setFeedback('fail');
        const pista = await getHint({
          ...ctx,
          subject: target.area.name,
          topic: target.skill.name,
          question: item.q,
          wrongAnswer: opt,
          correctAnswer: item.answer,
          skillId: target.skill.id,
          skillSummary,
        });
        setHint(pista || item.explanation || 'Mira bien los números y vuelve a intentarlo. ¡Tú puedes!');
      } else {
        // Segundo fallo: mostrar la respuesta con la explicación y seguir
        setSelected(opt);
        setFeedback('ok'); // desbloquea para avanzar mostrando la respuesta
        setHint(item.explanation || `La respuesta correcta es: ${item.answer}.`);
      }
    }
  };

  const siguientePregunta = () => {
    if (qIndex + 1 < items.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setWrongOnce(false);
      setHint(null);
      setFeedback(null);
      setStartTime(Date.now());
    } else {
      setStep('cierre');
    }
  };

  const siguienteClase = () => {
    const next = getNextSkillInPath(studentId, target.skill.id) || getNextTeacherSkill(studentId);
    if (next && next.skill.id !== target.skill.id) {
      setTargetId(next.skill.id);
      setStep('aprende');
      setAprende(null);
      setPasos(null);
      setItems([]);
      setCierre(null);
    } else {
      onHome();
    }
  };

  // Sin datos en ningún mapa → invitar al diagnóstico
  if (!target) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">🧭</div>
          <h2 className="text-2xl font-black text-forest-900 mb-2">Primero, conozcámonos</h2>
          <p className="text-forest-600 mb-6">
            Para darte la clase perfecta, tu maestra necesita saber qué ya sabes y qué te cuesta un poquito.
            Haz el diagnóstico: es un juego cortito de preguntas, ¡y equivocarse también ayuda!
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={onStartDiagnostic} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25">
              <Compass size={18} /> Hacer el diagnóstico
            </button>
            <button onClick={onHome} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-50 text-forest-600 hover:bg-forest-100 transition-all">
              <Home size={18} /> Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const acc = accuracy(loadSkillMap(studentId)[target.skill.id]);
  const pasosInfo = ['Aprende', 'Míralo resuelto', 'Practica conmigo', 'Cierre'];
  const stepIndex = ['aprende', 'ejemplo', 'practica', 'cierre'].indexOf(step);
  const textoVoz = step === 'aprende' ? aprende?.texto : step === 'cierre' ? cierre : (pasos || []).join(' ');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Encabezado de la clase */}
      <div className="glass-card rounded-3xl p-5 flex items-center gap-4">
        <div className="text-4xl animate-float">👩‍🏫</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-forest-400">{target.area.emoji} {target.area.name}</p>
          <h2 className="text-xl font-black text-forest-900 truncate">{target.skill.emoji} {target.skill.name}</h2>
          {acc !== null && <p className="text-xs font-semibold text-forest-400">Vas en {acc}% de aciertos en esto</p>}
        </div>
        <button
          onClick={() => { const nv = !voz; setVoz(nv); if (nv) hablar(textoVoz || '', true); else window.speechSynthesis?.cancel(); }}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${voz ? 'bg-berry-500 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100'}`}
        >
          {voz ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {voz ? 'Silencio' : 'Escuchar'}
        </button>
      </div>

      {/* Barra de pasos */}
      <div className="flex gap-2">
        {pasosInfo.map((p, i) => (
          <div key={p} className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-all ${i === stepIndex ? 'bg-berry-500 text-white shadow-md' : i < stepIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-white/50 text-forest-300'}`}>
            {i + 1}. {p}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* PASO 1: APRENDE */}
        {step === 'aprende' && aprende && (
          <motion.div key="aprende" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-lavender-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-lavender-500">Paso 1 · Aprende</span>
            </div>
            <h3 className="text-2xl font-black text-forest-900 mb-4">{aprende.titulo}</h3>
            <p className="text-lg leading-relaxed text-forest-800 font-medium whitespace-pre-line">{aprende.texto}</p>
            <button onClick={() => { window.speechSynthesis?.cancel(); setStep('ejemplo'); }} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25">
              Ya lo entendí, muéstrame un ejemplo <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* PASO 2: EJEMPLO RESUELTO */}
        {step === 'ejemplo' && ejemploItem && (
          <motion.div key="ejemplo" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-sun-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-sun-600">Paso 2 · Míralo resuelto</span>
            </div>
            {ejemploItem.passage && (
              <div className="bg-cream-50 border border-sun-200 rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-forest-400 mb-1">{ejemploItem.passageTitle}</p>
                <p className="text-sm text-forest-700">{ejemploItem.passage}</p>
              </div>
            )}
            <div className="bg-forest-900 rounded-2xl p-5 mb-4 text-center">
              <p className="text-2xl font-black text-cream-50">{ejemploItem.q}</p>
            </div>
            <ol className="space-y-3 mb-4">
              {(pasos || []).map((p, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 }} className="flex gap-3 items-start">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-sun-500 text-forest-900 font-black text-sm flex items-center justify-center">{i + 1}</span>
                  <p className="text-lg text-forest-800 font-medium">{p.replace(/^\d+[.)]\s*/, '')}</p>
                </motion.li>
              ))}
            </ol>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 text-center">
              <p className="text-lg font-black text-emerald-700">Respuesta: {ejemploItem.answer}</p>
            </div>
            <button onClick={empezarPractica} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25">
              ¡Ahora me toca a mí! <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* PASO 3: PRACTICA CONMIGO */}
        {step === 'practica' && items.length > 0 && (
          <motion.div key={`p${qIndex}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-500">Paso 3 · Practica conmigo</span>
              <span className="text-xs font-black text-forest-400">Pregunta {qIndex + 1} de {items.length}</span>
            </div>
            {items[qIndex].passage && (
              <div className="bg-cream-50 border border-sun-200 rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-forest-400 mb-1">{items[qIndex].passageTitle}</p>
                <p className="text-sm text-forest-700">{items[qIndex].passage}</p>
              </div>
            )}
            <p className="text-xl font-black text-forest-900 mb-5">{items[qIndex].q}</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {items[qIndex].options.map((opt) => {
                const esElla = selected === opt;
                const esCorrecta = opt === items[qIndex].answer;
                let cls = 'bg-white/70 border-forest-100 hover:border-berry-300 text-forest-800';
                if (feedback === 'ok' && esCorrecta) cls = 'bg-emerald-100 border-emerald-400 text-emerald-800';
                else if (esElla && !esCorrecta) cls = 'bg-rose-50 border-rose-300 text-rose-600';
                return (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => responder(opt)}
                    disabled={feedback === 'ok'}
                    className={`border-2 rounded-2xl px-4 py-4 text-lg font-bold text-left transition-all disabled:cursor-default ${cls}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
            {feedback === 'fail' && hint && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-sun-50 border border-sun-200 rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-sun-600 uppercase tracking-wider mb-1">💡 Tu maestra dice:</p>
                <p className="text-base font-semibold text-forest-800">{hint}</p>
                <p className="text-sm font-bold text-berry-500 mt-2">Inténtalo de nuevo, ¡tú puedes!</p>
              </motion.div>
            )}
            {feedback === 'ok' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  {selected === items[qIndex].answer ? (
                    <p className="text-lg font-black text-emerald-700 flex items-center gap-2"><CheckCircle2 size={20} /> {REFUERZOS[Math.floor(Math.random() * REFUERZOS.length)]}</p>
                  ) : (
                    <>
                      <p className="text-base font-bold text-forest-800 mb-1">La respuesta correcta es: <span className="text-emerald-700">{items[qIndex].answer}</span></p>
                      <p className="text-sm font-semibold text-forest-600">{items[qIndex].explanation}</p>
                    </>
                  )}
                  {selected === items[qIndex].answer && items[qIndex].explanation && (
                    <p className="text-sm font-semibold text-forest-600 mt-1">{items[qIndex].explanation}</p>
                  )}
                </div>
                <button onClick={siguientePregunta} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25">
                  {qIndex + 1 < items.length ? 'Siguiente pregunta' : 'Terminar la clase'} <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PASO 4: CIERRE */}
        {step === 'cierre' && (
          <motion.div key="cierre" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-3xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PartyPopper size={18} className="text-berry-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-berry-500">Paso 4 · Cierre</span>
            </div>
            <div className="text-5xl mb-4">{aciertos === items.length ? '🏆' : aciertos > 0 ? '🌟' : '💪'}</div>
            <p className="text-lg font-black text-forest-900 mb-3">Acertaste {aciertos} de {items.length}</p>
            <p className="text-lg leading-relaxed text-forest-800 font-medium mb-6">{cierre || '...'}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={siguienteClase} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-berry-500 text-white hover:opacity-90 transition-all shadow-lg shadow-berry-500/25">
                <Sparkles size={18} /> Siguiente clase
              </button>
              <button onClick={onHome} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-forest-50 text-forest-600 hover:bg-forest-100 transition-all">
                <Home size={18} /> Volver al inicio
              </button>
            </div>
            {!isTutorConfigured && (
              <p className="mt-4 text-xs text-forest-300 font-semibold">(Clase sin conexión: tu maestra te habló con sus lecciones guardadas)</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
