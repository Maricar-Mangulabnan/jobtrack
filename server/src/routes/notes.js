const express = require("express");
const controller = require("../controllers/noteController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// requireAuth is added per route, not with router.use(). This router is mounted
// at '/api', so router.use(requireAuth) would also lock /api/health and /api/auth/login.
router.get("/applications/:id/notes", requireAuth, controller.list);
router.post("/applications/:id/notes", requireAuth, controller.create);
router.delete("/notes/:id", requireAuth, controller.remove);

module.exports = router;
