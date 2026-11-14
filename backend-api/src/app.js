require("dotenv").config();

const cors = require("cors");
const express = require("express");
const assetRoutes = require("./routes/assetRouter");
const jobRoutes = require("./routes/jobRoutes");
const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim();

if (process.env.NODE_ENV === "production" && !frontendOrigin) {
  throw new Error("FRONTEND_ORIGIN must be set to the deployed frontend origin in production");
}

if (frontendOrigin) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(frontendOrigin);
  } catch {
    throw new Error("FRONTEND_ORIGIN must be a valid HTTPS origin without a trailing slash");
  }

  if (parsedOrigin.protocol !== "https:" || parsedOrigin.origin !== frontendOrigin) {
    throw new Error("FRONTEND_ORIGIN must be a valid HTTPS origin without a trailing slash");
  }
}

const allowedOrigins = new Set(["http://localhost:5173", frontendOrigin].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (origin && allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timbre Mini Processing API is running",
  });
});

app.use("/assets", assetRoutes);
app.use("/jobs", jobRoutes);                                                         

app.use((req, res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

module.exports = app;