const express = require("express");
const assetRoutes = require("./routes/assetRouter");
const jobRoutes = require("./routes/jobRoutes");
const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

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