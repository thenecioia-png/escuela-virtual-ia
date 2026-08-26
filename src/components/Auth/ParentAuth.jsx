// Vista de autenticación del PADRE/MADRE.
// Con Supabase: registro/login real con email + contraseña.
// Sin Supabase: solo modo demo local, con aviso claro de que no hay nube.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, CloudOff, UserRound } from 'lucide-react';

export default function ParentAuth({ auth, onAuthenticated, onBack }) {
  const { cloudEnabled, login, register, loginDemo, error, loading } = auth;
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = email.includes('@') && password.length >= 6 && !busy;

  const submit = async () => {
    setBusy(true);
    const ok = mode === 'login' ? await login(email, password) : await register(email, password);
    setBusy(false);
    if (ok) onAuthenticated();
  };

  const enterDemo = () => {
    loginDemo();
    onAuthenticated();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-forest-500 font-bold animate-pulse">Conectando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-forest-100 rounded-xl text-forest-600">
            <UserRound size={20} />
          </div>
          <h2 className="text-xl font-black text-forest-900">Cuenta de Papá / Mamá</h2>
        </div>
        <p className="text-sm text-forest-500 mb-6">
          Tu cuenta guarda el progreso de tus hijos en la nube y te deja seguirlo desde cualquier dispositivo.
        </p>

        {cloudEnabled ? (
          <>
            <div className="space-y-3">
              <label className="flex items-center gap-2 bg-white border-2 border-forest-200 rounded-2xl px-4 py-3 focus-within:border-forest-500 transition-all">
                <Mail size={18} className="text-forest-300 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="flex-1 outline-none text-forest-900 font-semibold placeholder:text-forest-300"
                />
              </label>
              <label className="flex items-center gap-2 bg-white border-2 border-forest-200 rounded-2xl px-4 py-3 focus-within:border-forest-500 transition-all">
                <Lock size={18} className="text-forest-300 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && submit()}
                  className="flex-1 outline-none text-forest-900 font-semibold placeholder:text-forest-300"
                />
              </label>
            </div>

            {error && (
              <p className="mt-3 text-sm font-bold text-rose-500 bg-rose-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-forest-500/20"
            >
              {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="mt-3 w-full text-center text-sm font-bold text-forest-500 hover:text-forest-700 transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </>
        ) : (
          <>
            {/* Modo demo: sin Supabase configurado */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <CloudOff size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">
                <strong>Modo demo:</strong> la nube no está configurada, así que los datos se guardan
                solo en este dispositivo. Para activar cuentas reales, configura Supabase
                (copia <code>.env.example</code> a <code>.env</code> con tus keys).
              </p>
            </div>
            <button
              onClick={enterDemo}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg shadow-forest-500/20"
            >
              Entrar en modo demo
              <ArrowRight size={18} />
            </button>
          </>
        )}

        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 mx-auto text-sm font-bold text-forest-400 hover:text-forest-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </motion.div>
    </div>
  );
}
