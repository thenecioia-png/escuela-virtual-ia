// Cliente Supabase — capa de datos en la nube (BD + Auth + Realtime).
// Si faltan las variables de entorno, exporta `null` y la app funciona
// en "modo local" (localStorage), exactamente como antes.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True solo si la nube está configurada; el resto de la app decide con esto.
export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isCloudConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
