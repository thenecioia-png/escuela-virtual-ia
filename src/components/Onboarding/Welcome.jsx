import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-6 inline-block"
        >
          🦉
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-black text-forest-900 mb-3 leading-tight">
          Escuela Virtual<br />
          <span className="text-forest-500">Inteligente</span>
        </h1>

        <p className="text-lg text-forest-600 mb-8 leading-relaxed">
          Hola, pequeño explorador. Soy tu maestra virtual 🌟<br />
          Quiero <strong>conocerte</strong> para enseñarte de la forma <strong>más divertida</strong> para ti.
        </p>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="inline-flex items-center gap-3 bg-forest-500 hover:bg-forest-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-forest-500/25 transition-colors"
        >
          <Sparkles size={22} />
          ¡Empezar a conocernos!
          <ArrowRight size={22} />
        </motion.button>

        <p className="mt-6 text-sm text-forest-400">
          Solo tomará 2 minutos. Prometido.
        </p>
      </motion.div>
    </div>
  );
}
