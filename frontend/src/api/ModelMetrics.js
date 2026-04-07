const BASE_URL = "/api/model-metrics";

export const getModelMetrics = async () => {
  const res = await fetch(BASE_URL, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch model metrics");
  }

  return data.data;
};