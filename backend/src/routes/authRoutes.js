const express = require("express");
const router = express.Router();
const { handleSignup, handleLogin, handleMe } = require("../controllers/auth.js");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.get("/me", authenticate, handleMe);

module.exports = router;