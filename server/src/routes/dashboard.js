const express = require("express");
const controller = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Mounted at '/api/dashboard', so router.use() only affects dashboard routes.
router.use(requireAuth);

router.get("/summary", controller.summary);

module.exports = router;
