const express = require("express");
const router = express.Router();
const {
  handleGenerateNewShortURL,
  handleRedirectURL,
  handleGetAnalytics,
} = require("../controllers/url");

// CREATE SHORT URL
router.post("/", handleGenerateNewShortURL);

// REDIRECT TO THE ORIGINAL URL
router.get("/:short_code", handleRedirectURL);

// ANALYTICS 
router.get("/analytics/:short_code", handleGetAnalytics);

module.exports = router;