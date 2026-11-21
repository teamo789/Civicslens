require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendOrigins = (process.env.FRONTEND_URL || `http://localhost:${port}`)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || frontendOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "12mb" }));
app.use(express.static(__dirname));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", mode: "demo-hackathon" } });
});
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: error.message });
  }
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`CivicLens API listening on http://localhost:${port}`);
  });
}

module.exports = app;
