import { PovertyBadge, highlightText } from "../../utils/povertyBadgeUtils";

export default function DataMonitoringCards({
  loading,
  error,
  currentData,
  search,
  onDelete,
}) {
  return (
    <div className="mb-4 grid gap-3 md:hidden">
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
          Loading data...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 shadow-sm">
          {error}
        </div>
      ) : currentData.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
          No data found.
        </div>
      ) : (
        currentData.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {highlightText(item.region_name || item.region, search)}
                </h3>
                <p className="text-xs text-slate-500">
                  Year: {highlightText(item.year, search)}
                </p>
              </div>
              <PovertyBadge level={item.poverty_level} search={search} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold">Income:</span>{" "}
                {highlightText(item.ave_income, search)}
              </div>
              <div>
                <span className="font-semibold">Expenditure:</span>{" "}
                {highlightText(item.expenditure, search)}
              </div>
              <div>
                <span className="font-semibold">Unemployment:</span>{" "}
                {highlightText(item.unemployment_rate, search)}
              </div>
              <div>
                <span className="font-semibold">Education:</span>{" "}
                {highlightText(item.mean_years_education, search)}
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Population:</span>{" "}
                {highlightText(item.population_size, search)}
              </div>
            </div>

            <button
              onClick={() => onDelete(item)}
              className="mt-4 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}