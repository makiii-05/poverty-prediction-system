require("dotenv").config({ path: __dirname + "/.env" });
const db = require("./config/db");

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

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://poverty-prediction-system-cmzt.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ✅ CORS options (FINAL FIX)
const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request origin:", origin);

    // Allow requests without origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ VERY IMPORTANT (fix preflight)
app.options(/.*/, cors(corsOptions));

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
    error: err.message,
  });
});

// DB connection
db.getConnection()
  .then((conn) => {
    console.log("✅ MySQL connected");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err);
  });

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}/`);
});