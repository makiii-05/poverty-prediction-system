import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
      if (counts[item.poverty_level] !== undefined) {
        counts[item.poverty_level] += 1;
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

    return {
      topRiskText:
        highRegions.length > 0
          ? `${highRegions.length} region(s) are classified as High poverty level. These areas may require priority monitoring and intervention.`
          : "No region is classified as High poverty level for the selected year.",

      balanceText:
        lowRegions.length > 0
          ? `${lowRegions.length} region(s) are classified as Low poverty level, indicating relatively better socioeconomic conditions.`
          : "No region is classified as Low poverty level for the selected year.",

      midText:
        moderateRegions.length > 0
          ? `${moderateRegions.length} region(s) are classified as Moderate poverty level and should be continuously monitored.`
          : "No region is classified as Moderate poverty level for the selected year.",
    };
  }, [reportRows]);

  const recommendations = useMemo(() => {
    const list = [];

    if (summary.high > 0) {
      list.push([
        "High Poverty Regions",
        "Prioritize targeted support programs such as livelihood assistance, employment opportunities, education access, and social protection services for regions classified as High.",
      ]);
    }

    if (summary.moderate > 0) {
      list.push([
        "Moderate Poverty Regions",
        "Continue monitoring these regions and apply preventive programs to reduce the risk of moving toward High poverty classification.",
      ]);
    }

    if (summary.low > 0) {
      list.push([
        "Low Poverty Regions",
        "Use these regions as reference points for identifying effective socioeconomic patterns and possible best practices.",
      ]);
    }

    list.push([
      "Data-Driven Planning",
      "Use the prediction results together with official socioeconomic data before finalizing policies, budgets, or intervention programs.",
    ]);

    list.push([
      "Continuous Monitoring",
      "Update the dataset when new official socioeconomic data becomes available to improve the reliability of future predictions.",
    ]);

    return list;
  }, [summary]);

  const formatMetric = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return `${(num * 100).toFixed(2)}%`;
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primary = [0, 59, 149];
    const dark = [30, 41, 59];
    const muted = [100, 116, 139];

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...muted);
        doc.text(
          `Generated by Poverty Level Prediction System | Page ${i} of ${pageCount}`,
          14,
          pageHeight - 10
        );
      }
    };

    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Poverty Level Prediction Report", 14, 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Machine Learning-Based Regional Poverty Level Analysis", 14, 25);
    doc.text(`Selected Year: ${selectedYear || "-"}`, 14, 32);

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Executive Summary", 14, 52);

    autoTable(doc, {
      startY: 58,
      theme: "grid",
      head: [["Metric", "Value"]],
      body: [
        ["Selected Year", selectedYear || "-"],
        ["Total Regions", summary.totalRegions],
        ["Total Predictions", summary.totalPredictions],
        ["Highest Risk Region", summary.highestRiskRegion],
        ["Highest Risk Level", summary.highestRiskLevel],
        ["Low Poverty Level", summary.low],
        ["Moderate Poverty Level", summary.moderate],
        ["High Poverty Level", summary.high],
      ],
      headStyles: {
        fillColor: primary,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: 100 },
      },
    });

    let y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text("Key Insights", 14, y);

    autoTable(doc, {
      startY: y + 6,
      theme: "grid",
      head: [["Insight Type", "Interpretation"]],
      body: [
        ["Risk Insight", insights.topRiskText],
        ["Stability Insight", insights.balanceText],
        ["Monitoring Insight", insights.midText],
      ],
      headStyles: {
        fillColor: primary,
        textColor: 255,
      },
      styles: {
        fontSize: 9.5,
        cellPadding: 3,
        valign: "top",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45 },
        1: { cellWidth: 135 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text("Recommendations for Decision-Making", 14, y);

    autoTable(doc, {
      startY: y + 6,
      theme: "grid",
      head: [["Area", "Suggested Action"]],
      body: recommendations,
      headStyles: {
        fillColor: primary,
        textColor: 255,
      },
      styles: {
        fontSize: 9.5,
        cellPadding: 3,
        valign: "top",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text("Regional Poverty Level Data", 14, y);

    autoTable(doc, {
      startY: y + 6,
      theme: "striped",
      head: [["Region", "Year", "Poverty Level"]],
      body: reportRows.map((row) => [
        row.displayRegion || "-",
        row.year || "-",
        row.poverty_level || "-",
      ]),
      headStyles: {
        fillColor: primary,
        textColor: 255,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 105 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 45, halign: "center", fontStyle: "bold" },
      },
    });

    doc.addPage();

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Model Performance Summary", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(
      "This section presents the machine learning model performance used for poverty level classification.",
      14,
      25
    );

    autoTable(doc, {
      startY: 35,
      theme: "grid",
      head: [["Metric", "Value"]],
      body: metrics
        ? [
            ["Model Name", metrics.model_name || "SVC Model"],
            ["Accuracy", formatMetric(metrics.accuracy)],
            ["F1 Weighted", formatMetric(metrics.f1_weighted)],
            ["F1 Macro", formatMetric(metrics.f1_macro)],
          ]
        : [["Model Metrics", "No model metrics available"]],
      headStyles: {
        fillColor: primary,
        textColor: 255,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: 100 },
      },
    });

    if (metrics?.confusion_matrix?.length) {
      const labels = metrics.labels || ["High", "Low", "Moderate"];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        theme: "grid",
        head: [["Actual \\ Predicted", ...labels]],
        body: metrics.confusion_matrix.map((row, index) => [
          labels[index] || `Class ${index + 1}`,
          ...row,
        ]),
        headStyles: {
          fillColor: primary,
          textColor: 255,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: "center",
        },
        columnStyles: {
          0: { fontStyle: "bold", halign: "left" },
        },
      });

      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text(
        "Note: Rows represent actual classes, while columns represent predicted classes.",
        14,
        doc.lastAutoTable.finalY + 8
      );
    }

    if (history.length > 0) {
      doc.addPage();

      doc.setTextColor(...dark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Recent Prediction History", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...muted);
      doc.text(
        "This section includes recent saved prediction records from the system.",
        14,
        25
      );

      autoTable(doc, {
        startY: 35,
        theme: "striped",
        head: [["Region", "Year", "Prediction", "Created At"]],
        body: history.slice(0, 30).map((item) => [
          regionNameMap[item.region] ||
            regionNameMap[item.region_name] ||
            item.region_name ||
            item.region ||
            "-",
          item.year || "-",
          item.predicted_level || item.poverty_level || item.prediction || "-",
          item.created_at ? new Date(item.created_at).toLocaleString() : "-",
        ]),
        headStyles: {
          fillColor: primary,
          textColor: 255,
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
      });
    }

    addFooter();

    doc.save(`poverty_level_report_${selectedYear || "latest"}.pdf`);
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