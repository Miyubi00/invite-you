// ============================================================
// src/components/customer/EditTab.tsx
// ------------------------------------------------------------
// Tab "Edit Konten" dashboard mempelai: komposisi sub-tab tematik yang membungkus section cards form.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : components/shared/form/*, hooks/useEditActions, types/database
// ============================================================

// Tab "Edit Konten" Dashboard mempelai: komposisi sub-tab tematik.
// Kartu form & primitif bersama ada di src/components/shared/form/*,
// aksi hapus/tambah ada di hooks/useEditActions.

import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Camera, CreditCard, Loader2, MapPin, Save } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import { SubTabButton, LightboxPreview, type PreviewImage } from "../shared/form/FormKit";
import {
  LocationCard,
  FamilyCard,
  PhotosCard,
  GalleryCard,
  MusicQuoteCard,
  BanksCard,
} from "../shared/form/SectionCards";
import { useEditActions } from "../../hooks/useEditActions";
import type { EventDetails } from "../../types/database";
import type { DashboardForm } from "../../hooks/useDashboardData";
import { useTranslation } from "../../i18n";

interface EditTabProps {
  formData: DashboardForm;
  setFormData: Dispatch<SetStateAction<DashboardForm>>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleSaveData: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  uploading: boolean;
  activeUploadField: string | null;
  handleFileUpload: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof EventDetails,
    isGallery?: boolean,
  ) => void;
  /** Dipakai untuk pembersihan objek R2 saat foto galeri dihapus. */
  orderId?: string;
  /** Sedang konversi WebM setelah musik dipilih. */
  converting?: boolean;
  /** Progres konversi dalam persen. */
  convertPercent?: number | null;
  /** Sedang menghapus musik (DB + bucket). */
  removing?: boolean;
  onRemoveMusic?: () => Promise<void> | void;
}

type SubSection = "info" | "media" | "extra";

export default function EditTab({
  formData,
  setFormData,
  handleChange,
  handleSaveData,
  loading,
  uploading,
  activeUploadField,
  handleFileUpload,
  orderId,
  converting,
  convertPercent,
  removing,
  onRemoveMusic,
}: EditTabProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SubSection>("info");
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const {
    confirmData,
    closeConfirm,
    requestRemovePhoto,
    requestRemoveGallery,
    requestRemoveBank,
    addBank,
    updateBank,
  } = useEditActions(setFormData, { orderId, getData: () => formData });

  const openPreview = (url: string, title: string) => setPreviewImage({ url, title });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <form onSubmit={handleSaveData} className="w-full pb-10">
        {/* Header Tab */}
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{t('customer.edit.title')}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {t('customer.edit.desc')}
          </p>
        </div>

        {/* Sub-Tab Navigation (Pills) */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-[#EBDFCE] bg-[#FAF6EE] p-1.5 w-fit">
          <SubTabButton active={activeSection === "info"} onClick={() => setActiveSection("info")}>
            <MapPin size={15} />
            <span>{t('customer.edit.tabDetails')}</span>
          </SubTabButton>

          <SubTabButton active={activeSection === "media"} onClick={() => setActiveSection("media")}>
            <Camera size={15} />
            <span>{t('customer.edit.tabMedia')}</span>
          </SubTabButton>

          <SubTabButton active={activeSection === "extra"} onClick={() => setActiveSection("extra")}>
            <CreditCard size={15} />
            <span>{t('customer.edit.tabExtra')}</span>
          </SubTabButton>
        </div>

        {/* Konten Form Per Sub-Tab */}
        <div className="mt-6">
          {activeSection === "info" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <LocationCard data={formData} handleChange={handleChange} />
              <FamilyCard data={formData} handleChange={handleChange} />
            </div>
          )}

          {activeSection === "media" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <PhotosCard
                data={formData}
                activeUploadField={activeUploadField}
                isUploading={uploading}
                handleFileUpload={handleFileUpload}
                onPreview={openPreview}
                onRemovePhoto={requestRemovePhoto}
              />
              <GalleryCard
                gallery={formData.gallery}
                isUploading={uploading && activeUploadField === "gallery"}
                handleFileUpload={handleFileUpload}
                onRequestRemove={requestRemoveGallery}
                onPreview={openPreview}
              />
            </div>
          )}

          {activeSection === "extra" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <MusicQuoteCard
                data={formData}
                handleChange={handleChange}
                handleFileUpload={handleFileUpload}
                uploading={uploading}
                activeUploadField={activeUploadField}
                converting={converting}
                convertPercent={convertPercent}
                removing={removing}
                onRemoveMusic={onRemoveMusic}
              />
              <BanksCard
                banks={formData.banks}
                onAdd={addBank}
                onUpdate={updateBank}
                onRequestRemove={requestRemoveBank}
              />
            </div>
          )}

          {/* Tombol Simpan Lebar di Bagian Bawah */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E59A59] py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#d48b4b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
              {loading ? t('customer.edit.btnSaving') : t('customer.edit.btnSave')}
            </button>
          </div>
        </div>
      </form>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={confirmData.show}
        title={t('customer.edit.confirmDeleteTitle')}
        message={confirmData.message}
        isDanger={true}
        onCancel={closeConfirm}
        onConfirm={confirmData.action ?? undefined}
      />

      {/* Modal Preview Gambar (Lightbox) */}
      <LightboxPreview image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
