import { useEffect, useMemo, useState } from "react";
import {
  MapPinned,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
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
        setRows(result);

        const uniqueYears = [...new Set(result.map((item) => String(item.year)))].sort();
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

    const counts = {
      Low: 0,
      Moderate: 0,
      High: 0,
    };

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

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6">
        
    {/* HEADER */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">

    {/* Content */}
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div>
        <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
        </h1>
        <p className="mt-1 text-sm text-blue-100">
            Poverty Level Prediction System Overview
        </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
        <div className="text-right">
            <p className="text-xs text-blue-200">Selected Year</p>
            <p className="text-lg font-semibold">{selectedYear || "-"}</p>
        </div>

        <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none"
        >
            {years.map((year) => (
            <option key={year} className="text-black">
                {year}
            </option>
            ))}
        </select>
        </div>

    </div>

    {/* Decorative blur (optional but nice) */}
    <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    </div>

        {/* CARDS */}
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

        {/* VISUALIZATION BUTTONS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Visualization Shortcuts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open detailed charts
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

        {/* QUICK INSIGHTS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Quick Insights
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InsightItem
              label="Low Poverty Regions"
              value={`${stats.low} region(s)`}
              valueClass="text-green-700"
            />
            <InsightItem
              label="Moderate Poverty Regions"
              value={`${stats.moderate} region(s)`}
              valueClass="text-yellow-700"
            />
            <InsightItem
              label="High Poverty Regions"
              value={`${stats.high} region(s)`}
              valueClass="text-red-700"
            />
            <InsightItem
              label="Selected Year"
              value={selectedYear}
              valueClass="text-[#003B95]"
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

        {/* LEFT SIDE */}
        <div className="flex flex-col justify-between h-[80px]">
          
          {/* TITLE (FIXED HEIGHT) */}
          <p className="text-sm text-slate-500 leading-tight min-h-[40px]">
            {title}
          </p>

          {/* VALUE (ALWAYS ALIGNED) */}
          <p className="text-2xl font-bold text-slate-800">
            {value}
          </p>

        </div>

        {/* ICON */}
        <div className={`rounded-xl p-3 ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>

      </div>
    </div>
  );
}

function ActionCard({ title, description, buttonLabel, onClick }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      
      {/* CONTENT */}
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* BUTTON (ALWAYS BOTTOM) */}
      <button
        onClick={onClick}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002d73] active:scale-[0.98]"
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function InsightItem({ label, value, valueClass }) {
  return (
    <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}