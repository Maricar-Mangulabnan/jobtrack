const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health");
const statusRoutes = require("./routes/statuses");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", statusRoutes);

// 404 for anything else
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Last-resort error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
