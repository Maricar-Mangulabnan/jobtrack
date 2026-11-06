const express = require("express");
const controller = require("../controllers/reminderController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Per-route guard again, because this router is mounted at '/api'.
router.post("/applications/:id/reminders", requireAuth, controller.create);
router.get("/reminders", requireAuth, controller.list);
router.patch("/reminders/:id", requireAuth, controller.update);
router.delete("/reminders/:id", requireAuth, controller.remove);

module.exports = router;
