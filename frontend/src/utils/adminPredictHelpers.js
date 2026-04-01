export const formatMetric = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
};

export const getLevelBadge = (level) => {
  if (level === "Low") {
    return "bg-green-50 text-green-700";
  }
  if (level === "Moderate") {
    return "bg-yellow-50 text-yellow-700";
  }
  if (level === "High") {
    return "bg-red-50 text-red-700";
  }
  return "bg-slate-100 text-slate-700";
};