// Mensajes del padre → niño (ánimo, pistas, notas).
// Con Supabase: tabla parent_messages + Realtime (el niño los ve en vivo).
// Sin Supabase: localStorage (el niño los ve al recargar/cambiar de vista).
import { useState, useEffect, useCallback } from 'react';
import { supabase, isCloudConfigured } from '../lib/supabase';
import { getStorage, setStorage } from '../utils/storage';

const LOCAL_KEY = 'parent_messages';

const loadLocal = (studentId) =>
  getStorage(LOCAL_KEY, []).filter((m) => m.student_id === studentId);

export function useParentMessages(studentId, familyId) {
  const [messages, setMessages] = useState([]);
  const useCloud = isCloudConfigured && familyId && !String(familyId).startsWith('demo-');

  // Carga inicial + suscripción realtime
  useEffect(() => {
    if (!studentId) {
      setMessages([]);
      return;
    }

    if (!useCloud) {
      setMessages(loadLocal(studentId));
      return;
    }

    let cancelled = false;
    supabase
      .from('parent_messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!cancelled && data) setMessages(data);
      });

    // Realtime: mensajes nuevos llegan sin recargar
    const channel = supabase
      .channel(`parent_messages:${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'parent_messages', filter: `student_id=eq.${studentId}` },
        (payload) => setMessages((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [studentId, useCloud]);

  const sendMessage = useCallback(
    async (tipo, texto) => {
      if (!studentId || !texto.trim()) return false;
      const msg = {
        student_id: studentId,
        family_id: familyId,
        tipo,
        texto: texto.trim(),
        leido: false,
      };
      if (useCloud) {
        const { error } = await supabase.from('parent_messages').insert(msg);
        if (error) return false;
        // El realtime la añade sola; por si acaso, refrescamos
        const { data } = await supabase
          .from('parent_messages')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
          .limit(50);
        if (data) setMessages(data);
        return true;
      }
      const local = { ...msg, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
      const all = [local, ...getStorage(LOCAL_KEY, [])];
      setStorage(LOCAL_KEY, all);
      setMessages(loadLocal(studentId));
      return true;
    },
    [studentId, familyId, useCloud]
  );

  const markRead = useCallback(
    async (id) => {
      if (useCloud) {
        await supabase.from('parent_messages').update({ leido: true }).eq('id', id);
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, leido: true } : m)));
        return;
      }
      const all = getStorage(LOCAL_KEY, []).map((m) => (m.id === id ? { ...m, leido: true } : m));
      setStorage(LOCAL_KEY, all);
      setMessages(loadLocal(studentId));
    },
    [useCloud, studentId]
  );

  return { messages, unreadCount: messages.filter((m) => !m.leido).length, sendMessage, markRead };
}
