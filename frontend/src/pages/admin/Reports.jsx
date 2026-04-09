import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { FileText, TrendingUp, AlertTriangle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getRegionYearLevel } from "../../api/DataAPI";
import { getModelMetrics } from "../../api/modelMetrics";
import { getPredictionHistory } from "../../api/AdminPredictAPI";
import ReportsHeader from "../../components/reports/ReportsHeader";
import ReportCard from "../../components/reports/ReportCard";
import ChartsSection from "../../components/reports/ChartsSection";
import InsightsSection from "../../components/reports/InsightsSection";
import ModelInfoSection from "../../components/reports/ModelInfoSection";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

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

  const levelScoreMap = {
    Low: 1,
    Moderate: 2,
    High: 3,
  };

  useEffect(() => {
    const fetchReportData = async () => {
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
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        const result = await getModelMetrics();
        setMetrics(result);
      } catch (error) {
        console.error("Failed to fetch model metrics:", error);
        setMetrics(null);
      } finally {
        setMetricsLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const result = await getPredictionHistory(100);
        setHistory(result.data || result.history || []);
      } catch (error) {
        console.error("Failed to fetch prediction history:", error);
        setHistory([]);
      }
    };

    fetchReportData();
    fetchMetrics();
    fetchHistory();
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
      const level = item.poverty_level;
      if (counts[level] !== undefined) {
        counts[level] += 1;
      }
    });

    const highestRiskRow =
      [...reportRows].sort((a, b) => {
        const scoreDiff =
          (levelScoreMap[b.poverty_level] || 0) -
          (levelScoreMap[a.poverty_level] || 0);

        if (scoreDiff !== 0) return scoreDiff;
        return a.displayRegion.localeCompare(b.displayRegion);
      })[0] || null;

    return {
      totalRegions: reportRows.length,
      totalPredictions: history.length,
      low: counts.Low,
      moderate: counts.Moderate,
      high: counts.High,
      highestRiskRegion: highestRiskRow?.displayRegion || "-",
      highestRiskLevel: highestRiskRow?.poverty_level || "-",
    };
  }, [reportRows, history]);

  const insights = useMemo(() => {
    const highRegions = reportRows.filter(
      (item) => item.poverty_level === "High"
    );
    const moderateRegions = reportRows.filter(
      (item) => item.poverty_level === "Moderate"
    );
    const lowRegions = reportRows.filter(
      (item) => item.poverty_level === "Low"
    );

    const topRiskText =
      highRegions.length > 0
        ? `${highRegions.length} region(s) are under High poverty level, indicating areas that may need more urgent intervention.`
        : "No region is classified under High poverty level for the selected year.";

    const balanceText =
      lowRegions.length > 0
        ? `${lowRegions.length} region(s) are under Low poverty level, which may indicate relatively better socioeconomic conditions compared to other regions.`
        : "No region is classified under Low poverty level for the selected year.";

    const midText =
      moderateRegions.length > 0
        ? `${moderateRegions.length} region(s) are under Moderate poverty level and may need continuous monitoring before risk increases further.`
        : "There are no regions under Moderate poverty level for the selected year.";

    return {
      topRiskText,
      balanceText,
      midText,
    };
  }, [reportRows]);

  const handleGenerateReport = () => {
    const summaryData = [
      { Metric: "Selected Year", Value: selectedYear || "-" },
      { Metric: "Total Regions", Value: summary.totalRegions },
      { Metric: "Total Predictions", Value: summary.totalPredictions },
      { Metric: "Highest Risk Region", Value: summary.highestRiskRegion },
      { Metric: "Highest Risk Level", Value: summary.highestRiskLevel },
      { Metric: "Low Poverty Level", Value: summary.low },
      { Metric: "Moderate Poverty Level", Value: summary.moderate },
      { Metric: "High Poverty Level", Value: summary.high },
    ];

    const insightsData = [
      { Section: "Risk Insight", Value: insights.topRiskText },
      { Section: "Stability Insight", Value: insights.balanceText },
      { Section: "Monitoring Insight", Value: insights.midText },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summaryData),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(insightsData),
      "Insights"
    );

    if (metrics) {
      const modelInfoData = [
        { Metric: "Model Name", Value: metrics.model_name || "-" },
        { Metric: "Accuracy", Value: metrics.accuracy ?? "-" },
        { Metric: "F1 Weighted", Value: metrics.f1_weighted ?? "-" },
        { Metric: "F1 Macro", Value: metrics.f1_macro ?? "-" },
      ];

      const cmRows = (metrics.confusion_matrix || []).map((row, index) => ({
        Row: index + 1,
        Values: Array.isArray(row) ? row.join(", ") : "-",
      }));

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(modelInfoData),
        "Model Info"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(cmRows),
        "Confusion Matrix"
      );
    }

    XLSX.writeFile(workbook, `poverty_report_${selectedYear || "latest"}.xlsx`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <ReportsHeader onGenerateReport={handleGenerateReport} />

        {/* FILTER + GENERATE BELOW HEADER */}
        {!loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              {/* LEFT: YEAR SELECT */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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

                {/* VIEWING */}
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="text-slate-500">Viewing Year:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedYear || "-"}
                  </span>
                </div>
              </div>

              {/* RIGHT: GENERATE BUTTON */}
              <button
                onClick={handleGenerateReport}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002d73] active:scale-[0.98]"
              >
                Generate Report
              </button>

            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ReportCard
            title="Total Regions"
            value={loading ? "..." : summary.totalRegions}
            icon={FileText}
            iconClass="text-[#003B95]"
            bgClass="bg-blue-50"
          />
          <ReportCard
            title="Total Predictions"
            value={loading ? "..." : summary.totalPredictions}
            icon={TrendingUp}
            iconClass="text-yellow-600"
            bgClass="bg-yellow-50"
          />
          <ReportCard
            title="Highest Risk Region"
            value={loading ? "..." : summary.highestRiskRegion}
            subValue={loading ? "" : summary.highestRiskLevel}
            icon={AlertTriangle}
            iconClass="text-red-600"
            bgClass="bg-red-50"
          />
        </div>

        <ChartsSection />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <InsightsSection insights={insights} />
          <ModelInfoSection
            metrics={metrics}
            metricsLoading={metricsLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
}