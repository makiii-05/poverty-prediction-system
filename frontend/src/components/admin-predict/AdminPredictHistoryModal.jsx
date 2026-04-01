import { X, FileText } from "lucide-react";

export default function AdminPredictHistoryModal({
  open,
  history,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Prediction History
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Recently predicted uploaded files
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No prediction history yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">

            {history.map((item, index) => (
              <div
                key={`${item.fileName}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5"
              >
                <div className="rounded-lg bg-[#003B95]/10 p-2">
                  <FileText className="h-4 w-4 text-[#003B95]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {item.fileName}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Total: {item.totalRows} • Predicted: {item.predictedRows} • Failed: {item.failedRows}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {item.createdAt}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}