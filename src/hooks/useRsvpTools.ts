// ============================================================
// src/hooks/useRsvpTools.ts
// ------------------------------------------------------------
// Manajemen buku tamu (RSVP): balasan, hapus, dan export CSV.
// Dipakai di  : RsvpTab (customer dashboard)
// Keterikatan : lib/customerClient, components/GlobalToast, types/database
// ============================================================

// Hook manajemen buku tamu (RSVP): balasan, hapus, dan export CSV.
// Sejak daftar beralih ke server-side (useRsvpServer), mutasi TIDAK lagi
// mengubah array lokal — cukup refresh() halaman aktif agar data pasti sinkron.

import { useState } from 'react';
import { resolveDbClient } from '../lib/customerClient';
import { useToast } from '../components/GlobalToast';
import type { RsvpRow } from '../types/database';
import { useTranslation } from '../i18n';

interface RsvpToolsOptions {
  /** Muat ulang halaman aktif dari server setelah mutasi berhasil. */
  refresh: () => Promise<void>;
  /** Ambil seluruh baris yang cocok dengan filter aktif (untuk export CSV). */
  getAllRows: () => Promise<RsvpRow[]>;
}

export function useRsvpTools(orderId: string | undefined, options: RsvpToolsOptions) {
  const toast = useToast();
  const { t } = useTranslation();
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleReply = async (rsvpId: string) => {
    const message = replyText[rsvpId];
    if (!message) return toast.warning(t('toast.replyRequired'));
    // eq order_id: defense-in-depth di atas RLS.
    const { count, error: replyError } = await resolveDbClient()
      .from('rsvps')
      .update({ reply: message }, { count: 'exact' })
      .eq('id', rsvpId)
      .eq('order_id', orderId ?? '');
    if (!replyError && (count ?? 0) > 0) {
      toast.success(t('toast.replySent'));
      await options.refresh();
      setReplyText(prev => ({ ...prev, [rsvpId]: '' }));
    } else if (!replyError) {
      toast.error(t('toast.replyNoChange'));
    } else {
      toast.error(t('toast.replyFailed'));
    }
  };

  const handleDeleteRsvp = async (rsvpId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

    const { count, error: deleteError } = await resolveDbClient()
      .from('rsvps')
      .delete({ count: 'exact' })
      .eq('id', rsvpId)
      .eq('order_id', orderId ?? '');

    if (!deleteError && (count ?? 0) > 0) {
      toast.success(t('toast.commentDeleted'));
      await options.refresh();
    } else if (!deleteError) {
      toast.error(t('toast.commentDeleteNoChange'));
    } else {
      toast.error(t('toast.commentDeleteFailed', { error: deleteError.message }));
    }
  };

  const downloadCSV = async () => {
    const rsvps = await options.getAllRows();
    if (rsvps.length === 0) return toast.warning(t('toast.noDataToExport'));
    /** Escape satu sel CSV: kutip-ganda di-escape ("") + selalu dibungkus
     *  kutip agar koma/newline dalam pesan tamu tidak memutus baris.
     *  Prefix apostrof untuk sel berawalan formula (mitigasi Excel formula injection). */
    const escapeCell = (value: unknown): string => {
      let s = value == null ? '' : String(value);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const headers = ["Nama Tamu", "Status", "Jumlah", "Pesan", "Waktu"];
    const rows = rsvps.map(r => [r.guest_name, r.status, r.pax, r.message || '-', new Date(r.created_at ?? new Date()).toLocaleDateString('id-ID')]);
    // \uFEFF (BOM) agar karakter non-ASCII terbaca benar oleh Excel.
    const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.map(escapeCell).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Buku_Tamu.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { replyText, setReplyText, handleReply, handleDeleteRsvp, downloadCSV };
}
