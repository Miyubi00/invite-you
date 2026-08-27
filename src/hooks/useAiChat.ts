// ============================================================
// src/hooks/useAiChat.ts
// ------------------------------------------------------------
// State chat AI assistant: riwayat pesan, handover ke admin via
// Telegram (polling), kirim pertanyaan ke Edge Function 'ai-chat'.
// Dipakai di  : components/contact/AiAssistant
// Keterikatan : lib/supabaseClient, react
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** 'busy' = AI limit/sibuk, 'error' = gagal jaringan, 'admin' = balasan admin Telegram, 'handover' = sistem handover */
  kind?: 'normal' | 'busy' | 'error' | 'admin' | 'handover' | 'handover_busy';
}

const STORAGE_KEY = 'loverse_ai_chat_history';
const ANON_KEY = 'loverse_anon_id';
const HANDOVER_KEY = 'loverse_handover_active';
const MAX_CONTEXT_MESSAGES = 12;
const MAX_QUESTION_LENGTH = 1000;

function loadHistory(): AiChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    );
  } catch {
    return [];
  }
}

function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2, 10);
  }
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>(loadHistory);
  const [isTyping, setIsTyping] = useState(false);
  const [handoverActive, setHandoverActive] = useState(() => {
    try {
      return sessionStorage.getItem(HANDOVER_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [anonId] = useState<string>(getAnonId);

  const messagesRef = useRef(messages);
  const anonIdRef = useRef<string>(anonId);
  const pollSeenRef = useRef<number>(0);

  useEffect(() => {
    anonIdRef.current = anonId;
  }, [anonId]);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    try {
      if (handoverActive) sessionStorage.setItem(HANDOVER_KEY, '1');
      else sessionStorage.removeItem(HANDOVER_KEY);
    } catch {
      /* ignore */
    }
  }, [handoverActive]);

  // Polling balasan admin saat handover aktif (dengan animasi mengetik)
  useEffect(() => {
    if (!handoverActive) return;
    pollSeenRef.current = messagesRef.current.filter((m) => m.kind === 'admin').length;
    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const { data } = await supabase.functions.invoke('ai-chat', {
          body: { poll: true, anonId: anonIdRef.current },
        });
        if (cancelled) return;
        const transcript = Array.isArray(data?.transcript) ? data.transcript as Array<{ role: string; content: string }> : [];
        const adminMsgs = transcript.filter((t) => t.role === 'admin' && typeof t.content === 'string');
        if (adminMsgs.length > pollSeenRef.current) {
          const newOnes = adminMsgs.slice(pollSeenRef.current);
          // Animasi mengetik: durasi berdasar panjang teks
          const longest = newOnes.reduce((max, m) => Math.max(max, m.content.length), 0);
          const delay = Math.min(Math.max(700, longest * 28), 3500);
          setIsAdminTyping(true);
          await new Promise<void>((resolve) => {
            const t = window.setTimeout(resolve, delay);
            // jika dibatalkan, tetap resolve cepat
            if (cancelled) {
              window.clearTimeout(t);
              resolve();
            }
          });
          if (cancelled) return;
          setIsAdminTyping(false);
          pollSeenRef.current = adminMsgs.length;
          setMessages((prev) => {
            const existingContents = new Set(prev.filter((m) => m.kind === 'admin').map((m) => m.content));
            const toAdd = newOnes.filter((m) => !existingContents.has(m.content));
            if (toAdd.length === 0) return prev;
            return [
              ...prev,
              ...toAdd.map((m) => ({ role: 'assistant' as const, content: m.content, kind: 'admin' as const })),
            ];
          });
        }
        if ((data as { status?: string })?.status === 'closed') {
          window.setTimeout(() => setHandoverActive(false), 1200);
        }
      } catch {
        /* polling error — diamkan, coba lagi */
      }
      if (!cancelled) timer = window.setTimeout(poll, 3000);
    };

    poll();
    return () => {
      cancelled = true;
      setIsAdminTyping(false);
      if (timer) window.clearTimeout(timer);
    };
  }, [handoverActive]);

  const request = useCallback(async (history: AiChatMessage[]) => {
    setIsTyping(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          anonId: anonIdRef.current,
          messages: history.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
      if (error) throw new Error(error.message);

      if (data?.handoverBusy) {
        return { kind: 'handover_busy' as const, reply: String(data.reply ?? '') };
      }
      if (data?.handover && data?.silent) {
        return { kind: 'handover_silent' as const };
      }
      if (data?.handover) {
        return { kind: 'handover' as const, reply: String(data.reply ?? '') };
      }
      if (data?.handoverClosed) {
        return { kind: 'handover' as const, reply: String(data.reply ?? ''), closed: true as const };
      }
      if (data?.busy) return { kind: 'busy' as const };
      if (typeof data?.reply === 'string' && data.reply.trim()) {
        return { kind: 'normal' as const, reply: data.reply as string };
      }
      throw new Error('Balasan kosong');
    } catch {
      return { kind: 'error' as const };
    } finally {
      setIsTyping(false);
    }
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!trimmed || isTyping) return;

      const userMsg: AiChatMessage = { role: 'user', content: trimmed };
      const history = [...messagesRef.current, userMsg];
      setMessages(history);

      const outcome = await request(history);
      if (outcome.kind === 'normal') {
        setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply }]);
      } else if ((outcome as { kind: string }).kind === 'handover_silent') {
        setHandoverActive(true);
      } else if (outcome.kind === 'handover') {
        setHandoverActive(true);
        pollSeenRef.current = 0;
        setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply, kind: 'handover' }]);
        if ((outcome as { closed?: boolean }).closed) setHandoverActive(false);
      } else if (outcome.kind === 'handover_busy') {
        setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply, kind: 'handover_busy' }]);
      } else if (outcome.kind === 'busy') {
        setMessages((prev) => [...prev, { role: 'assistant', content: '', kind: 'busy' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '', kind: 'error' }]);
      }
    },
    [isTyping, request],
  );

  const retry = useCallback(async () => {
    if (isTyping) return;
    const history = [...messagesRef.current];
    while (history.length && history[history.length - 1].role === 'assistant') {
      history.pop();
    }
    const lastUser = history[history.length - 1];
    if (!lastUser || lastUser.role !== 'user') return;

    history.pop();
    setMessages([...history, lastUser]);
    const outcome = await request([...history, lastUser]);
    if (outcome.kind === 'normal') {
      setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply }]);
    } else if ((outcome as { kind: string }).kind === 'handover_silent') {
      setHandoverActive(true);
    } else if (outcome.kind === 'handover') {
      setHandoverActive(true);
      setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply, kind: 'handover' }]);
    } else if (outcome.kind === 'handover_busy') {
      setMessages((prev) => [...prev, { role: 'assistant', content: outcome.reply, kind: 'handover_busy' }]);
    } else if (outcome.kind === 'busy') {
      setMessages((prev) => [...prev, { role: 'assistant', content: '', kind: 'busy' }]);
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', content: '', kind: 'error' }]);
    }
  }, [isTyping, request]);

  const closeHandover = useCallback(async () => {
    setHandoverActive(false);
    pollSeenRef.current = 0;
    try {
      await supabase.functions.invoke('ai-chat', { body: { closeHandover: true, anonId: anonIdRef.current } });
    } catch {
      /* ignore */
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Sesi dengan admin diakhiri. Kembali ke LoVerse AI.', kind: 'handover' }]);
  }, []);

  const requestHandover = useCallback(async () => {
    await send('Halo, saya mau bicara dengan admin');
  }, [send]);

  return { messages, isTyping, isAdminTyping, send, retry, handoverActive, closeHandover, requestHandover, anonId };
}
