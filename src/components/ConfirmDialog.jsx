import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 transform scale-100 transition-all">
        
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
            ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-6 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition transform hover:-translate-y-1
              ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Ya, Lanjutkan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}