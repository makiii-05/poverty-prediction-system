const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { exec } = require("child_process");

const ML_SERVICE_DIR = path.join(__dirname, "../../ml-service");

const DATASET_DIR = path.join(ML_SERVICE_DIR, "dataset");
const DATASET_PATH = path.join(DATASET_DIR, "MAIN_DATASET.xlsx");
const DATASET_BACKUP_DIR = path.join(DATASET_DIR, "backups");

const MODEL_DIR = path.join(ML_SERVICE_DIR, "models");
const MODEL_PATH = path.join(MODEL_DIR, "svc_model.pkl");
const MODEL_BACKUP_DIR = path.join(MODEL_DIR, "backups");

const TRAIN_SCRIPT_PATH = path.join(
  ML_SERVICE_DIR,
  "classification",
  "train_svc.py"
);

const REQUIRED_COLUMNS = [
  "region",
  "region_name",
  "year",
  "ave_income",
  "expenditure",
  "unemployment_rate",
  "mean_years_education",
  "population_size",
  "poverty_incidence",
];

function ensureDirs() {
  fs.mkdirSync(DATASET_BACKUP_DIR, { recursive: true });
  fs.mkdirSync(MODEL_BACKUP_DIR, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function normalizeColumns(row) {
  const normalized = {};

  for (const key in row) {
    const cleanKey = String(key).trim().toLowerCase().replace(/\s+/g, "_");
    normalized[cleanKey] = row[key];
  }

  return normalized;
}

function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(firstSheet, { defval: "" });
  return rows.map(normalizeColumns);
}

function validateColumns(rows) {
  if (!rows || rows.length === 0) {
    return "Uploaded dataset is empty.";
  }

  const fileColumns = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter((col) => !fileColumns.includes(col));

  if (missing.length > 0) {
    return `Missing required columns: ${missing.join(", ")}`;
  }

  return null;
}

function writeExcelFile(rows, filePath) {
  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, filePath);
}

function normalizeRegion(region) {
  return String(region || "").trim().toLowerCase();
}

function normalizeYear(year) {
  return Number(year || 0);
}

function sortRowsByRegionYear(rows) {
  return rows.sort((a, b) => {
    const regionA = normalizeRegion(a.region);
    const regionB = normalizeRegion(b.region);

    if (regionA < regionB) return -1;
    if (regionA > regionB) return 1;

    const yearA = normalizeYear(a.year);
    const yearB = normalizeYear(b.year);

    return yearA - yearB;
  });
}

function pruneBackups(folder, extension, keepCount = 10) {
  if (!fs.existsSync(folder)) return;

  const files = fs
    .readdirSync(folder)
    .filter((file) => file.endsWith(extension))
    .map((file) => ({
      name: file,
      fullPath: path.join(folder, file),
      mtime: fs.statSync(path.join(folder, file)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  const filesToDelete = files.slice(keepCount);

  for (const file of filesToDelete) {
    fs.unlinkSync(file.fullPath);
  }
}

function backupCurrentDataset() {
  ensureDirs();

  if (!fs.existsSync(DATASET_PATH)) return null;

  const backupName = `MAIN_DATASET_${getTimestamp()}.xlsx`;
  const backupPath = path.join(DATASET_BACKUP_DIR, backupName);

  fs.copyFileSync(DATASET_PATH, backupPath);
  pruneBackups(DATASET_BACKUP_DIR, ".xlsx", 10);

  return backupPath;
}

function backupCurrentModel() {
  ensureDirs();

  if (!fs.existsSync(MODEL_PATH)) return null;

  const backupName = `svc_model_${getTimestamp()}.pkl`;
  const backupPath = path.join(MODEL_BACKUP_DIR, backupName);

  fs.copyFileSync(MODEL_PATH, backupPath);
  pruneBackups(MODEL_BACKUP_DIR, ".pkl", 10);

  return backupPath;
}

function getLatestBackupFile(folder, extension) {
  if (!fs.existsSync(folder)) return null;

  const files = fs
    .readdirSync(folder)
    .filter((file) => file.endsWith(extension))
    .map((file) => ({
      name: file,
      fullPath: path.join(folder, file),
      mtime: fs.statSync(path.join(folder, file)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0].fullPath : null;
}

function runTraining() {
  return new Promise((resolve, reject) => {
    exec(`python "${TRAIN_SCRIPT_PATH}"`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
        return;
      }
      resolve(stdout);
    });
  });
}

const replaceDataset = async (req, res) => {
  try {
    ensureDirs();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const uploadedRows = readExcelFile(req.file.path);
    const validationError = validateColumns(uploadedRows);

    if (validationError) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const datasetBackupPath = backupCurrentDataset();
    const modelBackupPath = backupCurrentModel();

    const sortedRows = sortRowsByRegionYear(uploadedRows);

    writeExcelFile(sortedRows, DATASET_PATH);
    fs.unlinkSync(req.file.path);

    const trainingOutput = await runTraining();

    return res.status(200).json({
      success: true,
      message: "Dataset replaced and model retrained successfully.",
      totalRows: sortedRows.length,
      datasetBackupPath,
      modelBackupPath,
      trainingOutput,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
};

const rollbackDataset = async (req, res) => {
  try {
    ensureDirs();

    const latestDatasetBackup = getLatestBackupFile(DATASET_BACKUP_DIR, ".xlsx");

    if (!latestDatasetBackup) {
      return res.status(404).json({
        success: false,
        message: "No dataset backup found.",
      });
    }

    const currentDatasetBackup = backupCurrentDataset();
    const currentModelBackup = backupCurrentModel();

    fs.copyFileSync(latestDatasetBackup, DATASET_PATH);

    const trainingOutput = await runTraining();

    return res.status(200).json({
      success: true,
      message:
        "Rollback completed successfully. Dataset restored and model retrained.",
      restoredFrom: latestDatasetBackup,
      currentDatasetBackup,
      currentModelBackup,
      trainingOutput,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
};

const listBackups = async (req, res) => {
  try {
    ensureDirs();

    const datasetBackups = fs.existsSync(DATASET_BACKUP_DIR)
      ? fs.readdirSync(DATASET_BACKUP_DIR).sort().reverse()
      : [];

    const modelBackups = fs.existsSync(MODEL_BACKUP_DIR)
      ? fs.readdirSync(MODEL_BACKUP_DIR).sort().reverse()
      : [];

    return res.status(200).json({
      success: true,
      datasetBackups,
      modelBackups,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
};

module.exports = {
  replaceDataset,
  rollbackDataset,
  listBackups,
};