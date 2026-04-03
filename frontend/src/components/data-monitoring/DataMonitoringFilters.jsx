import Search from "../common/Search";

export default function DataMonitoringFilters({
  selectedRegion,
  setSelectedRegion,
  selectedYear,
  setSelectedYear,
  regionOptions,
  yearOptions,
  search,
  setSearch,
}) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
          >
            <option value="">All Regions</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
          >
            <option value="">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="md:flex md:items-end">
          <div className="w-full md:max-w-xs">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search
            </label>
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}