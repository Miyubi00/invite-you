// ============================================================
// src/hooks/useAiChat.ts
// ------------------------------------------------------------
// State chat AI assistant: riwayat pesan (persist sessionStorage),
// kirim pertanyaan ke Edge Function 'ai-chat', dan retry pesan
// terakhir saat gagal. Dipakai di  : components/contact/AiAssistant
// Keterikatan : lib/apiHeaders, react
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** 'busy' = AI limit/sibuk (tampilkan eskalasi WA), 'error' = gagal jaringan. */
  kind?: 'normal' | 'busy' | 'error';
}

const STORAGE_KEY = 'loverse_ai_chat_history';
/** Jumlah pesan terakhir yang dikirim ke model (hemat token & kuota). */
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

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>(loadHistory);
  const [isTyping, setIsTyping] = useState(false);

  // Ref agar send()/retry() selalu membaca riwayat termutakhir tanpa re-render.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* storage penuh / private mode — abaikan */
    }
  }, [messages]);

  const request = useCallback(async (history: AiChatMessage[]) => {
    setIsTyping(true);
    try {
      // functions.invoke() melampirkan Authorization otomatis (JWT sesi
      // atau anon key) sehingga lolos gerbang JWT Supabase meski anonim.
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: history.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
      if (error) throw new Error(error.message);

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

  /** Kirim pertanyaan user; balasan/busy/error ditambahkan ke riwayat. */
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!trimmed || isTyping) return;

      const userMsg: AiChatMessage = { role: 'user', content: trimmed };
      const history = [...messagesRef.current, userMsg];
      setMessages(history);

      const outcome = await request(history);
      if (outcome.kind === 'normal') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: outcome.reply },
        ]);
      } else if (outcome.kind === 'busy') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '', kind: 'busy' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '', kind: 'error' },
        ]);
      }
    },
    [isTyping, request],
  );

  /** Hapus bubble error/busy terakhir lalu kirim ulang pertanyaan user terakhir. */
  const retry = useCallback(async () => {
    if (isTyping) return;
    const history = [...messagesRef.current];
    while (
      history.length &&
      history[history.length - 1].role === 'assistant'
    ) {
      history.pop();
    }
    const lastUser = history[history.length - 1];
    if (!lastUser || lastUser.role !== 'user') return;

    history.pop();
    setMessages([...history, lastUser]);
    const outcome = await request([...history, lastUser]);
    if (outcome.kind === 'normal') {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: outcome.reply },
      ]);
    } else if (outcome.kind === 'busy') {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', kind: 'busy' },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', kind: 'error' },
      ]);
    }
  }, [isTyping, request]);

  return { messages, isTyping, send, retry };
}
