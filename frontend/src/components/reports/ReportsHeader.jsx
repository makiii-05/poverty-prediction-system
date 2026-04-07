import { Download } from "lucide-react";

export default function ReportsHeader({
  selectedYear,
  years,
  onYearChange,
  onGenerateReport,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003B95] to-[#005bd8] p-6 text-white shadow-md">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-blue-100">
            Regional poverty summary, visual insights, and model performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <p className="text-xs text-blue-200">Selected Year</p>
            <p className="text-lg font-semibold">{selectedYear || "-"}</p>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none backdrop-blur"
          >
            {years.map((year) => (
              <option key={year} value={year} className="text-black">
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={onGenerateReport}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#003B95] transition hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}