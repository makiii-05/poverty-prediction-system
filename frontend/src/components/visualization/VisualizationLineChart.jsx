import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const getDisplayRegionName = (regionName) => {
  if (!regionName) return "";

  if (regionName.includes("Autonomous Region of Muslim Mindanao")) {
    return "Bangsamoro Autonomous Region in Muslim Mindanao";
  }

  if (regionName === "Metropolitan Manila") {
    return "National Capital Region";
  }

  return regionName;
};

const indicatorOptions = [
  { value: "ave_income", label: "Average Income", type: "number" },
  { value: "expenditure", label: "Expenditure", type: "number" },
  { value: "unemployment_rate", label: "Unemployment Rate", type: "percent" },
  {
    value: "mean_years_education",
    label: "Mean Years of Education",
    type: "decimal",
  },
  { value: "population_size", label: "Population Size", type: "number" },
];

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatValue = (value, type = "number") => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "-";
  if (type === "percent") return `${num}%`;
  if (type === "decimal") return num.toFixed(2);

  return num.toLocaleString();
};

const CustomTooltip = ({ active, payload, label, valueType }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-800">Year: {label}</p>
      <p className="text-sm text-slate-600">
        Value: {formatValue(item.value, valueType)}
      </p>
    </div>
  );
};

export default function VisualizationLineChart({
  rows = [],
  selectedRegion: initialSelectedRegion = "",
}) {
  const regionOptions = useMemo(() => {
    const uniqueRegions = [...new Set(rows.map((item) => item.displayRegion || item.region))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return uniqueRegions;
  }, [rows]);

  const [selectedRegion, setSelectedRegion] = useState(
    initialSelectedRegion || regionOptions[0] || ""
  );
  const [selectedIndicator, setSelectedIndicator] = useState("ave_income");

  const currentIndicator =
    indicatorOptions.find((item) => item.value === selectedIndicator) ||
    indicatorOptions[0];

  const filteredRows = useMemo(() => {
    return rows
      .filter((item) => (item.displayRegion || item.region) === selectedRegion)
      .map((item) => ({
        year: String(item.year),
        value: safeNumber(item[selectedIndicator]),
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [rows, selectedRegion, selectedIndicator]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Socioeconomic Trend Over Years
          </h2>
          <p className="text-sm text-slate-500">
            {currentIndicator.label} trend of{" "}
            {getDisplayRegionName(selectedRegion)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {getDisplayRegionName(region)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Socioeconomic Indicator
            </label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
            >
              {indicatorOptions.map((indicator) => (
                <option key={indicator.value} value={indicator.value}>
                  {indicator.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-[420px] w-full">
        {filteredRows.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <p className="text-sm font-medium text-slate-500">
              No data available for this selection.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredRows}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003B95" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#003B95" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatValue(value, currentIndicator.type)}
                width={90}
              />
              <Tooltip content={<CustomTooltip valueType={currentIndicator.type} />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#003B95"
                strokeWidth={3}
                fill="url(#colorValue)"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#003B95]">
          Note
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Use the region and socioeconomic indicator dropdowns to compare how
          each indicator changes across years.
        </p>
      </div>
    </div>
  );
}