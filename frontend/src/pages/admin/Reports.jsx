import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import AdminLayout from "../../layouts/AdminLayout";
import { getRegionYearLevel } from "../../api/DataAPI";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  const regionNameMap = {
    NCR: "National Capital Region",
    CAR: "Cordillera Administrative Region",
    "Region I": "Ilocos Region",
    "Region II": "Cagayan Valley",
    "Region III": "Central Luzon",
    "Region IV": "CALABARZON",
    MIMAROPA: "MIMAROPA",
    "Region V": "Bicol Region",
    "Region VI": "Western Visayas",
    "Region VII": "Central Visayas",
    "Region VIII": "Eastern Visayas",
    "Region IX": "Zamboanga Peninsula",
    "Region X": "Northern Mindanao",
    "Region XI": "Davao Region",
    "Region XII": "SOCCSKSARGEN",
    CARAGA: "Caraga",
    BARMM: "Bangsamoro Autonomous Region in Muslim Mindanao",
  };

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
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const years = useMemo(() => {
    return [...new Set(rows.map((item) => String(item.year)))].sort();
  }, [rows]);

  const reportRows = useMemo(() => {
    return rows
      .filter((item) => String(item.year) === String(selectedYear))
      .map((item) => ({
        ...item,
        displayRegion:
          regionNameMap[item.region] ||
          regionNameMap[item.region_name] ||
          item.region_name ||
          item.region,
      }))
      .sort((a, b) => a.displayRegion.localeCompare(b.displayRegion));
  }, [rows, selectedYear]);

  const summary = useMemo(() => {
    const counts = {
      Low: 0,
      Moderate: 0,
      High: 0,
    };

    reportRows.forEach((item) => {
      if (counts[item.poverty_level] !== undefined) {
        counts[item.poverty_level] += 1;
      }
    });

    return {
      totalRegions: reportRows.length,
      low: counts.Low,
      moderate: counts.Moderate,
      high: counts.High,
    };
  }, [reportRows]);

  const findings = useMemo(() => {
    const highRegions = reportRows
      .filter((item) => item.poverty_level === "High")
      .map((item) => item.displayRegion);

    const lowRegions = reportRows
      .filter((item) => item.poverty_level === "Low")
      .map((item) => item.displayRegion);

    return {
      highRegions,
      lowRegions,
    };
  }, [reportRows]);

  const getBadgeStyle = (level) => {
    if (level === "Low") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (level === "Moderate") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    if (level === "High") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const handleGenerateReport = () => {
    const reportData = reportRows.map((item, index) => ({
      No: index + 1,
      Region: item.displayRegion,
      Year: item.year,
      "Poverty Level": item.poverty_level,
    }));

    const summaryData = [
      { Metric: "Selected Year", Value: selectedYear },
      { Metric: "Total Regions", Value: summary.totalRegions },
      { Metric: "Low Poverty Level", Value: summary.low },
      { Metric: "Moderate Poverty Level", Value: summary.moderate },
      { Metric: "High Poverty Level", Value: summary.high },
    ];

    const findingsData = [
      {
        Category: "Regions under High",
        Value:
          findings.highRegions.length > 0
            ? findings.highRegions.join(", ")
            : "No regions classified as High",
      },
      {
        Category: "Regions under Low",
        Value:
          findings.lowRegions.length > 0
            ? findings.lowRegions.join(", ")
            : "No regions classified as Low",
      },
    ];

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const reportSheet = XLSX.utils.json_to_sheet(reportData);
    const findingsSheet = XLSX.utils.json_to_sheet(findingsData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, reportSheet, "Regional Report");
    XLSX.utils.book_append_sheet(workbook, findingsSheet, "Findings");

    XLSX.writeFile(workbook, `poverty_report_${selectedYear}.xlsx`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
              <p className="mt-1 text-sm text-blue-100">
                Annual poverty level report of Philippine regions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                  <option key={year} value={year} className="text-black">
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#003B95] transition hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportCard
            title="Total Regions"
            value={loading ? "..." : summary.totalRegions}
            icon={FileText}
            iconClass="text-[#003B95]"
            bgClass="bg-blue-50"
          />
          <ReportCard
            title="Low Poverty Level"
            value={loading ? "..." : summary.low}
            icon={ShieldCheck}
            iconClass="text-green-600"
            bgClass="bg-green-50"
          />
          <ReportCard
            title="Moderate Poverty Level"
            value={loading ? "..." : summary.moderate}
            icon={TrendingUp}
            iconClass="text-yellow-600"
            bgClass="bg-yellow-50"
          />
          <ReportCard
            title="High Poverty Level"
            value={loading ? "..." : summary.high}
            icon={AlertTriangle}
            iconClass="text-red-600"
            bgClass="bg-red-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Regional Poverty Level Report
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Poverty level classification by region for {selectedYear}
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                      Region
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                      Year
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                      Poverty Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
                      >
                        Loading report...
                      </td>
                    </tr>
                  ) : reportRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No report data available.
                      </td>
                    </tr>
                  ) : (
                    reportRows.map((item, index) => (
                      <tr key={`${item.displayRegion}-${item.year}-${index}`}>
                        <td className="rounded-l-xl border border-r-0 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          {item.displayRegion}
                        </td>
                        <td className="border border-x-0 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          {item.year}
                        </td>
                        <td className="rounded-r-xl border border-l-0 border-slate-200 bg-white px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBadgeStyle(
                              item.poverty_level
                            )}`}
                          >
                            {item.poverty_level}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">
                Report Summary
              </h2>
              <div className="mt-4 space-y-3">
                <SummaryItem
                  label="Low Poverty Regions"
                  value={`${summary.low} region(s)`}
                  valueClass="text-green-700"
                />
                <SummaryItem
                  label="Moderate Poverty Regions"
                  value={`${summary.moderate} region(s)`}
                  valueClass="text-yellow-700"
                />
                <SummaryItem
                  label="High Poverty Regions"
                  value={`${summary.high} region(s)`}
                  valueClass="text-red-700"
                />
                <SummaryItem
                  label="Selected Year"
                  value={selectedYear || "-"}
                  valueClass="text-[#003B95]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">
                Key Findings
              </h2>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-700">Regions under High</p>
                  <p className="mt-1">
                    {findings.highRegions.length > 0
                      ? findings.highRegions.join(", ")
                      : "No regions classified as High."}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">Regions under Low</p>
                  <p className="mt-1">
                    {findings.lowRegions.length > 0
                      ? findings.lowRegions.join(", ")
                      : "No regions classified as Low."}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">Interpretation</p>
                  <p className="mt-1">
                    This report summarizes the poverty level classification of
                    Philippine regions for the selected year based on the
                    available system data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ReportCard({ title, value, icon: Icon, iconClass, bgClass }) {
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

function SummaryItem({ label, value, valueClass }) {
  return (
    <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}