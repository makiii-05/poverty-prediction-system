const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  predictAdminPovertyLevel,
  saveAdminPrediction,
  uploadAndPredictBulk,
  saveBulkPredictions,
  savePredictionHistory,
  getPredictionHistory,
} = require("../controller/adminPredictController");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

const upload = multer({ dest: "uploads/" });

router.post("/predict", verifyToken, verifyAdmin, predictAdminPovertyLevel);
router.post("/save", verifyToken, verifyAdmin, saveAdminPrediction);

router.post(
  "/upload",
  verifyToken,
  verifyAdmin,
  upload.single("file"),
  uploadAndPredictBulk
);

router.post("/save-bulk", verifyToken, verifyAdmin, saveBulkPredictions);
router.post("/save-history", verifyToken, verifyAdmin, savePredictionHistory);

router.get("/history", verifyToken, verifyAdmin, getPredictionHistory);

module.exports = router;