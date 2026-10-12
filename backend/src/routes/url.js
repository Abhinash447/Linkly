const express = require("express");
const router = express.Router();
const {
  handleCreateShortUrl,
  handleRedirectURL,
  handleGetAnalytics,
} = require("../controllers/url");

// CREATE SHORT URL
router.post("/", handleCreateShortUrl);

// REDIRECT TO THE ORIGINAL URL
router.get("/:short_code", handleRedirectURL);

// ANALYTICS 
router.get("/analytics/:short_code", handleGetAnalytics);

module.exports = router;