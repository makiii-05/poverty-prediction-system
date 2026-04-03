const XLSX = require("xlsx");
const fs = require("fs");

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
    } else if (cleanKey === "population_size" || cleanKey === "population") {
      normalized.population_size = row[key];
    }
  });

  return normalized;
};

const parseUploadFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rows.map(normalizeRow);
};

const predictAdminPovertyLevel = async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict-admin", {
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
    const response = await fetch("http://127.0.0.1:8000/save-prediction", {
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

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is empty",
      });
    }

    const response = await fetch("http://127.0.0.1:8000/predict-bulk", {
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
    const response = await fetch("http://127.0.0.1:8000/save-bulk-predictions", {
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
    const response = await fetch("http://127.0.0.1:8000/save-history", {
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
    const limit = req.query.limit || 10;

    const response = await fetch(
      `http://127.0.0.1:8000/history?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Fetching prediction history failed",
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

module.exports = {
  predictAdminPovertyLevel,
  saveAdminPrediction,
  uploadAndPredictBulk,
  saveBulkPredictions,
  savePredictionHistory,
  getPredictionHistory,
};