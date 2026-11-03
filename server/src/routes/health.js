const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch (err) {
    res
      .status(503)
      .json({ status: "degraded", db: "down", error: err.message });
  }
});

module.exports = router;
