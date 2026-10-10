const express = require("express");
const { pool } = require("../config/db");

function generateBase62Standard(length) {
    const alphabet =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = '';

    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.random() * 62);
    }

    return result;
}

function isValidHttpUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

const handleGenerateNewShortURL = async (req, res) => {
   
    const { original_url } = req.body;

    if (!original_url) {
        return res.status(400).json({ error: "url required" });
    }

    try {
        let short_code;
        let isUnique = false;

        while (!isUnique) {
            short_code = generateBase62Standard(6);

            const result = await pool.query(
                `SELECT EXISTS (SELECT 1 FROM short_urls WHERE short_code = \$1);`,
                [short_code]
            );

            const codeExists = result.rows[0].exists;

            if (!codeExists) {
                isUnique = true;
            }
        }

        const insertQuery = `
            INSERT INTO short_urls(original_url, short_code, created_at) VALUES($1, $2, NOW())
            RETURNING *;
        `;

        const values = [original_url, short_code];
        await pool.query(insertQuery, values);
        res.status(201).json({
            "message": "Short url created",
            "short_code": short_code
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }   
}

const handleRedirectURL = async (req, res) => {
    const { short_code } = req.params;

  try {
      const result = await pool.query(
        `UPDATE short_urls 
        SET clicks_count = clicks_count + 1 
        WHERE short_code = $1 
        RETURNING original_url`,
        [short_code],
      );

      
    // await pool.query(
    //     `UPDATE short_urls SET clicks_count = clicks_count + 1 WHERE short_code = $1`,
    //     [short_code]
    // );

    if (result.rows.length === 0) {
      return res.status(404).json("URL Not Found!");
    }

    const original_url = result.rows[0]?.original_url;

    return res.redirect(original_url);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json("Internal server error");
  }
};

const handleGetAnalytics = async (req, res) => {
    const { short_code } = req.params;

    try {
        const result = await pool.query(
            `SELECT clicks_count FROM short_urls WHERE short_code = $1`,
            [short_code],
        );

        if (!result) {
            return res.status(404).json({
                error: "Short Url Not Found",
            });
        }

        return res.json({
            totoalClicks: result.rows[0].clicks_count,
        });
    } catch (err) {
        return res.json({ error: "Internal Server Error" });
    }
}


module.exports = {
    handleGenerateNewShortURL,
    handleRedirectURL,
    handleGetAnalytics,
};