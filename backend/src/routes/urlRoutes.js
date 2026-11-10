const express = require("express");
const router = express.Router();

const {
  handleCreateShortUrl,
  handleRedirectURL,
  handleGetAnalytics,
  handleGetAllUrls,
  handleDeleteUrl,
} = require("../controllers/url");

const { authenticate } = require("../middleware/authMiddleware");
const {
  optionalAuthenticate,
} = require("../middleware/optionalAuthMiddleware");

// Create URL: Guest + Logged-in users
router.post("/", optionalAuthenticate, handleCreateShortUrl);

// Get only logged-in user's URLs
router.get("/urls", authenticate, handleGetAllUrls);

// Analytics: Only authenticated owner
router.get("/analytics/:short_code", authenticate, handleGetAnalytics);

// Delete: Only authenticated owner
router.delete("/urls/:short_code", authenticate, handleDeleteUrl);

// Redirect: Everyone
router.get("/:short_code", handleRedirectURL);

module.exports = router;
