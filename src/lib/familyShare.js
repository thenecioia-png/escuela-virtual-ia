// Compartir familia por link/QR: el estudiante entra con su PIN desde
// cualquier teléfono, sin cuenta del padre. Usa RPCs seguras (security definer)
// que NO exponen el PIN ni datos sensibles.
import { supabase, isCloudConfigured } from './supabase';
import { getStorage, setStorage } from '../utils/storage';

// Lee ?f=<familyId> de la URL (una sola vez, al cargar)
export function getSharedFamilyId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('f');
    return f && /^[0-9a-f-]{36}$/i.test(f) ? f : null;
  } catch {
    return null;
  }
}

export function buildShareLink(familyId) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?f=${familyId}`;
}

// Trae los estudiantes de la familia compartida (campos mínimos, sin PIN)
export async function fetchSharedStudents(familyId) {
  if (!isCloudConfigured || !familyId) return [];
  const { data, error } = await supabase.rpc('family_students', { fid: familyId });
  if (error || !data) return [];
  return data;
}

// Verifica el PIN en el servidor (nunca se descarga el PIN al teléfono)
export async function verifyRemotePin(studentId, pin) {
  if (!isCloudConfigured) return false;
  const { data, error } = await supabase.rpc('check_student_pin', { sid: studentId, pin_attempt: pin });
  return !error && data === true;
}

// Convierte la fila del RPC en un perfil usable por la app local
export function sharedRowToProfile(row, defaults) {
  return {
    ...defaults,
    id: row.id,
    name: row.nombre,
    avatar: row.avatar || defaults.avatar,
    countryCode: row.country_code || null,
    gradeId: row.grade_id || null,
    pin: row.has_pin ? '__remote__' : null, // se verifica en el servidor
    onboardingComplete: true, // ya completó onboarding en el dispositivo del padre
    sharedFromLink: true,
  };
}

// Guarda los estudiantes compartidos en la caché local (sin pisar perfiles completos)
export function cacheSharedStudents(rows, defaults) {
  const existing = getStorage('students', []);
  const merged = [...existing];
  rows.forEach((row) => {
    const idx = merged.findIndex((s) => s.id === row.id);
    if (idx >= 0) {
      // conservar datos locales ricos si ya existen; solo refrescar lo básico
      merged[idx] = { ...sharedRowToProfile(row, defaults), ...merged[idx], pin: row.has_pin ? '__remote__' : null };
    } else {
      merged.push(sharedRowToProfile(row, defaults));
    }
  });
  setStorage('students', merged);
  return merged;
}
