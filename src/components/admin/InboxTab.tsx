import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CheckCheck,
  FileText,
  Inbox,
  Mail,
  MailOpen,
  Paperclip,
  RefreshCw,
  Reply,
  Send,
  User,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { ToastApi } from '../GlobalToast';
import { useTranslation } from '../../i18n';

export interface InboxAttachment {
  name: string;
  mime: string;
  size: number;
  url: string;
}

export interface InboxMessage {
  id: string;
  from_addr: string;
  to_addr: string;
  subject: string;
  text_body: string;
  received_at: string;
  is_read: boolean;
  replied_at: string | null;
  attachments?: InboxAttachment[];
}

interface InboxTabProps {
  toast: ToastApi;
  onCountChange?: (unread: number) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function initialOf(email: string): string {
  const c = (email || '?').trim().charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(c) ? c : '?';
}

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pecah teks jadi segmen; URL jadi tautan biru bergaris bawah (aman, tanpa dangerouslySetInnerHTML). */
function renderLinkified(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /https?:\/\/[^\s<>"'`\]]+/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let url = m[0];
    let trail = '';
    while (url.length > 0 && /[.,;:!?)]$/.test(url)) {
      trail = url.slice(-1) + trail;
      url = url.slice(0, -1);
    }
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (url) {
      parts.push(
        <a key={k++} href={url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-blue-700 underline">
          {url}
        </a>,
      );
    }
    if (trail) parts.push(trail);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : [text];
}

const MAX_ATTACH_FILES = 3;
const MAX_ATTACH_EACH = 5 * 1024 * 1024;

function isImageAtt(a: { mime: string; name: string }): boolean {
  return a.mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(a.name);
}

function isPdfAtt(a: { mime: string; name: string }): boolean {
  return a.mime === 'application/pdf' || /\.pdf$/i.test(a.name);
}

function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? '');
      resolve(s.includes(',') ? s.split(',').slice(1).join(',') : s);
    };
    r.onerror = () => reject(new Error('read'));
    r.readAsDataURL(file);
  });
}

export default function InboxTab({ toast, onCountChange }: InboxTabProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InboxMessage | null>(null);
  const [reply, setReply] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [attaches, setAttaches] = useState<Array<{ file: File; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<string[]>([]);

  // Revoke sisa object URL saat komponen dilepas.
  useEffect(() => {
    const ref = urlsRef;
    return () => {
      ref.current.forEach((u) => URL.revokeObjectURL(u));
      ref.current = [];
    };
  }, []);

  const applyRows = useCallback(
    (rows: InboxMessage[]) => {
      setMessages(rows);
      onCountChange?.(rows.filter((m) => !m.is_read).length);
      setSelected((prev) => (prev ? rows.find((m) => m.id === prev.id) ?? null : null));
    },
    [onCountChange],
  );

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('inbound_emails')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(100);
    if (error) {
      toast.error(t('admin.inboxLoadFail'));
      return;
    }
    applyRows((data ?? []) as InboxMessage[]);
  }, [toast, t, applyRows]);

  const refreshMessages = async () => {
    setLoading(true);
    try {
      await fetchMessages();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      await fetchMessages();
      if (mounted) setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [fetchMessages]);

  const openMessage = async (msg: InboxMessage) => {
    setSelected(msg);
    setReply('');
    setReplyOpen(false);
    setAttaches([]);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    if (!msg.is_read) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
      onCountChange?.(messages.filter((m) => !m.is_read && m.id !== msg.id).length);
      await supabase.from('inbound_emails').update({ is_read: true }).eq('id', msg.id);
    }
  };

  const addAttachFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    if (attaches.length + picked.length > MAX_ATTACH_FILES) {
      toast.error(t('admin.inboxTooMany'));
    }
    for (const f of picked) {
      if (attaches.length >= MAX_ATTACH_FILES) break;
      if (f.size > MAX_ATTACH_EACH) {
        toast.error(t('admin.inboxFileTooBig', { name: f.name }));
        continue;
      }
      const url = URL.createObjectURL(f);
      urlsRef.current.push(url);
      setAttaches((prev) =>
        prev.length >= MAX_ATTACH_FILES ? prev : [...prev, { file: f, url }],
      );
    }
  };

  const removeAttachFile = (index: number) => {
    const target = attaches[index];
    if (target) {
      URL.revokeObjectURL(target.url);
      urlsRef.current = urlsRef.current.filter((u) => u !== target.url);
    }
    setAttaches((prev) => prev.filter((_, j) => j !== index));
  };

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const attachments = [];
      for (const a of attaches) {
        attachments.push({ filename: a.file.name, content: await readFileBase64(a.file) });
      }
      const { data, error } = await supabase.functions.invoke('reply-email', {
        body: { id: selected.id, body: reply.trim(), attachments },
      });
      if (error || (data as { error?: string } | null)?.error) {
        toast.error((data as { error?: string } | null)?.error ?? t('admin.inboxReplyFail'));
        return;
      }
      toast.success(t('admin.inboxReplyOk'));
      setReply('');
      setReplyOpen(false);
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
      setAttaches([]);
      await fetchMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#712E1E]">
            <Inbox size={20} className="text-[#FFD5AF]" />
          </span>
          <div>
            <h2 className="text-lg font-black text-stone-800">{t('admin.inboxTitle')}</h2>
            <p className="text-xs text-stone-500">{t('admin.inboxSubtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refreshMessages()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-stone-600 shadow-sm hover:bg-stone-100"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('admin.inboxRefresh')}
        </button>
      </div>

      {loading && messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">{t('common.loading')}</p>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#faf3e9]">
            <Inbox size={24} className="text-[#b89a83]" />
          </span>
          <p className="mt-3 text-sm font-bold text-stone-500">{t('admin.inboxEmpty')}</p>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[340px_1fr]">
          {/* daftar pesan */}
          <div className="space-y-2">
            {messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => void openMessage(m)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left shadow-sm transition ${
                  selected?.id === m.id
                    ? 'border-[#712E1E] bg-[#faf6ef]'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    m.is_read ? 'bg-stone-200 text-stone-500' : 'bg-[#712E1E] text-[#FFD5AF]'
                  }`}
                >
                  {initialOf(m.from_addr)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {m.is_read ? (
                      <MailOpen size={13} className="shrink-0 text-stone-400" />
                    ) : (
                      <Mail size={13} className="shrink-0 text-[#712E1E]" />
                    )}
                    <span className={`truncate text-[13px] ${m.is_read ? 'font-semibold text-stone-600' : 'font-black text-stone-800'}`}>
                      {m.from_addr}
                    </span>
                    {!m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#712E1E]" />}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-stone-500">{m.subject}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-stone-400">
                    {(m.text_body || '').split('\n')[0]}
                  </span>
                  <span className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={11} /> {formatDate(m.received_at)}
                    </span>
                    {m.replied_at && (
                      <span className="inline-flex items-center gap-1 font-bold text-green-700">
                        <CheckCheck size={12} /> {t('admin.inboxReplied')}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* isi pesan */}
          <div className="h-fit overflow-hidden rounded-2xl bg-white shadow-sm">
            {!selected ? (
              <p className="flex items-center justify-center gap-2 px-6 py-14 text-center text-sm text-stone-400">
                <MailOpen size={16} /> {t('admin.inboxSelectHint')}
              </p>
            ) : (
              <div>
                <div className="border-b border-stone-100 bg-[#faf6ef] px-5 py-4">
                  <p className="flex items-start gap-2.5">
                    <FileText size={18} className="mt-0.5 shrink-0 text-[#712E1E]" />
                    <span className="text-[15px] font-black leading-snug text-stone-800">{selected.subject}</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-500">
                    <p className="flex items-center gap-2">
                      <User size={13} className="shrink-0 text-[#712E1E]" />
                      {t('admin.inboxFrom')} <strong className="text-stone-700">{selected.from_addr}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays size={13} className="shrink-0 text-[#712E1E]" />
                      {formatDate(selected.received_at)}
                    </p>
                    <p className="flex items-center gap-2">
                      <BadgeCheck size={13} className={`shrink-0 ${selected.replied_at ? 'text-green-700' : 'text-stone-400'}`} />
                      {selected.replied_at ? (
                        <span className="font-bold text-green-700">{t('admin.inboxReplied')}</span>
                      ) : (
                        <span>{t('admin.inboxUnread')}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#b89a83]">
                    {t('admin.inboxMessageLabel')}
                  </p>
                  <div className="rounded-xl border-l-4 border-[#712E1E] bg-[#faf8f4] p-4">
                    <p className="max-h-72 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700">
                      {selected.text_body ? renderLinkified(selected.text_body) : `(${t('admin.inboxNoBody')})`}
                    </p>
                  </div>
                </div>

                {(selected.attachments ?? []).length > 0 && (
                  <div className="px-5 pb-1">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b89a83]">
                      <Paperclip size={12} /> {t('admin.inboxAttachments')} ({(selected.attachments ?? []).length})
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {(selected.attachments ?? []).map((a, i) =>
                        isImageAtt(a) ? (
                          <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${a.name} · ${formatSize(a.size)}`}
                            className="group relative block h-20 w-20 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 hover:border-[#712E1E]"
                          >
                            <img src={a.url} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                            <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {a.name}
                            </span>
                          </a>
                        ) : (
                          <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${a.name} · ${formatSize(a.size)}`}
                            className="flex w-44 items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-2.5 hover:border-[#712E1E]"
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-black ${
                                isPdfAtt(a) ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {isPdfAtt(a) ? <span className="text-[10px]">PDF</span> : <FileText size={18} />}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-stone-700">{a.name}</span>
                              <span className="block text-[11px] text-stone-400">{formatSize(a.size)}</span>
                            </span>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-stone-100 px-5 py-4">
                  {!replyOpen ? (
                    <button
                      type="button"
                      onClick={() => setReplyOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#712E1E] px-4 py-2 text-xs font-bold text-white hover:bg-[#5a2318]"
                    >
                      <Reply size={14} /> {t('admin.inboxReplyButton')}
                    </button>
                  ) : (
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
                        <Reply size={13} /> {t('admin.inboxReplyLabel')}
                      </label>
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                        placeholder={t('admin.inboxReplyPlaceholder')}
                        className="w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] p-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        className="hidden"
                        onChange={(e) => {
                          addAttachFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                      {attaches.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2.5">
                          {attaches.map((a, i) => {
                            const img = a.file.type.startsWith('image/');
                            const pdf = a.file.type === 'application/pdf' || /\.pdf$/i.test(a.file.name);
                            return (
                              <span key={i} className="group relative block">
                                {img ? (
                                  <img src={a.url} alt={a.file.name} className="h-20 w-20 rounded-xl border border-stone-200 object-cover" />
                                ) : (
                                  <span
                                    className={`flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-stone-200 font-black ${
                                      pdf ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-500'
                                    }`}
                                  >
                                    {pdf ? <span className="text-xs">PDF</span> : <FileText size={20} />}
                                    <span className="max-w-[64px] truncate px-1 text-[9px] font-semibold">{a.file.name}</span>
                                  </span>
                                )}
                                <span className="absolute -bottom-1 left-1 rounded-full bg-black/55 px-1.5 text-[9px] font-semibold text-white">
                                  {formatSize(a.file.size)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachFile(i)}
                                  className="absolute -right-1.5 -top-1.5 rounded-full bg-stone-800 p-0.5 text-white hover:bg-red-700"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-stone-300"
                        >
                          <Paperclip size={14} /> {t('admin.inboxAttach')}
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendReply()}
                          disabled={sending || !reply.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#712E1E] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          <Send size={14} /> {sending ? t('admin.inboxSending') : t('admin.inboxSend')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyOpen(false);
                            setReply('');
                          }}
                          className="rounded-xl px-3 py-2 text-xs font-bold text-stone-400 hover:text-stone-600"
                        >
                          {t('admin.inboxCancel')}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[11px] text-stone-400">{t('admin.inboxAttachHint')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
