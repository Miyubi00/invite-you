// ============================================================
// src/components/shared/form/SectionCards.tsx
// ------------------------------------------------------------
// Kartu-kartu section form bersama: Lokasi, Keluarga, Foto, Galeri, Musik & Kutipan, Rekening - data generik EventDetails.
// Dipakai di  : EditOrderModal (admin), EditTab (customer)
// Keterikatan : ./FormKit, ./ui, types/database, hooks/useEditActions (PhotoField)
// ============================================================

import type { ChangeEvent } from "react";
import {
  Camera,
  CreditCard,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  Music,
  Trash2,
  Users,
} from "lucide-react";
import { CARD, FIELD_LABEL, INPUT } from "./ui";
import {
  BankInput,
  CardHeader,
  DateField,
  PhotoPicker,
  TextField,
} from "./FormKit";
import type { BankAccount, EventDetails } from "../../../types/database";
import type { PhotoField } from "../../../hooks/useEditActions";
import { useTranslation } from "../../../i18n";

export type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

type UploadHandler = (
  e: ChangeEvent<HTMLInputElement>,
  fieldName: keyof EventDetails,
  isGallery?: boolean,
) => void;

interface DataCardProps {
  data: Partial<EventDetails>;
  handleChange: (e: FieldChangeEvent) => void;
}

/* ------------------------------ Lokasi & Waktu ----------------------------- */

export function LocationCard({ data, handleChange }: DataCardProps) {
  const { t } = useTranslation();

  return (
    <section className={CARD}>
      <CardHeader icon={<MapPin size={16} />} title={t('customer.edit.cardLocation')} />
      <input
        name="venue_name"
        value={data.venue_name || ""}
        onChange={handleChange}
        className={INPUT}
        placeholder={t('customer.edit.venueName')}
      />
      <textarea
        name="venue_address"
        value={data.venue_address || ""}
        onChange={handleChange}
        className={`${INPUT} h-24 resize-none`}
        placeholder={t('customer.edit.venueAddress')}
      />
      <input
        name="maps_link"
        value={data.maps_link || ""}
        onChange={handleChange}
        className={INPUT}
        placeholder={t('customer.edit.mapsLink')}
      />
      <div className="grid grid-cols-2 gap-3">
        <DateField
          label={t('customer.edit.akadDate')}
          name="akad_date"
          value={data.akad_date}
          handleChange={handleChange}
        />
        <DateField
          label={t('customer.edit.resepsiDate')}
          name="resepsi_date"
          value={data.resepsi_date}
          handleChange={handleChange}
        />
      </div>
      <p className="-mt-3 text-xs italic text-stone-400">
        {t('customer.edit.dateHint')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t('customer.edit.akadTime')}
          name="akad_time"
          value={data.akad_time}
          handleChange={handleChange}
          placeholder="08:00 WIB"
          centered
        />
        <TextField
          label={t('customer.edit.resepsiTime')}
          name="resepsi_time"
          value={data.resepsi_time}
          handleChange={handleChange}
          placeholder="11:00 WIB"
          centered
        />
      </div>
    </section>
  );
}

/* ------------------------------- Keluarga ---------------------------------- */

export function FamilyCard({ data, handleChange }: DataCardProps) {
  const { t } = useTranslation();

  return (
    <section className={CARD}>
      <CardHeader icon={<Users size={16} />} title={t('customer.edit.cardFamily')} />
      <TextField
        label={t('customer.edit.groomParents')}
        name="groom_parents"
        value={data.groom_parents}
        handleChange={handleChange}
        placeholder={t('customer.edit.parentsPlaceholder')}
      />
      <TextField
        label={t('customer.edit.brideParents')}
        name="bride_parents"
        value={data.bride_parents}
        handleChange={handleChange}
        placeholder={t('customer.edit.parentsPlaceholder')}
      />
    </section>
  );
}

/* --------------------------- Foto Mempelai & Cover -------------------------- */

export function PhotosCard({
  data,
  activeUploadField,
  isUploading,
  handleFileUpload,
  onPreview,
  onRemovePhoto,
}: {
  data: Partial<EventDetails>;
  activeUploadField: string | null;
  isUploading: boolean;
  handleFileUpload: UploadHandler;
  onPreview: (url: string, title: string) => void;
  onRemovePhoto: (field: PhotoField, label: string) => void;
}) {
  const { t } = useTranslation();
  const isGroomUploading = isUploading && activeUploadField === "groom_photo";
  const isBrideUploading = isUploading && activeUploadField === "bride_photo";
  const isCoverUploading = isUploading && activeUploadField === "cover_photo";

  return (
    <section className={CARD}>
      <CardHeader icon={<Camera size={16} />} title={t('customer.edit.cardPhotos')} />

      <div className="grid grid-cols-2 gap-4">
        <PhotoPicker
          label={t('customer.edit.groomPhoto')}
          src={data.groom_photo}
          alt={t('customer.edit.groomPhoto')}
          uploading={isGroomUploading}
          onPick={(e) => handleFileUpload(e, "groom_photo")}
          onPreview={() =>
            data.groom_photo &&
            onPreview(data.groom_photo, t('customer.edit.groomPhoto'))
          }
          onRemove={() => onRemovePhoto("groom_photo", t('customer.edit.groomPhoto'))}
        />
        <PhotoPicker
          label={t('customer.edit.bridePhoto')}
          src={data.bride_photo}
          alt={t('customer.edit.bridePhoto')}
          uploading={isBrideUploading}
          onPick={(e) => handleFileUpload(e, "bride_photo")}
          onPreview={() =>
            data.bride_photo &&
            onPreview(data.bride_photo, t('customer.edit.bridePhoto'))
          }
          onRemove={() => onRemovePhoto("bride_photo", t('customer.edit.bridePhoto'))}
        />
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className={FIELD_LABEL}>{t('customer.edit.coverBanner')}</span>
          {data.cover_photo && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  data.cover_photo &&
                  onPreview(data.cover_photo, t('customer.edit.coverBanner'))
                }
                className="flex items-center gap-1 text-xs font-semibold text-[#712E1E] transition hover:underline"
              >
                <Eye size={13} /> {t('common.view')}
              </button>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={() => onRemovePhoto("cover_photo", t('customer.edit.coverBanner'))}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:underline"
              >
                <Trash2 size={13} /> {t('common.delete')}
              </button>
            </div>
          )}
        </div>

        <div className="group relative flex h-40 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-[#FAF6EE] transition hover:border-[#E59A59]">
          {data.cover_photo ? (
            <>
              <img
                src={data.cover_photo}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                alt="Cover"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-stone-400">
              <Camera size={26} />
              <span className="text-xs font-medium">
                {t('customer.edit.noCover')}
              </span>
            </div>
          )}

          <label className="relative z-10 cursor-pointer rounded-xl bg-white/90 px-4 py-2 text-xs font-bold text-stone-700 shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white active:scale-95">
            {data.cover_photo ? t('customer.edit.btnChangeCover') : t('customer.edit.btnUploadCover')}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "cover_photo")}
              className="hidden"
              disabled={isCoverUploading}
            />
          </label>

          {isCoverUploading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/50 backdrop-blur-sm">
              <Loader2 size={26} className="animate-spin text-white" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Galeri ----------------------------------- */

export function GalleryCard({
  gallery,
  isUploading,
  handleFileUpload,
  onRequestRemove,
  onPreview,
}: {
  gallery: string[];
  isUploading: boolean;
  handleFileUpload: UploadHandler;
  onRequestRemove: (index: number) => void;
  onPreview: (url: string, title: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className={CARD}>
      <CardHeader
        icon={<ImagePlus size={16} />}
        title={t('customer.edit.cardGallery')}
        action={
          <span className="text-xs font-semibold text-stone-400">
            {t('customer.edit.galleryCount', { count: gallery.length })}
          </span>
        }
      />

      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-[#FAF6EE]/50 py-4 text-sm font-bold text-stone-600 transition hover:border-[#E59A59] hover:bg-[#FAF6EE] hover:text-[#B4693F] active:scale-[0.99]">
        {isUploading ? (
          <Loader2 size={18} className="animate-spin text-[#E59A59]" />
        ) : (
          <ImagePlus size={18} />
        )}
        <span>
          {isUploading ? t('customer.edit.btnUploadingGallery') : t('customer.edit.btnUploadGallery')}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e, "gallery", true)}
          className="hidden"
          disabled={isUploading}
        />
      </label>

      {gallery.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 py-10 text-center text-xs italic text-stone-400">
          {t('customer.edit.galleryEmpty')}
        </div>
      ) : (
        <div className="grid max-h-[380px] grid-cols-3 gap-3 overflow-y-auto pr-1">
          {gallery.map((url, idx) => (
            <div
              key={url || idx}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[#EBDFCE] bg-stone-100 shadow-sm"
            >
              <img
                src={url}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                alt={`Gallery ${idx + 1}`}
              />

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onPreview(url, `Foto Galeri #${idx + 1}`)}
                  title={t('common.view')}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/25 text-white backdrop-blur-sm transition hover:bg-white/40 hover:scale-110 active:scale-95"
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onRequestRemove(idx)}
                  title={t('common.delete')}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/80 text-white backdrop-blur-sm transition hover:bg-rose-600 hover:scale-110 active:scale-95"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ Musik & Kutipan ----------------------------- */

export function MusicQuoteCard({
  data,
  handleChange,
  handleFileUpload,
  converting = false,
  convertPercent = null,
  removing = false,
  onRemoveMusic,
}: {
  data: Partial<EventDetails>;
  handleChange: (e: FieldChangeEvent) => void;
  handleFileUpload: UploadHandler;
  converting?: boolean;
  convertPercent?: number | null;
  removing?: boolean;
  onRemoveMusic?: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const hasMusic = Boolean(data.audio_url);
  const busy = converting || removing;

  const statusText = converting
    ? t('customer.edit.musicConverting', { percent: convertPercent ?? 0 })
    : removing
      ? t('customer.edit.musicRemoving')
      : hasMusic
        ? t('customer.edit.musicInstalled')
        : t('customer.edit.musicNone');

  return (
    <section className={CARD}>
      <CardHeader icon={<Music size={16} />} title={t('customer.edit.cardMusicQuote')} />
      <div className="flex items-center gap-3 rounded-xl border border-[#EBDFCE] bg-[#FAF6EF] p-3">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${converting || removing ? 'text-stone-400 italic' : 'text-stone-700'}`}>
            {statusText}
          </p>
          {hasMusic && !removing && (
            <audio controls src={data.audio_url} className="mt-1 h-8 w-full" />
          )}
        </div>

        {hasMusic ? (
          onRemoveMusic && (
            <button
              type="button"
              onClick={() => void onRemoveMusic()}
              disabled={busy}
              title={t('common.delete')}
              className="shrink-0 cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
            >
              {removing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> {t('customer.edit.btnRemovingMusic') || t('common.loading')}
                </>
              ) : (
                <>
                  <Trash2 size={13} /> {t('common.delete')}
                </>
              )}
            </button>
          )
        ) : (
          <label
            className={`shrink-0 cursor-pointer rounded-xl bg-[#E59A59] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#d48b4b] flex items-center gap-1.5 ${
              converting ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {converting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> {t('customer.edit.btnConvertingMusic')}
              </>
            ) : (
              t('customer.edit.btnUploadMusic')
            )}
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileUpload(e, "audio_url")}
              className="hidden"
              disabled={converting}
            />
          </label>
        )}
      </div>
      <div className="space-y-1">
        <label className={FIELD_LABEL}>{t('customer.edit.quoteLabel')}</label>
        <textarea
          name="quote"
          value={data.quote || ""}
          onChange={handleChange}
          className={`${INPUT} h-20 resize-none`}
          placeholder={t('customer.edit.quotePlaceholder')}
        />
        <input
          name="quote_src"
          value={data.quote_src || ""}
          onChange={handleChange}
          className={`${INPUT} mt-2`}
          placeholder={t('customer.edit.quoteSrcPlaceholder')}
        />
      </div>
    </section>
  );
}

/* -------------------------------- Rekening --------------------------------- */

export function BanksCard({
  banks,
  onAdd,
  onUpdate,
  onRequestRemove,
}: {
  banks: BankAccount[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof BankAccount, value: string) => void;
  onRequestRemove: (index: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className={CARD}>
      <CardHeader
        icon={<CreditCard size={16} />}
        title={t('customer.edit.cardBanks')}
        action={
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-[#712E1E] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-[#8a4030]"
          >
            {t('customer.edit.btnAddBank')}
          </button>
        }
      />
      {banks.length === 0 && (
        <p className="text-xs italic text-stone-400 py-2">
          {t('customer.edit.banksEmpty')}
        </p>
      )}
      {banks.map((bank, idx) => (
        <div
          key={idx}
          className="relative rounded-xl border border-[#EBDFCE] bg-[#FAF6EF] p-3 pr-9"
        >
          <button
            type="button"
            onClick={() => onRequestRemove(idx)}
            className="absolute right-2.5 top-2.5 text-stone-300 transition hover:text-rose-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="grid grid-cols-3 gap-2">
            <BankInput
              value={bank.bank}
              onChange={(v) => onUpdate(idx, "bank", v)}
              placeholder={t('customer.edit.bankNamePlaceholder')}
            />
            <BankInput
              value={bank.number}
              onChange={(v) => onUpdate(idx, "number", v)}
              placeholder={t('customer.edit.bankNumberPlaceholder')}
              mono
            />
            <BankInput
              value={bank.name}
              onChange={(v) => onUpdate(idx, "name", v)}
              placeholder={t('customer.edit.bankOwnerPlaceholder')}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
