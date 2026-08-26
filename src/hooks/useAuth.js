// Hook de autenticación del PADRE/MADRE (Supabase Auth, email+password).
// Si Supabase no está configurado (.env ausente) funciona en "modo demo":
// sesión local sin nube, con aviso claro en la UI.
import { useState, useEffect, useCallback } from 'react';
import { supabase, isCloudConfigured } from '../lib/supabase';
import { getStorage, setStorage, removeStorage } from '../utils/storage';

// ID de familia ficticio para el modo demo (todo queda en localStorage)
const DEMO_FAMILY_ID = 'demo-family-local';

export function useAuth() {
  const [session, setSession] = useState(() => getStorage('auth_session', null));
  const [loading, setLoading] = useState(isCloudConfigured);
  const [error, setError] = useState(null);

  const familyId = session?.familyId || null;
  const isDemo = session?.demo === true;

  // Crea (si no existe) la fila de familia vinculada al usuario autenticado
  async function ensureFamily(user) {
    await supabase
      .from('families')
      .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
    const sess = { email: user.email, familyId: user.id, demo: false };
    setSession(sess);
    setStorage('auth_session', sess);
  }

  // Restaurar sesión de Supabase al cargar (si hay nube configurada)
  useEffect(() => {
    if (!isCloudConfigured) {
      setLoading(false);
      return;
    }
    let subscription;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) ensureFamily(data.session.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) ensureFamily(s.user);
      else {
        setSession(null);
        removeStorage('auth_session');
      }
    });
    subscription = data.subscription;
    return () => subscription?.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(traducirError(err.message));
      return false;
    }
    return true;
  }, []);

  const register = useCallback(async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(traducirError(err.message));
      return false;
    }
    // Con "confirm email" desactivado la sesión entra sola vía onAuthStateChange
    return true;
  }, []);

  const loginDemo = useCallback(() => {
    const sess = { email: 'demo@local', familyId: DEMO_FAMILY_ID, demo: true };
    setSession(sess);
    setStorage('auth_session', sess);
  }, []);

  const logout = useCallback(async () => {
    if (isCloudConfigured && !isDemo) await supabase.auth.signOut();
    setSession(null);
    removeStorage('auth_session');
  }, [isDemo]);

  return {
    session,
    familyId,
    isDemo,
    loading,
    error,
    cloudEnabled: isCloudConfigured,
    login,
    register,
    loginDemo,
    logout,
  };
}

// Mensajes de error de Supabase Auth → español
function traducirError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('User already registered')) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate email')) return 'Ese correo no parece válido.';
  return msg;
}
