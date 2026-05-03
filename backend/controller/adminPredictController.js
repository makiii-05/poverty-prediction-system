const XLSX = require("xlsx");
const fs = require("fs");

// ✅ ML SERVICE BASE URL
const ML_URL = process.env.ML_SERVICE_URL;

// ---------------- NORMALIZATION ----------------
const normalizeKey = (key) =>
  String(key).trim().toLowerCase().replace(/\s+/g, "_");

const normalizeRow = (row) => {
  const normalized = {};

  Object.keys(row || {}).forEach((key) => {
    const cleanKey = normalizeKey(key);

    if (cleanKey === "region") normalized.region = row[key];
    else if (cleanKey === "year") normalized.year = row[key];
    else if (cleanKey === "ave_income" || cleanKey === "average_income") {
      normalized.ave_income = row[key];
    } else if (cleanKey === "expenditure") {
      normalized.expenditure = row[key];
    } else if (cleanKey === "unemployment_rate") {
      normalized.unemployment_rate = row[key];
    } else if (
      cleanKey === "mean_years_education" ||
      cleanKey === "mean_year_of_education"
    ) {
      normalized.mean_years_education = row[key];
    } else if (
      cleanKey === "population_size" ||
      cleanKey === "population"
    ) {
      normalized.population_size = row[key];
    } else if (
      cleanKey === "poverty_incidence" ||
      cleanKey === "povertyincidence"
    ) {
      normalized.poverty_incidence = row[key];
    }
  });

  return normalized;
};

const parseUploadFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rawRows.map(normalizeRow);
};

// ---------------- ML CALLS ----------------

const predictAdminPovertyLevel = async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/predict-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Admin prediction failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveAdminPrediction = async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/save-prediction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Saving prediction failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadAndPredictBulk = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = req.file.path;
    const rows = parseUploadFile(filePath);

    const response = await fetch(`${ML_URL}/predict-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rows),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Bulk prediction failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const saveBulkPredictions = async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/save-bulk-predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Bulk save failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const savePredictionHistory = async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/save-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Saving prediction history failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPredictionHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const response = await fetch(`${ML_URL}/history?limit=${limit}`);

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  predictAdminPovertyLevel,
  saveAdminPrediction,
  uploadAndPredictBulk,
  saveBulkPredictions,
  savePredictionHistory,
  getPredictionHistory,
};