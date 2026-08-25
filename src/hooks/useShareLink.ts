// ============================================================
// src/hooks/useShareLink.ts
// ------------------------------------------------------------
// Fitur "Sebar Undangan": generate link personal tamu, share WhatsApp, import daftar tamu dari file CSV (.csv).
// Dipakai di  : ShareTab (customer dashboard)
// Keterikatan : components/GlobalToast, types/database
// ============================================================

// Hook fitur "Sebar Undangan": generate link tamu, share WhatsApp,
// dan import daftar tamu dari file CSV (.csv).

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useToast } from '../components/GlobalToast';
import { useCopyToClipboard } from './useCopyToClipboard';
import type { OrderRow } from '../types/database';
import { useTranslation } from '../i18n';

export function useShareLink(order: OrderRow | null) {
  const toast = useToast();
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  const [shareMode, setShareMode] = useState('manual'); // 'manual' | 'excel'
  const [guestName, setGuestName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [excelGuests, setExcelGuests] = useState<string[]>([]); // Menyimpan daftar tamu dari Excel

  // Fungsi Generate Pesan WhatsApp
  const generateWaMessage = (name: string, link: string) => {
    if (!order) return '';
    return `Kepada Yth.
Bapak/Ibu/Saudara/i
*${name}*

_Assalamualaikum Warahmatullahi Wabarakaatuh_

Dengan memohon rahmat dan ridho Allah SWT, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami :

🧕🏻 *${order.bride_name}*
dengan
🤵🏻 *${order.groom_name}*

Berikut tautan undangan kami untuk informasi lengkap mengenai acara :
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

_Wassalamualaikum Warahmatullahi Wabarakaatuh_
`;
  };

  const handleShareWa = (name: string) => {
    if (!order) return;
    const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(name)}`;
    const message = generateWaMessage(name, link);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleGenerateManual = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) return;
    if (!guestName) return;
    const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(guestName)}`;
    setGeneratedLink(link);
    toast.success(t('toast.linkCreated'));
  };

  // --- SMART CSV PARSER (CSV-only) ---
  // Dependency `xlsx` DIHAPUS dari proyek (CVE Prototype Pollution/ReDoS +
  // ±430KB chunk). Daftar tamu di-export dari Excel sebagai CSV:
  // File > Save As > CSV UTF-8. Tetap diterapkan: batas ukuran 2MB.
  const handleFileUploadExcel = (e: ChangeEvent<HTMLInputElement>) => {
    // Tangkap File DULU, baru reset input (agar file yang sama bisa dimuat
    // ulang). Urutan terbalik akan menghapus daftar file sebelum terbaca.
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // 1. VALIDASI EKSTENSI - hanya .csv
    const fileExt = (file.name.split('.').pop() ?? '').toLowerCase();
    if (fileExt !== 'csv') {
      toast.error(t('toast.csvOnly'));
      return;
    }

    // 2. VALIDASI UKURAN
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('toast.fileTooLarge', { max: `${MAX_FILE_SIZE / (1024 * 1024)}MB` }));
      return;
    }

    /** Pecah satu baris CSV jadi sel; hormati kutip-ganda ("a,b" = satu sel). */
    const splitCsvLine = (line: string, delimiter: string): string[] => {
      const cells: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (ch === delimiter && !inQuotes) {
          cells.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      cells.push(cur);
      return cells.map((c) => c.trim());
    };

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        // Buang BOM UTF-8 yang ditulis Excel pada varian "CSV UTF-8".
        const text = String(evt.target?.result ?? '').replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          toast.error(t('toast.fileEmpty'));
          return;
        }

        // Deteksi delimiter otomatis (; , atau tab) dari baris pertama.
        const delimiter = [';', ',', '\t']
          .map((d) => ({ d, n: lines[0].split(d).length }))
          .sort((a, b) => b.n - a.n)[0].d;

        const rows = lines.map((l) => splitCsvLine(l, delimiter));

        let targetColIndex = -1;
        let startRowIndex = 0;

        // Kata kunci untuk deteksi otomatis header (Case Insensitive)
        const keywords = ['nama', 'tamu', 'undangan', 'invite', 'kepada', 'yth'];

        // 1. Cari Header di 5 baris pertama
        for (let r = 0; r < Math.min(rows.length, 5); r++) {
          const row = rows[r];
          for (let c = 0; c < row.length; c++) {
            const cellValue = row[c].toLowerCase();
            if (keywords.some((key) => cellValue.includes(key))) {
              targetColIndex = c;
              startRowIndex = r + 1; // Data dimulai setelah header
              break;
            }
          }
          if (targetColIndex !== -1) break;
        }

        // 2. Fallback: Jika tidak ada header, ambil kolom pertama
        if (targetColIndex === -1) {
          targetColIndex = 0;
          startRowIndex = 0;
        }

        // 3. Ekstrak Data Nama
        const guests: string[] = [];
        for (let i = startRowIndex; i < rows.length; i++) {
          const rawName = rows[i][targetColIndex] ?? '';
          if (rawName && rawName.length > 1 && !keywords.includes(rawName.toLowerCase())) {
            guests.push(rawName);
          }
        }

        if (guests.length > 0) {
          setExcelGuests(guests);
          toast.success(t('toast.guestsLoaded', { count: guests.length }));
        } else {
          toast.error(t('toast.noValidGuests'));
        }
      } catch (error) {
        console.error("CSV parsing error:", error);
        toast.error(t('toast.csvReadFailed'));
      }
    };

    reader.onerror = () => {
      toast.error(t('toast.fileReadError'));
    };

    reader.readAsText(file, 'utf-8');
  };

  /** Unduh contoh format CSV daftar tamu (BOM UTF-8 agar benar dibuka di Excel). */
  const downloadExampleCsv = () => {
    // Format resmi: baris pertama = judul kolom, kolom pertama = nama tamu.
    const rows: string[][] = [
      ['Nama Tamu'],
      ['Budi & Keluarga'],
      ['Rina Dewi'],
      ['Keluarga Besar Haji Ahmad'],
      ['Sahabat Kost Putri'],
    ];
    const escapeCell = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contoh-daftar-tamu.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyLink = (name: string) => {
    if (!order) return;
    const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(name)}`;
    // Hook bersama: fallback konteks non-secure (HTTP) + feedback toast
    // yang akurat (sebelumnya blind-success tanpa catch).
    void copyToClipboard(link, `Link untuk ${name}`);
  };

  return {
    shareMode, setShareMode,
    guestName, setGuestName,
    generatedLink, setGeneratedLink,
    excelGuests, setExcelGuests,
    handleShareWa, handleGenerateManual, handleFileUploadExcel, copyLink,
    downloadExampleCsv,
  };
}
