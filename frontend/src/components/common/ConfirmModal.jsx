import {AlertCircle} from "lucide-react";

export default function ConfirmModal({
  isOpen,
  message = "Are you sure?",
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* Modal */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
        
        <div className="flex justify-center mb-3">
          <AlertCircle className="h-10 w-10 text-[#003B95]" />
        </div>

        <p className="text-[16px] text-slate-700">
          {message}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          
          {/* Cancel */}
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {cancelText}
          </button>

          {/* OK */}
          <button
            onClick={onConfirm}
            className="rounded-xl bg-[#003B95] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002766]"
          >
            {confirmText}
          </button>

        </div>
      </div>
    </div>
  );
}