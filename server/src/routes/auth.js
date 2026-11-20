const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, authController.updateProfile);
router.patch("/password", requireAuth, authController.changePassword);
router.patch("/email", requireAuth, authController.changeEmail);

module.exports = router;
