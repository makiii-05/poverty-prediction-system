import React from "react";

export default function RegionalDataTable({
  loading,
  error,
  currentData,
  startIndex,
  endIndex,
  searchedData,
  totalPages,
  currentPage,
  setCurrentPage,
  PovertyBadge,
  highlightText,
  search,
}) {
  return (
    <div className="hidden md:block">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-[500px] overflow-y-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Region
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Year
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-normal leading-tight">
                  Unemployment Rate (%)
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Income
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Expenditure
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-normal leading-tight max-w-[180px]">
                  Mean Years of Education <br />
                  <span className="text-[10px] normal-case text-slate-500">
                    (20 years old and above)
                  </span>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Population
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Poverty Level
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="border-b border-slate-200">
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : error ? (
                <tr className="border-b border-slate-200">
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr className="border-b border-slate-200">
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(item.region_name, search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(item.year, search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(`${Number(item.unemployment_rate).toFixed(1)}%`, search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(Number(item.ave_income).toLocaleString(), search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(Number(item.expenditure).toLocaleString(), search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(Number(item.mean_years_education).toFixed(2), search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-slate-800">
                      {highlightText(Number(item.population_size).toLocaleString(), search)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm">
                      <PovertyBadge level={item.poverty_level} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-600 sm:text-left sm:text-sm">
              Showing {currentData.length > 0 ? startIndex + 1 : 0}–
              {Math.min(endIndex, searchedData.length)} of {searchedData.length}{" "}
              records
            </p>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  Previous
                </button>

                <span className="text-xs font-medium text-slate-700 sm:text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-lg bg-[#003B95] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#002d73] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}