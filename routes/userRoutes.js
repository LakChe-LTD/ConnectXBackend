const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const userController = require("../controllers/userController");
const { setupTwoFactorAuth } = require("../controllers/userController");
const { verifyTwoFactorAuth } = require("../controllers/userController");

// ✅ KEEP ONLY THESE
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.post("/2fa/setup", authenticate, setupTwoFactorAuth);

router.post("/2fa/verify", authenticate, verifyTwoFactorAuth);

module.exports = router;
