// ============================================================
// src/components/shared/form/FormKit.tsx
// ------------------------------------------------------------
// Primitif form bersama: CardHeader, SubTabButton, TextField, DateField, BankInput, PhotoPicker, LightboxPreview.
// Dipakai di  : EditOrderModal (admin), EditTab (customer), SectionCards
// Keterikatan : ./ui (design token), lucide-react
// ============================================================

// Primitif form bersama untuk Dashboard mempelai dan Admin Panel:
// CardHeader, SubTabButton, TextField, DateField, BankInput, PhotoPicker,
// dan LightboxPreview. Dipakai oleh EditTab & EditOrderModal.

import type { ChangeEvent, ReactNode } from "react";
import { Camera, Eye, Loader2, Trash2, X } from "lucide-react";
import { CARD_TITLE, FIELD_LABEL, ICON_CHIP, INPUT } from "./ui";

const INPUT_CLASS = `${INPUT} mt-1`;

export interface PreviewImage {
  url: string;
  title: string;
}

export function CardHeader({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${CARD_TITLE} border-b border-[#F3EBDF] pb-3`}>
      <span className={ICON_CHIP}>{icon}</span>
      <span className="flex-1">{title}</span>
      {action}
    </div>
  );
}

export function SubTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
        active ? "bg-white text-[#712E1E] shadow-sm" : "text-stone-500 hover:text-stone-800"
      }`}
    >
      {children}
    </button>
  );
}

type FieldChange = (e: ChangeEvent<HTMLInputElement>) => void;

export function TextField({
  label,
  name,
  value,
  handleChange,
  placeholder,
  centered = false,
}: {
  label: string;
  name: string;
  value: string | undefined;
  handleChange: FieldChange;
  placeholder?: string;
  centered?: boolean;
}) {
  return (
    <div>
      <label className={FIELD_LABEL}>{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={handleChange}
        className={`${INPUT_CLASS} ${centered ? "text-center" : ""}`}
        placeholder={placeholder}
      />
    </div>
  );
}

export function DateField({
  label,
  name,
  value,
  handleChange,
}: {
  label: string;
  name: string;
  value: string | undefined;
  handleChange: FieldChange;
}) {
  return (
    <div>
      <label className={FIELD_LABEL}>{label}</label>
      <input
        type="date"
        name={name}
        value={value || ""}
        onChange={handleChange}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export function BankInput({
  value,
  onChange,
  placeholder,
  mono = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-b border-dashed border-stone-300 bg-transparent p-1 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:border-[#E59A59] ${mono ? "font-mono" : ""}`}
      placeholder={placeholder}
    />
  );
}

export function PhotoPicker({
  label,
  src,
  alt,
  uploading,
  onPick,
  onPreview,
  onRemove,
}: {
  label: string;
  src: string | undefined;
  alt: string;
  uploading: boolean;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#EBDFCE] bg-[#FAF6EE]/50 p-3.5 transition hover:bg-[#FAF6EE]">
      <div className="group relative block aspect-square w-full max-w-[150px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-black/50 opacity-0 transition duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={onPreview}
                title="Lihat Foto"
                className="grid h-8 w-8 place-items-center rounded-xl bg-white/25 text-white backdrop-blur-sm transition hover:bg-white/40 hover:scale-110 active:scale-95"
              >
                <Eye size={15} />
              </button>
              <button
                type="button"
                onClick={onRemove}
                title="Hapus Foto"
                className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/80 text-white backdrop-blur-sm transition hover:bg-rose-600 hover:scale-110 active:scale-95"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5 text-stone-400 transition hover:bg-stone-50">
            <Camera size={26} />
            <span className="text-[11px] font-semibold">Pilih Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={onPick}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}

        {uploading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black/50 backdrop-blur-sm">
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-stone-800">{label}</p>
        <label className="mt-0.5 inline-block cursor-pointer text-[11px] font-semibold text-[#E59A59] transition hover:text-[#d48b4b] hover:underline">
          {src ? "Ganti Foto" : "Upload Foto"}
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

export function LightboxPreview({
  image,
  onClose,
}: {
  image: PreviewImage | null;
  onClose: () => void;
}) {
  if (!image) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-2xl flex-col items-center overflow-hidden rounded-2xl bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between border-b border-stone-100 pb-2 px-2">
          <span className="text-xs font-bold text-stone-700">{image.title}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-2 flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-stone-50">
          <img
            src={image.url}
            alt={image.title}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
