// ============================================================
// src/components/shared/form/SectionCards.tsx
// ------------------------------------------------------------
// Kartu-kartu section form bersama: Lokasi, Keluarga, Foto, Galeri, Musik & Kutipan, Rekening - data generik EventDetails.
// Dipakai di  : EditOrderModal (admin), EditTab (customer)
// Keterikatan : ./FormKit, ./ui, types/database, hooks/useEditActions (PhotoField)
// ============================================================

// Kartu-kartu section form bersama (Lokasi, Keluarga, Foto, Galeri,
// Musik & Kutipan, Rekening) untuk Dashboard mempelai dan Admin Panel.
// Menerima data generik ber-shape EventDetails + handler perubahan.

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
  return (
    <section className={CARD}>
      <CardHeader icon={<MapPin size={16} />} title="Lokasi & Waktu" />
      <input
        name="venue_name"
        value={data.venue_name || ""}
        onChange={handleChange}
        className={INPUT}
        placeholder="Nama Gedung / Tempat"
      />
      <textarea
        name="venue_address"
        value={data.venue_address || ""}
        onChange={handleChange}
        className={`${INPUT} h-24 resize-none`}
        placeholder="Alamat Lengkap"
      />
      <input
        name="maps_link"
        value={data.maps_link || ""}
        onChange={handleChange}
        className={INPUT}
        placeholder="Link Google Maps"
      />
      <div className="grid grid-cols-2 gap-3">
        <DateField
          label="Tgl Akad"
          name="akad_date"
          value={data.akad_date}
          handleChange={handleChange}
        />
        <DateField
          label="Tgl Resepsi"
          name="resepsi_date"
          value={data.resepsi_date}
          handleChange={handleChange}
        />
      </div>
      <p className="-mt-3 text-xs italic text-stone-400">
        *Kosongkan = tanggal utama pernikahan
      </p>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Jam Akad"
          name="akad_time"
          value={data.akad_time}
          handleChange={handleChange}
          placeholder="08:00 WIB"
          centered
        />
        <TextField
          label="Jam Resepsi"
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
// Dipakai customer dashboard (EditTab); di admin panel field orang tua
// digabung langsung di bawah masing-masing mempelai (lihat AdminOrderCard).

export function FamilyCard({ data, handleChange }: DataCardProps) {
  return (
    <section className={CARD}>
      <CardHeader icon={<Users size={16} />} title="Data Keluarga" />
      <TextField
        label="Orang Tua Pria"
        name="groom_parents"
        value={data.groom_parents}
        handleChange={handleChange}
        placeholder="Bpk. Fulan & Ibu Fulanah"
      />
      <TextField
        label="Orang Tua Wanita"
        name="bride_parents"
        value={data.bride_parents}
        handleChange={handleChange}
        placeholder="Bpk. Fulan & Ibu Fulanah"
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
  const isGroomUploading = isUploading && activeUploadField === "groom_photo";
  const isBrideUploading = isUploading && activeUploadField === "bride_photo";
  const isCoverUploading = isUploading && activeUploadField === "cover_photo";

  return (
    <section className={CARD}>
      <CardHeader icon={<Camera size={16} />} title="Foto Mempelai & Cover" />

      <div className="grid grid-cols-2 gap-4">
        <PhotoPicker
          label="Mempelai Pria"
          src={data.groom_photo}
          alt="Foto Pria"
          uploading={isGroomUploading}
          onPick={(e) => handleFileUpload(e, "groom_photo")}
          onPreview={() =>
            data.groom_photo &&
            onPreview(data.groom_photo, "Foto Mempelai Pria")
          }
          onRemove={() => onRemovePhoto("groom_photo", "Foto Mempelai Pria")}
        />
        <PhotoPicker
          label="Mempelai Wanita"
          src={data.bride_photo}
          alt="Foto Wanita"
          uploading={isBrideUploading}
          onPick={(e) => handleFileUpload(e, "bride_photo")}
          onPreview={() =>
            data.bride_photo &&
            onPreview(data.bride_photo, "Foto Mempelai Wanita")
          }
          onRemove={() => onRemovePhoto("bride_photo", "Foto Mempelai Wanita")}
        />
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className={FIELD_LABEL}>Foto Sampul (Cover Banner)</span>
          {data.cover_photo && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  data.cover_photo &&
                  onPreview(data.cover_photo, "Foto Sampul (Cover)")
                }
                className="flex items-center gap-1 text-xs font-semibold text-[#712E1E] transition hover:underline"
              >
                <Eye size={13} /> Lihat
              </button>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={() => onRemovePhoto("cover_photo", "Foto Sampul")}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:underline"
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          )}
        </div>

        {/* Tambahkan flex-col & gap-3 pada container di bawah ini */}
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
                Belum ada foto banner cover
              </span>
            </div>
          )}

          <label className="relative z-10 cursor-pointer rounded-xl bg-white/90 px-4 py-2 text-xs font-bold text-stone-700 shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white active:scale-95">
            {data.cover_photo ? "Ganti Banner Cover" : "Upload Banner Cover"}
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
  return (
    <section className={CARD}>
      <CardHeader
        icon={<ImagePlus size={16} />}
        title="Galeri Foto"
        action={
          <span className="text-xs font-semibold text-stone-400">
            {gallery.length} Foto
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
          {isUploading ? "Mengunggah ke Galeri..." : "Upload Foto ke Galeri"}
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
          Belum ada koleksi foto galeri yang diunggah.
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
                  title="Lihat Foto"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/25 text-white backdrop-blur-sm transition hover:bg-white/40 hover:scale-110 active:scale-95"
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onRequestRemove(idx)}
                  title="Hapus Foto"
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
  /** Sedang konversi WebM setelah file dipilih. */
  converting?: boolean;
  /** Progres konversi dalam persen (bila sedang berlangsung). */
  convertPercent?: number | null;
  /** Sedang menghapus musik (DB + bucket). */
  removing?: boolean;
  /** Bila disediakan, tombol Hapus muncul saat musik terpasang. */
  onRemoveMusic?: () => Promise<void> | void;
}) {
  const hasMusic = Boolean(data.audio_url);
  const busy = converting || removing;

  const statusText = converting
    ? `Mengonversi musik${typeof convertPercent === 'number' ? ` ${convertPercent}%` : ''}, harap tunggu...`
    : removing
      ? 'Menghapus musik, harap tunggu...'
      : hasMusic
        ? 'Musik Terpasang'
        : 'Belum ada musik';

  return (
    <section className={CARD}>
      <CardHeader icon={<Music size={16} />} title="Musik & Kutipan" />
      <div className="flex items-center gap-3 rounded-xl border border-[#EBDFCE] bg-[#FAF6EF] p-3">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${converting || removing ? 'text-stone-400 italic' : 'text-stone-700'}`}>
            {statusText}
          </p>
          {hasMusic && !removing && (
            <audio controls src={data.audio_url} className="mt-1 h-8 w-full" />
          )}
        </div>

        {/* Aksi */}
        {hasMusic ? (
          onRemoveMusic && (
            <button
              type="button"
              onClick={() => void onRemoveMusic()}
              disabled={busy}
              title="Hapus musik dari database & storage"
              className="shrink-0 cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
            >
              {removing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={13} /> Hapus
                </>
              )}
            </button>
          )
        ) : (
          <label
            className={`shrink-0 cursor-pointer rounded-lg bg-[#E59A59] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#d48b4b] flex items-center gap-1.5 ${
              converting ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {converting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Mengonversi...
              </>
            ) : (
              'Unggah Musik'
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
        <label className={FIELD_LABEL}>Kutipan Undangan</label>
        <textarea
          name="quote"
          value={data.quote || ""}
          onChange={handleChange}
          className={`${INPUT} h-20 resize-none`}
          placeholder="Tulis kutipan / doa..."
        />
        <input
          name="quote_src"
          value={data.quote_src || ""}
          onChange={handleChange}
          className={`${INPUT} mt-2`}
          placeholder="Sumber (misal: Q.S Ar-Rum: 21)"
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
  return (
    <section className={CARD}>
      <CardHeader
        icon={<CreditCard size={16} />}
        title="Rekening Amplop Digital"
        action={
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-[#712E1E] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-[#8a4030]"
          >
            + Tambah
          </button>
        }
      />
      {banks.length === 0 && (
        <p className="text-xs italic text-stone-400 py-2">
          Belum ada data rekening.
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
              placeholder="Bank"
            />
            <BankInput
              value={bank.number}
              onChange={(v) => onUpdate(idx, "number", v)}
              placeholder="No. Rek"
              mono
            />
            <BankInput
              value={bank.name}
              onChange={(v) => onUpdate(idx, "name", v)}
              placeholder="A/N"
            />
          </div>
        </div>
      ))}
    </section>
  );
}
