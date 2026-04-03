import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { getPredictionHistory } from "../../api/AdminPredictAPI";

export default function AdminPredictHistoryModal({ open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPredictionHistory(10);
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message || "Failed to load prediction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
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

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">Loading history...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No prediction history yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {history.map((item, index) => (
              <div
                key={item.id || `${item.file_name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5"
              >
                <div className="rounded-lg bg-[#003B95]/10 p-2">
                  <FileText className="h-4 w-4 text-[#003B95]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {item.file_name}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Total: {item.total_rows} • Predicted: {item.predicted_rows} • Failed: {item.failed_rows}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "No date"}
                  </p>

                  {(item.model_name || item.accuracy || item.f1 || item.recall) && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Model: {item.model_name || "-"}
                      {item.accuracy !== null && item.accuracy !== undefined
                        ? ` • Accuracy: ${item.accuracy}`
                        : ""}
                      {item.f1 !== null && item.f1 !== undefined
                        ? ` • F1: ${item.f1}`
                        : ""}
                      {item.recall !== null && item.recall !== undefined
                        ? ` • Recall: ${item.recall}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}