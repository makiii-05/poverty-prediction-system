import { X, BarChart3 } from "lucide-react";

export default function VisualizationModal({
  data,
  result,
  formData,
  onClose,
}) {
  const getBadgeStyle = (level) => {
    if (level === "Low") {
      return "border-green-200 bg-green-50 text-green-700";
    }
    if (level === "Moderate") {
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }
    if (level === "High") {
      return "border-red-200 bg-red-50 text-red-700";
    }
    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  const getPercent = (value, max) => {
    const num = Number(value || 0);
    if (!num || num < 0) return 0;
    return Math.min((num / max) * 100, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#003B95]/10 p-2 text-[#003B95]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Visualization</h2>
              <p className="text-sm text-slate-500">
                Quick view of the entered indicators.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {data.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  {item.label}
                </p>
                <span className="text-sm text-slate-500">{item.value}</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#003B95]"
                  style={{ width: `${getPercent(item.value, item.max)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Region
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formData.region || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Year
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formData.year || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Predicted Level
              </p>
              <div className="mt-2">
                {result ? (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getBadgeStyle(
                      result
                    )}`}
                  >
                    {result}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">-</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#003B95]">
              Note
            </p>
            <p className="mt-2 text-sm text-slate-600">
              This visualization is based only on the values you entered for
              testing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}