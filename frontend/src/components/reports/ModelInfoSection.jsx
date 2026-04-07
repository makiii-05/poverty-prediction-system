function SummaryItem({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function formatMetric(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${(num * 100).toFixed(2)}%`;
}

export default function ModelInfoSection({ metrics, metricsLoading }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Model Info</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admin-only model performance summary
        </p>
      </div>

      {metricsLoading ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Loading model info...
        </div>
      ) : !metrics ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No model metrics available.
        </div>
      ) : (
        <div className="space-y-4">
          <SummaryItem
            label="Model"
            value={metrics.model_name || "-"}
            valueClass="text-[#003B95]"
          />
          <SummaryItem
            label="Accuracy"
            value={formatMetric(metrics.accuracy)}
            valueClass="text-green-700"
          />
          <SummaryItem
            label="F1 Weighted"
            value={formatMetric(metrics.f1_weighted)}
            valueClass="text-blue-700"
          />
          <SummaryItem
            label="F1 Macro"
            value={formatMetric(metrics.f1_macro)}
            valueClass="text-yellow-700"
          />

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Confusion Matrix
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full">
                <tbody>
                  {(metrics.confusion_matrix || []).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Rows represent actual classes, while columns represent predicted classes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}