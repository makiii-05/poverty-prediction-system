import { useEffect, useMemo, useState } from "react";
import {
  MapPinned,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
  GitCompare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getRegionYearLevel } from "../../api/DataAPI";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getRegionYearLevel();
        const safeRows = result || [];

        setRows(safeRows);

        const uniqueYears = [
          ...new Set(safeRows.map((item) => String(item.year))),
        ].sort();

        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[uniqueYears.length - 1]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const years = useMemo(() => {
    return [...new Set(rows.map((item) => String(item.year)))].sort();
  }, [rows]);

  const stats = useMemo(() => {
    const filtered = rows.filter(
      (item) => String(item.year) === String(selectedYear)
    );

    const counts = { Low: 0, Moderate: 0, High: 0 };

    filtered.forEach((item) => {
      if (counts[item.poverty_level] !== undefined) {
        counts[item.poverty_level] += 1;
      }
    });

    return {
      totalRegions: filtered.length,
      low: counts.Low,
      moderate: counts.Moderate,
      high: counts.High,
    };
  }, [rows, selectedYear]);

  const previousYear = useMemo(() => {
    const currentIndex = years.indexOf(String(selectedYear));
    return currentIndex > 0 ? years[currentIndex - 1] : null;
  }, [years, selectedYear]);

  const previousStats = useMemo(() => {
    if (!previousYear) {
      return null;
    }

    const filtered = rows.filter(
      (item) => String(item.year) === String(previousYear)
    );

    return {
      high: filtered.filter((item) => item.poverty_level === "High").length,
      moderate: filtered.filter((item) => item.poverty_level === "Moderate")
        .length,
      low: filtered.filter((item) => item.poverty_level === "Low").length,
    };
  }, [rows, previousYear]);

  const highDifference = previousStats
    ? stats.high - previousStats.high
    : null;

  const mostCommonLevel = useMemo(() => {
    const levels = [
      { label: "Low", value: stats.low },
      { label: "Moderate", value: stats.moderate },
      { label: "High", value: stats.high },
    ];

    const highest = levels.reduce((max, item) =>
      item.value > max.value ? item : max
    );

    return highest.value > 0 ? highest.label : "No Data";
  }, [stats]);

  const systemInsight = useMemo(() => {
    if (loading || stats.totalRegions === 0) {
      return "No dashboard data available yet.";
    }

    if (stats.high > stats.low && stats.high >= stats.moderate) {
      return "Higher poverty regions detected. These areas may need priority attention.";
    }

    if (stats.moderate >= stats.low && stats.moderate >= stats.high) {
      return "Most regions are in the moderate level. Continuous monitoring is recommended.";
    }

    return "Most regions are in a low poverty level condition for the selected year.";
  }, [loading, stats]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-blue-100">
              Poverty Level Prediction System Overview
            </p>
          </div>

          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* FILTER */}
        {!loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-[180px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003B95] focus:outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="text-slate-500">Viewing Year:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {selectedYear || "-"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Regions"
            value={loading ? "..." : stats.totalRegions}
            icon={MapPinned}
            iconClass="text-[#003B95]"
            bgClass="bg-blue-50"
          />
          <DashboardCard
            title="Low Poverty Level"
            value={loading ? "..." : stats.low}
            icon={ShieldCheck}
            iconClass="text-green-600"
            bgClass="bg-green-50"
          />
          <DashboardCard
            title="Moderate Poverty Level"
            value={loading ? "..." : stats.moderate}
            icon={TrendingUp}
            iconClass="text-yellow-600"
            bgClass="bg-yellow-50"
          />
          <DashboardCard
            title="High Poverty Level"
            value={loading ? "..." : stats.high}
            icon={AlertTriangle}
            iconClass="text-red-600"
            bgClass="bg-red-50"
          />
        </div>

        {/* SUMMARY + TREND */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#003B95]" />
              <h2 className="text-lg font-semibold text-slate-800">
                Summary Overview
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Quick monitoring highlights for the selected year.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Most Common Level</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {loading ? "..." : mostCommonLevel}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                System Insight
              </p>
              <p className="mt-1 text-sm leading-relaxed text-blue-900">
                {systemInsight}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-[#003B95]" />
              <h2 className="text-lg font-semibold text-slate-800">
                Year Comparison
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Compares the selected year with the previous available year.
            </p>

            {previousYear ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Compared Years
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {previousYear} → {selectedYear}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    High Poverty Regions
                  </p>
                  <p className="mt-1 text-xl font-bold text-red-800">
                    {previousStats.high} → {stats.high}
                  </p>

                  <p className="mt-2 text-sm text-red-700">
                    {highDifference > 0 &&
                      `Increased by ${highDifference} region(s).`}
                    {highDifference < 0 &&
                      `Decreased by ${Math.abs(highDifference)} region(s).`}
                    {highDifference === 0 &&
                      "No change from the previous year."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MiniTrendBox
                    label="Low"
                    previous={previousStats.low}
                    current={stats.low}
                    textClass="text-green-700"
                    bgClass="bg-green-50"
                  />
                  <MiniTrendBox
                    label="Moderate"
                    previous={previousStats.moderate}
                    current={stats.moderate}
                    textClass="text-yellow-700"
                    bgClass="bg-yellow-50"
                  />
                  <MiniTrendBox
                    label="High"
                    previous={previousStats.high}
                    current={stats.high}
                    textClass="text-red-700"
                    bgClass="bg-red-50"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No previous year data available for comparison.
              </div>
            )}
          </div>
        </div>

        {/* VISUALIZATION SHORTCUTS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Visualization Shortcuts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open detailed charts and analysis views.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <ActionCard
              title="Map Chart"
              description="View geographic distribution of poverty levels."
              buttonLabel="Open Map"
              onClick={() => navigate("/admin/map")}
            />
            <ActionCard
              title="Bar Chart"
              description="View ranking of regions by poverty level."
              buttonLabel="Open Bar Chart"
              onClick={() => navigate("/admin/bar-chart")}
            />
            <ActionCard
              title="Line Chart"
              description="View poverty trends across years."
              buttonLabel="Open Line Chart"
              onClick={() => navigate("/admin/line-chart")}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, value, icon: Icon, iconClass, bgClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-[80px] flex-col justify-between">
          <p className="min-h-[40px] text-sm leading-tight text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

function MiniTrendBox({ label, previous, current, textClass, bgClass }) {
  const difference = current - previous;

  return (
    <div className={`rounded-xl p-3 ${bgClass}`}>
      <p className={`text-sm font-medium ${textClass}`}>{label}</p>
      <p className={`mt-1 text-sm font-bold ${textClass}`}>
        {previous} → {current}
      </p>
      <p className={`mt-1 text-xs ${textClass}`}>
        {difference > 0 && `+${difference}`}
        {difference < 0 && difference}
        {difference === 0 && "No change"}
      </p>
    </div>
  );
}

function ActionCard({ title, description, buttonLabel, onClick }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002d73] active:scale-[0.98]"
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}