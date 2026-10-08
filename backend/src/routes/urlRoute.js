const express = require("express");
const router = express.Router();
const { getAllUrls, createUrl } = require("../controllers/urlController");

router.get("/urls", getAllUrls);
router.post("/urls", createUrl);

// console.log(typeof );

module.exports = router;