import React from "react";

export default function RegionalDataCards({
  loading,
  error,
  currentData,
  PovertyBadge,
  highlightText,
  search,
}) {
  return (
    <div className="space-y-4 md:hidden">
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Loading data...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 shadow-sm">
          {error}
        </div>
      ) : currentData.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No data available
        </div>
      ) : (
        currentData.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Regional Record
                  </p>
                  <h3 className="mt-1 text-base font-bold leading-tight text-[#003B95]">
                    {highlightText(item.region_name, search)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Year:{" "}
                    <span className="font-semibold text-slate-800">
                      {highlightText(item.year, search)}
                    </span>
                  </p>
                </div>

                <div className="shrink-0">
                  <PovertyBadge level={item.poverty_level} />
                </div>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Unemployment Rate
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {highlightText(
                      `${Number(item.unemployment_rate).toFixed(1)}%`,
                      search
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Average Income
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {highlightText(
                      Number(item.ave_income).toLocaleString(),
                      search
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Expenditure
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {highlightText(
                      Number(item.expenditure).toLocaleString(),
                      search
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Mean Years of Education
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {highlightText(
                      Number(item.mean_years_education).toFixed(2),
                      search
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:col-span-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Population Size
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {highlightText(
                      Number(item.population_size).toLocaleString(),
                      search
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}