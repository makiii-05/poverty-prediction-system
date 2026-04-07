const path = require("path");
const fs = require("fs").promises;

const getModelMetrics = async (req, res) => {
  try {
    const metricsPath = path.join(
      __dirname,
      "../../ml-service/models/svc_model_metrics.json"
    );

    const file = await fs.readFile(metricsPath, "utf-8");
    const metrics = JSON.parse(file);

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("getModelMetrics error:", error);

    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Model metrics file not found. Train the model first.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch model metrics",
    });
  }
};

module.exports = {
  getModelMetrics,
};