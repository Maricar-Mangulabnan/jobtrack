const express = require("express");
const controller = require("../controllers/applicationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth); // every route below needs a valid token

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getOne);

module.exports = router;
