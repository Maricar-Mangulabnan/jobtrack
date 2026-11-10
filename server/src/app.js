const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health");
const statusRoutes = require("./routes/statuses");
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const noteRoutes = require("./routes/notes");
const reminderRoutes = require("./routes/reminders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", statusRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api", noteRoutes);
app.use("/api", reminderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 for anything else
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Last-resort error handler
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
