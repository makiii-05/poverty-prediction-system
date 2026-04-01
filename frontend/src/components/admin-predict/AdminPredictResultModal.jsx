import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  formatMetric,
  getLevelBadge,
} from "../../utils/adminPredictHelpers";

export default function AdminPredictResultModal({
  open,
  result,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[18px] bg-white p-3.5 shadow-2xl sm:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Prediction Result
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Bulk prediction summary and model information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!result ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No prediction result yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-[10px] text-slate-500">File Name</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-900">
                  {result.fileName}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-[10px] text-slate-500">Total Rows</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {result.totalRows}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-[10px] text-slate-500">Predicted Rows</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {result.predictedRows}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                <p className="text-[10px] text-slate-500">ML Model</p>
                <p className="mt-1 text-[11px] font-bold text-slate-900">
                  {formatMetric(result.modelInfo?.model_name)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                <p className="text-[10px] text-slate-500">Accuracy</p>
                <p className="mt-1 text-[11px] font-bold text-slate-900">
                  {formatMetric(result.modelInfo?.accuracy)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                <p className="text-[10px] text-slate-500">F1 Score</p>
                <p className="mt-1 text-[11px] font-bold text-slate-900">
                  {formatMetric(result.modelInfo?.f1)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                <p className="text-[10px] text-slate-500">Recall</p>
                <p className="mt-1 text-[11px] font-bold text-slate-900">
                  {formatMetric(result.modelInfo?.recall)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <p className="mb-1.5 text-xs font-semibold text-slate-700">
                Confusion Matrix
              </p>
              <pre className="overflow-x-auto rounded-md bg-white p-2.5 text-[11px] text-slate-700">
                {formatMetric(result.modelInfo?.confusion_matrix)}
              </pre>
            </div>

            {result.failedRows > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-800">
                      Some rows could not be predicted
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-700">
                      Failed rows: {result.failedRows}
                    </p>

                    <div className="mt-2 max-h-24 space-y-1 overflow-auto">
                      {result.errors.map((item) => (
                        <div
                          key={`error-${item.row_index}`}
                          className="rounded-md bg-white px-2 py-1.5 text-[11px] text-slate-700"
                        >
                          Row {item.row_index}: {item.error}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-2.5 py-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  Predicted Rows
                </h3>
              </div>

              <div className="max-h-[180px] overflow-auto">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="px-2.5 py-2 font-semibold">Row</th>
                      <th className="px-2.5 py-2 font-semibold">Region</th>
                      <th className="px-2.5 py-2 font-semibold">Year</th>
                      <th className="px-2.5 py-2 font-semibold">
                        Poverty Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={`row-${row.row_index}-${row.region}-${row.year}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-2.5 py-2 text-slate-700">
                          {row.row_index}
                        </td>
                        <td className="px-2.5 py-2 text-slate-700">
                          {row.region}
                        </td>
                        <td className="px-2.5 py-2 text-slate-700">
                          {row.year}
                        </td>
                        <td className="px-2.5 py-2">
                          <span
                            className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getLevelBadge(
                              row.poverty_level
                            )}`}
                          >
                            {row.poverty_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-green-800">
                    Ready to save
                  </p>
                  <p className="mt-0.5 text-[11px] text-green-700">
                    Review the predictions, then click “Save to Database”.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}