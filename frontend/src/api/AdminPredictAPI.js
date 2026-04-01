const BASE_URL = "/api/admin-predictions";

export const predictAdmin = async (formData) => {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Prediction failed");
  }

  return data;
};

export const saveAdminPrediction = async (payload) => {
  const response = await fetch(`${BASE_URL}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Save failed");
  }

  return data;
};

export const uploadAndPredictBulk = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Bulk upload prediction failed");
  }

  return data;
};

export const saveBulkPredictions = async (rows) => {
  const response = await fetch(`${BASE_URL}/save-bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(rows),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Bulk save failed");
  }

  return data;
};

export const savePredictionHistory = async (payload) => {
  const response = await fetch(`${BASE_URL}/save-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Saving prediction history failed");
  }

  return data;
};