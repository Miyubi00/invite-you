import { MessageSquare, Send, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { RsvpRow } from "../../types/database";
import { useTranslation } from "../../i18n";

interface RsvpReplyModalProps {
  rsvp: RsvpRow;
  replyText: Record<string, string>;
  setReplyText: Dispatch<SetStateAction<Record<string, string>>>;
  onClose: () => void;
  onSubmit: (rsvpId: string) => void;
}

export default function RsvpReplyModal({
  rsvp,
  replyText,
  setReplyText,
  onClose,
  onSubmit,
}: RsvpReplyModalProps) {
  const { t } = useTranslation();

  return (
    <div className="z-50 flex p-4 bg-black/50 fixed inset-0 items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex pb-3 border-b border-stone-100 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#E59A59]" />
            <h3 className="font-bold text-stone-800">
              {rsvp.reply ? t('customer.rsvp.modalEditTitle') : t('customer.rsvp.modalTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 rounded-xl hover:bg-stone-100 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pesan Tamu (Referensi) */}
        <div className="mt-4 p-3 text-xs bg-[#FAF6EE] rounded-xl border border-[#EBDFCE]">
          <span className="font-bold text-stone-700">{rsvp.guest_name}:</span>
          <p className="mt-1 text-stone-600 italic">"{rsvp.message}"</p>
        </div>

        {/* Textarea Balasan */}
        <div className="mt-4">
          <label className="block mb-1.5 text-xs font-bold text-stone-700">
            {t('customer.rsvp.modalLabel')}
          </label>
          <textarea
            rows={4}
            value={replyText[rsvp.id] || ""}
            onChange={(e) =>
              setReplyText((prev) => ({ ...prev, [rsvp.id]: e.target.value }))
            }
            placeholder={t('customer.rsvp.modalPlaceholder')}
            className="w-full p-3 text-xs rounded-xl border border-stone-200 resize-none outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20"
          />
        </div>

        {/* Tombol Aksi Modal */}
        <div className="flex mt-5 justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-500 rounded-xl hover:bg-stone-100"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(rsvp.id)}
            className="flex px-4 py-2 text-xs font-bold text-white bg-[#E59A59] rounded-xl shadow-sm items-center gap-1.5 transition hover:bg-[#d48b4b] active:scale-95"
          >
            <Send size={13} />
            <span>{t('customer.rsvp.modalBtnSend')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
