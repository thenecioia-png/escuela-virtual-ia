import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Cake, Heart, Globe, GraduationCap, KeyRound } from 'lucide-react';
import { COUNTRIES_CURRICULA } from '../../lib/curricula';
import { supabase, isCloudConfigured } from '../../lib/supabase';

const INTERESTS = [
  { id: 'animals', label: 'Animales', emoji: '🐾' },
  { id: 'space', label: 'El Espacio', emoji: '🚀' },
  { id: 'art', label: 'Dibujar', emoji: '🎨' },
  { id: 'music', label: 'Música', emoji: '🎵' },
  { id: 'sports', label: 'Deportes', emoji: '⚽' },
  { id: 'nature', label: 'Naturaleza', emoji: '🌿' },
  { id: 'games', label: 'Juegos', emoji: '🎮' },
  { id: 'stories', label: 'Cuentos', emoji: '📖' },
];

export default function ProfileCreator({ profile, updateProfile, avatars, onNext, onBack }) {
  const [step, setStep] = useState(0);
  const [countryCode, setCountryCode] = useState(profile.countryCode || null);
  const [gradeId, setGradeId] = useState(profile.gradeId || null);
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || avatars[0]);
  const [selectedInterests, setSelectedInterests] = useState(profile.interests || []);
  const [pin, setPin] = useState(profile.pin || '');
  const [countries, setCountries] = useState(COUNTRIES_CURRICULA);

  // Currículos: intenta la BD; si falla (o no hay nube), queda el fallback local
  useEffect(() => {
    if (!isCloudConfigured) return;
    supabase
      .from('countries_curricula')
      .select('country_code, country_name, grades')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCountries(
            data.map((row) => {
              const local = COUNTRIES_CURRICULA.find((c) => c.code === row.country_code);
              return { code: row.country_code, name: row.country_name, flag: local?.flag || '🏳️', grades: row.grades };
            })
          );
        }
      });
  }, []);

  const selectedCountry = countries.find((c) => c.code === countryCode) || null;
  const grades = selectedCountry?.grades || [];

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const saveAndNext = () => {
    updateProfile({
      countryCode,
      gradeId,
      name,
      age: parseInt(age) || null,
      avatar: selectedAvatar,
      interests: selectedInterests,
      pin: pin || null,
    });
    onNext();
  };

  const canProceed = () => {
    if (step === 0) return Boolean(countryCode);
    if (step === 1) return Boolean(gradeId);
    if (step === 2) return name.trim().length >= 2;
    if (step === 3) return age && age >= 4 && age <= 14;
    if (step === 4) return true;
    if (step === 5) return selectedInterests.length >= 1;
    if (step === 6) return /^[0-9]{4}$/.test(pin);
    return false;
  };

  const steps = [
    {
      title: '¿En qué país estudias?',
      icon: <Globe size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">Cada país tiene su propio plan de estudios. Elegiremos las lecciones correctas para ti.</p>
          <div className="space-y-2 max-w-sm mx-auto">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCountryCode(c.code); setGradeId(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold transition-all ${
                  countryCode === c.code
                    ? 'bg-forest-500 text-white border-forest-500 shadow-lg'
                    : 'bg-white text-forest-700 border-forest-200 hover:border-forest-300'
                }`}
              >
                <span className="text-2xl">{c.flag}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '¿En qué grado vas?',
      icon: <GraduationCap size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">
            Grados de {selectedCountry?.name || 'tu país'}. Así te enseñaré justo lo que ves en la escuela.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            {grades.map((g) => (
              <button
                key={g.id}
                onClick={() => setGradeId(g.id)}
                className={`px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                  gradeId === g.id
                    ? 'bg-forest-500 text-white border-forest-500 shadow-lg'
                    : 'bg-white text-forest-700 border-forest-200 hover:border-forest-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '¿Cómo te llamas?',
      icon: <User size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">Quiero saber tu nombre para saludarte como te gusta.</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Escribe tu nombre..."
            className="w-full text-center text-2xl font-bold text-forest-900 bg-white border-2 border-forest-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 transition-all placeholder:text-forest-300"
            maxLength={20}
          />
          {name.trim().length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-forest-500 font-semibold">
              ¡Mucho gusto, {name}! 🌟
            </motion.p>
          )}
        </div>
      ),
    },
    {
      title: '¿Cuántos años tienes?',
      icon: <Cake size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">Así te enseñaré cosas perfectas para tu edad.</p>
          <div className="flex justify-center">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="0"
              min={4}
              max={14}
              className="w-32 text-center text-4xl font-black text-forest-900 bg-white border-2 border-forest-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 transition-all placeholder:text-forest-300"
            />
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {[5, 6, 7, 8, 9, 10, 11].map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  parseInt(age) === a
                    ? 'bg-forest-500 text-white shadow-lg'
                    : 'bg-white text-forest-600 hover:bg-forest-50 border border-forest-200'
                }`}
              >
                {a} años
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Elige tu compañero',
      icon: <Heart size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">Este animalito te acompañará en tu aventura de aprender.</p>
          <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
            {avatars.map((avatar) => (
              <motion.button
                key={avatar}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedAvatar(avatar)}
                className={`text-3xl p-3 rounded-2xl transition-all ${
                  selectedAvatar === avatar
                    ? 'bg-forest-500 text-white shadow-lg ring-4 ring-forest-200'
                    : 'bg-white hover:bg-forest-50 border border-forest-200'
                }`}
              >
                {avatar}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-2xl animate-pulse-soft">{selectedAvatar}</p>
        </div>
      ),
    },
    {
      title: '¿Qué te gusta?',
      icon: <Heart size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">Elegiré lecciones con temas que te encanten.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
            {INTERESTS.map((interest) => {
              const selected = selectedInterests.includes(interest.id);
              return (
                <motion.button
                  key={interest.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${
                    selected
                      ? 'bg-forest-500 text-white border-forest-500 shadow-lg'
                      : 'bg-white text-forest-700 border-forest-200 hover:border-forest-300'
                  }`}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className="text-xs font-bold">{interest.label}</span>
                </motion.button>
              );
            })}
          </div>
          {selectedInterests.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-forest-500 font-semibold text-sm">
              {selectedInterests.length} intereses seleccionados
            </motion.p>
          )}
        </div>
      ),
    },
    {
      title: 'Crea tu PIN secreto',
      icon: <KeyRound size={20} />,
      content: (
        <div className="space-y-4">
          <p className="text-forest-600 text-center">
            4 números que solo tú sabes. Los usarás para entrar a tu perfil sin tocar el de tus hermanos.
          </p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="····"
            className="w-48 mx-auto block text-center text-3xl font-black tracking-[0.5em] text-forest-900 bg-white border-2 border-forest-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 transition-all placeholder:text-forest-200"
          />
          <p className="text-center text-xs text-forest-400">Papá o mamá también deben saberlo, por si lo olvidas.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-forest-500' : 'bg-forest-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-forest-100 rounded-xl text-forest-600">{steps[step].icon}</div>
              <h2 className="text-xl font-black text-forest-900">{steps[step].title}</h2>
            </div>
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={step === 0 ? onBack : () => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-forest-600 hover:bg-white/80 transition-colors"
          >
            <ArrowLeft size={18} />
            {step === 0 ? 'Volver' : 'Anterior'}
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-forest-500/20"
            >
              Siguiente
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={saveAndNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-forest-500/20"
            >
              Continuar
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
