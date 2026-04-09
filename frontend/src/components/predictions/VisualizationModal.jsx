import { useEffect, useMemo, useState } from "react";
import { X, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getAllData } from "../../api/DataAPI";

export default function VisualizationModal({
  result,
  formData,
  onClose,
}) {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadComparisonData = async () => {
      if (!formData?.region) {
        setComparisonData([]);
        return;
      }

      try {
        setLoading(true);

        const response = await getAllData();
        const rows = Array.isArray(response) ? response : response.data || [];

        let filteredRows = rows
          .filter((item) => item.region === formData.region)
          .map((item) => ({
            year: item.year,
            ave_income: item.ave_income,
            expenditure: item.expenditure,
            unemployment_rate: item.unemployment_rate,
            mean_years_education: item.mean_years_education,
            population_size: item.population_size,
          }));

        const enteredYearExists = filteredRows.some(
          (item) => Number(item.year) === Number(formData.year)
        );

        if (!enteredYearExists && formData.year) {
          filteredRows.push({
            year: Number(formData.year),
            ave_income: Number(formData.ave_income || 0),
            expenditure: Number(formData.expenditure || 0),
            unemployment_rate: Number(formData.unemployment_rate || 0),
            mean_years_education: Number(formData.mean_years_education || 0),
            population_size: Number(formData.population_size || 0),
          });
        }

        filteredRows.sort((a, b) => Number(a.year) - Number(b.year));

        if (isMounted) {
          setComparisonData(filteredRows);
        }
      } catch (error) {
        console.error("Visualization fetch error:", error);
        if (isMounted) {
          setComparisonData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComparisonData();

    return () => {
      isMounted = false;
    };
  }, [formData]);

  const enteredYear = safeNumber(formData.year);

  const buildChartData = useMemo(() => {
    return (key) =>
      comparisonData
        .map((item) => ({
          year: item.year,
          value: safeNumber(item[key]),
          isCurrent: safeNumber(item.year) === enteredYear,
        }))
        .sort((a, b) => Number(a.year) - Number(b.year));
  }, [comparisonData, enteredYear]);

  const incomeChartData = buildChartData("ave_income");
  const expenditureChartData = buildChartData("expenditure");
  const unemploymentChartData = buildChartData("unemployment_rate");
  const educationChartData = buildChartData("mean_years_education");
  const populationChartData = buildChartData("population_size");

  const CustomTooltip = ({ active, payload, label, formatterType }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Year
        </p>
        <p className="text-sm font-bold text-slate-800">{label}</p>

        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Value
          </p>
          <p className="text-sm font-semibold text-slate-700">
            {formatValue(payload[0].value, formatterType)}
          </p>
        </div>
      </div>
    );
  };

  const ChartCard = ({
    title,
    data,
    formatterType = "number",
    yAxisWidth = 70,
  }) => {
    const gradientId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">
            Compare the selected year with the other years in the same region.
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003B95" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#003B95" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={{ stroke: "#cbd5e1" }}
              />

              <YAxis
                width={yAxisWidth}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={{ stroke: "#cbd5e1" }}
              />

              <Tooltip content={<CustomTooltip formatterType={formatterType} />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#003B95"
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 6 }}
                dot={({ cx, cy, payload, index }) => {
                  const isCurrent = payload?.isCurrent;

                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 6 : 4}
                      fill="#003B95"
                      fillOpacity={isCurrent ? 1 : 0.28}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#003B95]/10 p-2 text-[#003B95]">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">Visualization</h2>
              <p className="text-sm text-slate-500">
                Compare the entered indicators with other available years.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Region
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formData.region || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Year
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formData.year || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Predicted Level
              </p>
              <div className="mt-2">
                {result ? (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getBadgeStyle(
                      result
                    )}`}
                  >
                    {result}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">-</span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-medium text-slate-600">
                Loading comparison data...
              </p>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-medium text-slate-600">
                No comparison data found for this region.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ChartCard
                title="Average Income"
                data={incomeChartData}
                formatterType="number"
              />

              <ChartCard
                title="Expenditure"
                data={expenditureChartData}
                formatterType="number"
              />

              <ChartCard
                title="Unemployment Rate"
                data={unemploymentChartData}
                formatterType="percent"
              />

              <ChartCard
                title="Mean Years of Education"
                data={educationChartData}
                formatterType="decimal"
              />

              <div className="lg:col-span-2">
                <ChartCard
                  title="Population Size"
                  data={populationChartData}
                  formatterType="number"
                  yAxisWidth={85}
                />
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#003B95]">
              Note
            </p>
            <p className="mt-2 text-sm text-slate-600">
              The darker point represents the selected year. The lighter points
              represent the other available years for the chosen region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}