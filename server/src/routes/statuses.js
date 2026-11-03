const express = require("express");
const { STATUSES, TRANSITIONS } = require("@jobtrack/shared");

const router = express.Router();

router.get("/statuses", (req, res) => {
  res.json({ statuses: STATUSES, transitions: TRANSITIONS });
});

module.exports = router;
