const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  replaceDataset,
  combineDataset,
  rollbackDataset,
  listBackups,
} = require("../controllers/DatasetController");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/replace", upload.single("file"), replaceDataset);
router.post("/combine", upload.single("file"), combineDataset);
router.post("/rollback", rollbackDataset);
router.get("/backups", listBackups);

module.exports = router;