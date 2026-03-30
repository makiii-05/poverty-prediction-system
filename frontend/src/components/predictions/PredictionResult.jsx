import { BarChart3 } from "lucide-react";

export default function PredictionResult({
  result,
  region,
  onShowVisualization,
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

  return (
    <div className="lg:col-span-1">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-800">Prediction Result</h2>
        <p className="mt-1 text-sm text-slate-500">
          The predicted poverty level will appear here after submitting the
          form.
        </p>

        <div className="mt-6">
          {result ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-500">
                Predicted Poverty Level
              </p>

              <div
                className={`mt-4 inline-flex rounded-full border px-5 py-2 text-sm font-bold ${getBadgeStyle(
                  result
                )}`}
              >
                {result}
              </div>

              <div className="mt-5 text-left">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Selected Region
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {region || "-"}
                </p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={onShowVisualization}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002F7A]"
                >
                  <BarChart3 className="h-4 w-4" />
                  See Visualization
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No prediction yet.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#003B95]">
            Note
          </p>
          <p className="mt-2 text-sm text-slate-600">
            This module is for user testing only. Predictions shown here are not
            stored in the database.
          </p>
        </div>
      </div>
    </div>
  );
}