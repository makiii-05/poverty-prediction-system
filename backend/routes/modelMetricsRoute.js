const express = require("express");
const router = express.Router();

const { getModelMetrics } = require("../controller/modelMetricsController");

router.get("/", getModelMetrics);

module.exports = router;