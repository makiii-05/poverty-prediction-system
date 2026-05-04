import { levelScoreMap, regionNameMap } from "./reportConstants";

export const formatMetric = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);

  if (Number.isNaN(num)) return value;

  return `${(num * 100).toFixed(2)}%`;
};

export const getYears = (rows) => {
  return [...new Set(rows.map((item) => String(item.year)))].sort();
};

export const getReportRows = (rows, selectedYear) => {
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
};

export const getSummary = (reportRows, history) => {
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
};

export const getInsights = (reportRows) => {
  const highRegions = reportRows.filter(
    (item) => item.poverty_level === "High"
  );
  const moderateRegions = reportRows.filter(
    (item) => item.poverty_level === "Moderate"
  );
  const lowRegions = reportRows.filter((item) => item.poverty_level === "Low");

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
};