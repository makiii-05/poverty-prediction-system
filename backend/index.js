require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Routes
const userRoutes = require("./routes/userRoute");
const dataRoute = require("./routes/dataRoute"); 
const predictionRoute = require("./routes/predictionRoute");
const datasetRoute = require("./routes/datasetRoute");
const adminPredictionRoute = require("./routes/adminPredictRoute");
const adminActionRoute = require("./routes/adminActionRoute");
const modelMetrics = require("./routes/modelMetricsRoute");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");

// start flask
const { startFlask } = require("./utils/startFlask");
const app = express();

// CORS for dynamic LAN/dev origins + cookies
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoute);
app.use("/api/prediction", predictionRoute);
app.use("/api/dataset", datasetRoute);
app.use("/api/admin-predictions", adminPredictionRoute);
app.use("/api/verify", adminActionRoute);
app.use("/api/model-metrics", modelMetrics);
app.use("/api/password", forgotPasswordRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}/`);
  startFlask()
});