const { pool } = require("../config/db");
const crypto = require("crypto");

const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateBase62Standard(length = 6) {
    let result = "";

    for (let i = 0; i < length; i++) {
        result += alphabet[crypto.randomInt(alphabet.length)];
    }

    return result;
}

function isValidHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      return false;
    }

    try {
      const url = new URL(value.trim());

      return (
          ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)
      );
    } catch (_) {
      return false;
    }
}

const handleCreateShortUrl = async (req, res) => {
  const { original_url } = req.body ?? {};

  // 1. Validation
  if (typeof original_url !== "string" || !original_url.trim()) {
    return res.status(400).json({ error: "url required" });
  }

  const normalizedUrl = original_url.trim();

  if (!isValidHttpUrl(normalizedUrl)) {
    return res.status(422).json({ error: "Please enter a valid URL" });
  }

  // 2. Database Insertion with Safe Retry Limit
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const short_code = generateBase62Standard(6);

      const insertQuery = `
        INSERT INTO short_urls (original_url, short_code, created_at) 
        VALUES ($1, $2, NOW()) 
        RETURNING short_code;
      `;

      // Use the trimmed, normalized URL
      await pool.query(insertQuery, [normalizedUrl, short_code]);

      return res.status(201).json({
        message: "Short url created",
        short_code: short_code,
      });
    } catch (err) {
      // PostgreSQL unique violation error code is '23505'
      const isUniqueViolation = err.code === "23505";

      // If it's a collision and we haven't hit the max retries, loop again
      if (isUniqueViolation && attempt < MAX_RETRIES) {
        continue;
      }

      // If it's a different DB error or we ran out of retries, fail out
      console.error("Database error during short URL creation:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};


const handleRedirectURL = async (req, res) => {
  const { short_code } = req.params;
  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const result = await client.query(
      `UPDATE short_urls
             SET clicks_count = clicks_count + 1
             WHERE short_code = $1
             RETURNING id, original_url`,
      [short_code],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        error: "Short URL not found!",
      });
    }

    const { id, original_url } = result.rows[0];

    const country = null;

    await client.query(
      `INSERT INTO click_events
                (short_url_id, clicked_at, country)
             VALUES ($1, NOW(), $2)`,
      [id, country],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.redirect(302, original_url);
  } catch (err) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }

    console.error("Redirect tracking failed:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  } finally {
    client?.release();
  }
};

const handleGetAnalytics = async (req, res) => {
  const { short_code } = req.params;

  try {
    const metadataResult = await pool.query(
      `SELECT id, clicks_count
             FROM short_urls
             WHERE short_code = $1`,
      [short_code],
    );

    if (metadataResult.rows.length === 0) {
      return res.status(404).json({
        error: "Short URL not found",
      });
    }

    const { id, clicks_count } = metadataResult.rows[0];

    const [countryResult, dailyResult] = await Promise.all([
      pool.query(
        `SELECT
                    COALESCE(country, 'Unknown') AS country,
                    COUNT(*)::int AS clicks
                 FROM click_events
                 WHERE short_url_id = $1
                 GROUP BY country
                 ORDER BY clicks DESC`,
        [id],
      ),

      pool.query(
        `SELECT
              DATE(clicked_at) AS day,
              COUNT(*)::int AS clicks
              FROM click_events
              WHERE short_url_id = $1
              GROUP BY DATE(clicked_at)
              ORDER BY day ASC`,
        [id],
      ),
    ]);

    return res.json({
      shortCode: short_code,
      totalClicks: clicks_count,
      clicksByCountry: countryResult.rows,
      clicksByDay: dailyResult.rows,
    });
  } catch (err) {
    console.error("Analytics error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const handleGetAllUrls = async (req, res) => {

  try {
    const result = await pool.query(
      `SELECT * FROM short_urls`,
    )

    if (result.rows.length === 0) {
      return res.status(404).json("No Urls Found!");
    }

    const urls = result.rows.map((row) => ({
      original_url: row.original_url,
      short_url: row.short_code,
      date: row.created_at,
      clicks: row.clicks_count
    }));

    return res.json(urls);

  } catch (err) {
     return res.status(500).json({ error: err.message || err });
  }
};

module.exports = {
  handleCreateShortUrl,
  handleRedirectURL,
  handleGetAnalytics,
  handleGetAllUrls
};