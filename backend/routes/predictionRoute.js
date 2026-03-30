const express = require("express");
const router = express.Router();

const {
  predictPovertyLevel,
} = require("../controller/predictionController");

router.post("/", predictPovertyLevel);

module.exports = router;