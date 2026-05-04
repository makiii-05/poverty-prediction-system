import { useEffect, useMemo, useState } from "react";
import { FileText, TrendingUp, AlertTriangle, Download } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getRegionYearLevel } from "../../api/DataAPI";
import { getModelMetrics } from "../../api/modelMetrics";
import { getPredictionHistory } from "../../api/AdminPredictAPI";

import ReportsHeader from "../../components/reports/ReportsHeader";
import ReportCard from "../../components/reports/ReportCard";
import ChartsSection from "../../components/reports/ChartsSection";
import InsightsSection from "../../components/reports/InsightsSection";
import ModelInfoSection from "../../components/reports/ModelInfoSection";

import {
  getInsights,
  getReportRows,
  getSummary,
  getYears,
} from "../../utils/reports/reportHelpers";
import { generateDynamicRecommendations } from "../../utils/reports/reportRecommendations";
import { generatePovertyReportPdf } from "../../utils/reports/reportPdfGenerator";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        const result = await getRegionYearLevel();
        const safeRows = result || [];

        setRows(safeRows);

        const uniqueYears = getYears(safeRows);

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

  const years = useMemo(() => getYears(rows), [rows]);

  const reportRows = useMemo(() => {
    return getReportRows(rows, selectedYear);
  }, [rows, selectedYear]);

  const summary = useMemo(() => {
    return getSummary(reportRows, history);
  }, [reportRows, history]);

  const insights = useMemo(() => {
    return getInsights(reportRows);
  }, [reportRows]);

  const recommendations = useMemo(() => {
    return generateDynamicRecommendations(reportRows);
  }, [reportRows]);

  const handleGenerateReport = () => {
    generatePovertyReportPdf({
      selectedYear,
      summary,
      insights,
      recommendations,
      reportRows,
      metrics,
      history,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <ReportsHeader />

        {!loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="text-slate-500">Viewing Year:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedYear || "-"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateReport}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002d73] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Generate PDF Report
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
          <ModelInfoSection metrics={metrics} metricsLoading={metricsLoading} />
        </div>
      </div>
    </AdminLayout>
  );
}