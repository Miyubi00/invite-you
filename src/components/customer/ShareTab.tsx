// ============================================================
// src/components/customer/ShareTab.tsx
// ------------------------------------------------------------
// Tab "Sebar Undangan" dashboard mempelai: link personal tamu, share WhatsApp, dan import daftar tamu Excel.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : hooks/useShareLink, components/shared/form/ui
// ============================================================

// Tab "Sebar Undangan": buat link personal per tamu (manual) atau
// upload daftar tamu dari file CSV (.csv).

import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import { Copy, Download, FileSpreadsheet, Phone, Send } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { CARD, INPUT } from '../shared/form/ui';
import { useTranslation } from '../../i18n';

interface ShareTabProps {
  shareMode: string;
  setShareMode: (mode: string) => void;
  guestName: string;
  setGuestName: Dispatch<SetStateAction<string>>;
  generatedLink: string;
  excelGuests: string[];
  setExcelGuests: Dispatch<SetStateAction<string[]>>;
  handleShareWa: (name: string) => void;
  handleGenerateManual: (e: FormEvent<HTMLFormElement>) => void;
  handleFileUploadExcel: (e: ChangeEvent<HTMLInputElement>) => void;
  copyLink: (name: string) => void;
  downloadExampleCsv: () => void;
}

export default function ShareTab({
  shareMode,
  setShareMode,
  guestName,
  setGuestName,
  generatedLink,
  excelGuests,
  setExcelGuests,
  handleShareWa,
  handleGenerateManual,
  handleFileUploadExcel,
  copyLink,
  downloadExampleCsv,
}: ShareTabProps) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">{t('customer.share.title')}</h2>
        <p className="text-stone-500 text-sm mt-1">
          {t('customer.share.desc')}
        </p>
      </div>

      {/* Toggle mode */}
      <div className="flex gap-2 mb-6 bg-[#EBDFCE]/60 p-1 rounded-xl w-fit">
        <button
          onClick={() => setShareMode('manual')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
            shareMode === 'manual'
              ? 'bg-white text-[#B4693F] shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {t('customer.share.tabManual')}
        </button>
        <button
          onClick={() => setShareMode('excel')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
            shareMode === 'excel'
              ? 'bg-white text-[#B4693F] shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {t('customer.share.tabExcel')}
        </button>
      </div>

      {shareMode === 'manual' && (
        <section className={CARD}>
          <h3 className="font-bold text-base text-stone-800">
            {t('customer.share.manualHeading')}
          </h3>
          <p className="text-stone-500 text-sm">
            {t('customer.share.manualSub')}
          </p>
          <form onSubmit={handleGenerateManual} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t('customer.share.guestNamePlaceholder')}
              className={`sm:flex-1 ${INPUT}`}
            />
            <button
              type="submit"
              className="shrink-0 bg-[#E59A59] hover:bg-[#d48b4b] text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md"
            >
              {t('customer.share.btnCreateLink')}
            </button>
          </form>

          {generatedLink && (
            <div className="rounded-xl border border-[#F0E2CE] bg-[#FBF6EE] p-5">
              <p className="text-xs font-bold text-[#B4693F] uppercase tracking-widest mb-3">
                {t('customer.share.successTitle')}
              </p>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleShareWa(guestName)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Phone size={16} /> {t('customer.share.btnSendWa')}
                </button>
                <button
                  onClick={() => void copyToClipboard(generatedLink, 'Link')}
                  title={t('customer.share.btnCopy')}
                  className="bg-white border border-stone-200 text-stone-600 px-4 rounded-xl transition hover:bg-[#FAF6EE]"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EBDFCE] text-left">
                <p className="text-[10px] text-stone-400 mb-1">{t('customer.share.previewLabel')}</p>
                <p className="text-xs text-stone-600 break-all">{generatedLink}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {shareMode === 'excel' && (
        <div className="space-y-6">
          <section className={CARD}>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-stone-300 bg-[#FAF6EE] p-6 text-center transition hover:border-[#E59A59] hover:bg-[#FBF6EE]">
              <FileSpreadsheet className="h-10 w-10 text-[#B4693F]" />
              <span className="mt-2 font-bold text-stone-800">{t('customer.share.excelHeading')}</span>
              <span className="text-xs text-stone-500">
                {t('customer.share.excelSub')}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUploadExcel}
                className="mt-3 block w-full max-w-xs mx-auto text-sm text-stone-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[#E59A59] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#d48b4b]"
              />
            </label>
          </section>

          {/* Contoh format + unduh template CSV */}
          <section className={CARD}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-800">{t('customer.share.csvExampleTitle')}</h3>
                <p className="text-stone-500 text-sm mt-0.5">
                  {t('customer.share.csvExampleSub')}
                </p>
              </div>
              <button
                type="button"
                onClick={downloadExampleCsv}
                className="shrink-0 flex items-center justify-center gap-2 bg-[#712E1E] hover:bg-[#5a2418] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
              >
                <Download size={14} /> {t('customer.share.btnDownloadCsv')}
              </button>
            </div>

            {/* Pratinjau tampilan format */}
            <div className="overflow-hidden rounded-xl border border-[#EBDFCE]">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-[#FAF6EE] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#EBDFCE]">
                  <tr>
                    <th className="px-4 py-2.5">{t('customer.share.thGuestName')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EBDF]">
                  {["Budi & Keluarga", "Rina Dewi", "Keluarga Besar Haji Ahmad"].map((name) => (
                    <tr key={name} className="hover:bg-[#FAF6EE]/60 transition">
                      <td className="px-4 py-2.5">{name}</td>
                    </tr>
                  ))}
                  <tr className="text-stone-400 italic">
                    <td className="px-4 py-2.5">…dst.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
              <li>{t('customer.share.csvTip1')}</li>
              <li>{t('customer.share.csvTip2')}</li>
            </ul>
          </section>

          {excelGuests.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAF6EE] border-b border-[#EBDFCE] flex justify-between items-center">
                <h3 className="font-bold text-stone-700 text-sm">
                  {t('customer.share.guestListTitle', { count: excelGuests.length })}
                </h3>
                <button
                  onClick={() => setExcelGuests([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  {t('customer.share.btnClearAll')}
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-[#F3EBDF]">
                {excelGuests.map((name, i) => (
                  <div
                    key={i}
                    className="p-3 px-4 flex items-center justify-between hover:bg-[#FAF6EE] transition"
                  >
                    <span className="text-sm font-medium text-stone-800 truncate">
                      {name}
                    </span>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => copyLink(name)}
                        title={t('customer.share.btnCopy')}
                        className="p-1.5 text-stone-400 rounded-xl transition hover:text-[#B4693F] hover:bg-[#FBF6EE]"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleShareWa(name)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                      >
                        <Send size={10} /> {t('customer.share.btnSendWa')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
