const express = require("express");
const router = express.Router();

const {
  handleCreateShortUrl,
  handleRedirectURL,
  handleGetAnalytics,
  handleGetAllUrls,
} = require("../controllers/url");

// CREATE SHORT URL
router.post("/", handleCreateShortUrl);

// GET ALL SHORT URLs
router.get("/urls", handleGetAllUrls);

// GET ANALYTICS FOR A SHORT URL
router.get("/analytics/:short_code", handleGetAnalytics);

// REDIRECT TO THE ORIGINAL URL
router.get("/:short_code", handleRedirectURL);

module.exports = router;
