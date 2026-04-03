import { Trash2 } from "lucide-react";
import { PovertyBadge, highlightText } from "../../utils/povertyBadgeUtils";

export default function DataMonitoringTable({
  loading,
  error,
  currentData,
  search,
  onDelete,
  selectedItems,
  onSelectItem,
  onSelectAllCurrent,
}) {
  const isSelected = (item) =>
    selectedItems.some((selected) => selected.id === item.id);

  const allCurrentSelected =
    currentData.length > 0 &&
    currentData.every((item) =>
      selectedItems.some((selected) => selected.id === item.id)
    );

  return (
    <div className="hidden md:block">
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-xs">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th
                title="Select All"
                className="w-[44px] px-2 py-2 text-center font-semibold"
              >
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={onSelectAllCurrent}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#003B95] focus:ring-[#003B95]"
                />
              </th>

              <th
                title="Region"
                className="px-2 py-2 text-left font-semibold"
              >
                Region
              </th>

              <th
                title="Year"
                className="w-[60px] px-2 py-2 text-left font-semibold"
              >
                Year
              </th>

              <th
                title="Income"
                className="px-2 py-2 text-left font-semibold"
              >
                Income
              </th>

              <th
                title="Expenditure"
                className="px-2 py-2 text-left font-semibold"
              >
                Exp
              </th>

              <th
                title="Unemployment"
                className="px-2 py-2 text-left font-semibold"
              >
                Unemp
              </th>

              <th
                title="Mean years of education"
                className="px-2 py-2 text-left font-semibold"
              >
                Edu
              </th>

              <th
                title="Population"
                className="px-2 py-2 text-left font-semibold"
              >
                Pop
              </th>

              <th
                title="Poverty Level"
                className="w-[120px] px-2 py-2 text-left font-semibold"
              >
                Level
              </th>

              <th
                title="Action"
                className="w-[70px] px-2 py-2 text-center font-semibold"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="10" className="py-4 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="10" className="py-4 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-4 text-center text-slate-500">
                  No data found.
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={item.id}
                  className={`transition hover:bg-slate-50/70 ${
                    isSelected(item) ? "bg-[#003B95]/5" : ""
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={() => onSelectItem(item)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#003B95] focus:ring-[#003B95]"
                    />
                  </td>

                  <td
                    className="px-2 py-2 font-medium text-slate-800 break-words"
                    title={item.region_name || item.region}
                  >
                    {highlightText(item.region_name || item.region, search)}
                  </td>

                  <td className="px-2 py-2 text-slate-700">
                    {highlightText(item.year, search)}
                  </td>

                  <td
                    className="px-2 py-2 text-slate-700 break-words"
                    title={String(item.ave_income)}
                  >
                    {highlightText(item.ave_income, search)}
                  </td>

                  <td
                    className="px-2 py-2 text-slate-700 break-words"
                    title={String(item.expenditure)}
                  >
                    {highlightText(item.expenditure, search)}
                  </td>

                  <td
                    className="px-2 py-2 text-slate-700 break-words"
                    title={String(item.unemployment_rate)}
                  >
                    {highlightText(item.unemployment_rate, search)}
                  </td>

                  <td
                    className="px-2 py-2 text-slate-700 break-words"
                    title={String(item.mean_years_education)}
                  >
                    {highlightText(item.mean_years_education, search)}
                  </td>

                  <td
                    className="px-2 py-2 text-slate-700 break-words"
                    title={String(item.population_size)}
                  >
                    {highlightText(item.population_size, search)}
                  </td>

                  <td className="px-2 py-2">
                    <PovertyBadge level={item.poverty_level} search={search} />
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onDelete(item)}
                      title="Delete record"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}