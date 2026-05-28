import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, Zap, Wind, Heart, ArrowRight } from 'lucide-react';

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Feliz', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'calm', emoji: '😌', label: 'Tranquilo', color: 'bg-sky-100 text-sky-700 border-sky-300', activeColor: 'bg-sky-500 text-white border-sky-500' },
  { value: 'excited', emoji: '🤩', label: 'Emocionado', color: 'bg-amber-100 text-amber-700 border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500' },
  { value: 'tired', emoji: '😴', label: 'Cansado', color: 'bg-violet-100 text-violet-700 border-violet-300', activeColor: 'bg-violet-500 text-white border-violet-500' },
  { value: 'worried', emoji: '😰', label: 'Preocupado', color: 'bg-orange-100 text-orange-700 border-orange-300', activeColor: 'bg-orange-500 text-white border-orange-500' },
  { value: 'sad', emoji: '😢', label: 'Triste', color: 'bg-rose-100 text-rose-700 border-rose-300', activeColor: 'bg-rose-500 text-white border-rose-500' },
  { value: 'angry', emoji: '😠', label: 'Enojado', color: 'bg-red-100 text-red-700 border-red-300', activeColor: 'bg-red-500 text-white border-red-500' },
  { value: 'frustrated', emoji: '😤', label: 'Frustrado', color: 'bg-pink-100 text-pink-700 border-pink-300', activeColor: 'bg-pink-500 text-white border-pink-500' },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '🐢', label: 'Muy baja', icon: Wind },
  { value: 2, emoji: '🌿', label: 'Baja', icon: Wind },
  { value: 3, emoji: '⚡', label: 'Normal', icon: Zap },
  { value: 4, emoji: '🔥', label: 'Alta', icon: Zap },
  { value: 5, emoji: '🚀', label: 'Muy alta', icon: Zap },
];

export default function EmotionalCheckIn({ onComplete, profile }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [frustration, setFrustration] = useState(1);

  const handleComplete = () => {
    onComplete({
      mood,
      energy,
      frustration,
      date: Date.now(),
    });
  };

  const getFrustrationLabel = (val) => {
    if (val <= 1) return 'Nada';
    if (val <= 2) return 'Un poco';
    if (val <= 3) return 'Algo';
    if (val <= 4) return 'Bastante';
    return 'Mucho';
  };

  const renderMoodStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Heart size={32} className="text-rose-500 mx-auto mb-3" />
      <h2 className="text-2xl font-black text-forest-900 mb-2">
        ¿Cómo te sientes hoy, {profile.name}?
      </h2>
      <p className="text-forest-500 mb-6">No hay respuestas equivocadas. Solo quiero saber.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MOODS.map((m) => (
          <motion.button
            key={m.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setMood(m.value); setStep(1); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              mood === m.value ? m.activeColor : m.color
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-sm font-bold">{m.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderEnergyStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Zap size={32} className="text-amber-500 mx-auto mb-3" />
      <h2 className="text-2xl font-black text-forest-900 mb-2">
        ¿Cuánta energía tienes?
      </h2>
      <p className="text-forest-500 mb-6">Así sabré si hacemos algo tranquilo o movido.</p>
      <div className="flex justify-center gap-2 mb-4">
        {ENERGY_LEVELS.map((level) => {
          const Icon = level.icon;
          return (
            <motion.button
              key={level.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEnergy(level.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all min-w-[72px] ${
                energy === level.value
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                  : 'bg-white text-forest-600 border-forest-200 hover:border-amber-300'
              }`}
            >
              <span className="text-2xl">{level.emoji}</span>
              <span className="text-xs font-bold">{level.label}</span>
            </motion.button>
          );
        })}
      </div>
      <button
        onClick={() => setStep(2)}
        className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all"
      >
        Siguiente <ArrowRight size={18} />
      </button>
    </motion.div>
  );

  const renderFrustrationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Frown size={32} className="text-rose-400 mx-auto mb-3" />
      <h2 className="text-2xl font-black text-forest-900 mb-2">
        ¿Algo te frustró últimamente?
      </h2>
      <p className="text-forest-500 mb-6">Puedo hacer las cosas más fáciles si me cuentas.</p>
      <div className="max-w-xs mx-auto mb-6">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={frustration}
          onChange={(e) => setFrustration(parseInt(e.target.value))}
          className="w-full h-3 bg-forest-200 rounded-full appearance-none cursor-pointer accent-rose-500"
        />
        <div className="flex justify-between text-xs text-forest-400 mt-2 font-bold">
          <span>Nada</span>
          <span className="text-rose-500 text-sm">{getFrustrationLabel(frustration)}</span>
          <span>Mucho</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleComplete}
        className="flex items-center gap-2 mx-auto px-8 py-4 rounded-2xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg"
      >
        <Smile size={20} />
        ¡Listo para aprender!
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 0 && <motion.div key="mood">{renderMoodStep()}</motion.div>}
          {step === 1 && <motion.div key="energy">{renderEnergyStep()}</motion.div>}
          {step === 2 && <motion.div key="frustration">{renderFrustrationStep()}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
