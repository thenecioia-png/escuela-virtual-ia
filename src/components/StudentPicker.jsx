// Selector de estudiante al entrar: toca tu perfil y escribe tu PIN de 4 dígitos.
// Perfiles sin PIN (migrados de la versión anterior) entran con solo tocar.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Plus, LogOut } from 'lucide-react';
import { getCountry, getGrade } from '../lib/curricula';

export default function StudentPicker({ students, onSelect, onAddStudent, onLogout, isDemo }) {
  const [selected, setSelected] = useState(null); // estudiante esperando PIN
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const pick = (student) => {
    if (!student.pin) {
      onSelect(student.id, null); // sin PIN → entra directo
      return;
    }
    setSelected(student);
    setPin('');
    setError(false);
  };

  const pressDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      const ok = onSelect(selected.id, next);
      if (!ok) {
        setError(true);
        setPin('');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <h2 className="text-2xl font-black text-forest-900 text-center mb-2">¿Quién va a aprender hoy?</h2>
        <p className="text-sm text-forest-500 text-center mb-8">Toca tu perfil{selected ? '' : ' y escribe tu PIN si te lo piden'}.</p>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="grid" exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {students.map((s) => {
                  const country = getCountry(s.countryCode);
                  const grade = getGrade(s.countryCode, s.gradeId);
                  return (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => pick(s)}
                      className="glass-card rounded-3xl p-5 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <span className="text-5xl">{s.avatar}</span>
                      <span className="font-black text-forest-900">{s.name}</span>
                      {grade && (
                        <span className="text-xs font-bold text-forest-400">
                          {country?.flag} {grade.label}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddStudent}
                  className="rounded-3xl p-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-forest-300 text-forest-400 hover:border-forest-500 hover:text-forest-600 transition-all"
                >
                  <Plus size={28} />
                  <span className="text-sm font-bold">Agregar estudiante</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-3xl p-6 max-w-xs mx-auto"
            >
              <div className="flex flex-col items-center mb-4">
                <span className="text-5xl mb-2">{selected.avatar}</span>
                <span className="font-black text-forest-900">Hola, {selected.name}</span>
                <span className="text-xs font-bold text-forest-400">Escribe tu PIN de 4 dígitos</span>
              </div>

              <div className="flex justify-center gap-3 mb-5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all ${
                      pin.length > i ? 'bg-forest-500 scale-110' : error ? 'bg-rose-300' : 'bg-forest-200'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-center text-xs font-bold text-rose-500 mb-3">PIN incorrecto, intenta de nuevo</p>}

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <button
                    key={d}
                    onClick={() => pressDigit(String(d))}
                    className="py-3 rounded-xl bg-white border border-forest-200 font-black text-lg text-forest-800 hover:bg-forest-50 transition-colors"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => setSelected(null)}
                  className="py-3 rounded-xl text-sm font-bold text-forest-400 hover:bg-forest-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => pressDigit('0')}
                  className="py-3 rounded-xl bg-white border border-forest-200 font-black text-lg text-forest-800 hover:bg-forest-50 transition-colors"
                >
                  0
                </button>
                <button
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="py-3 rounded-xl text-forest-500 hover:bg-forest-50 transition-colors flex items-center justify-center"
                >
                  <Delete size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-xs font-bold text-forest-300 hover:text-forest-500 transition-colors"
          >
            <LogOut size={14} />
            {isDemo ? 'Salir del modo demo' : 'Cerrar sesión de Papá/Mamá'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
