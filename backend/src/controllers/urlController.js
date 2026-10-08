const express = require("express");
const { pool } = require("../config/db");

const createUrl = async (req, res) => {
    try {
        const { url } = req.body;
        console.log(url);
        // await pool.query("INSERT INTO short_urls VALUES(url)");

        res.json({"url": url})
    } catch (error) {
        console.log(error);
    }
}


const getAllUrls = async (req, res) => {
    const allUrls = await pool.query("SELECT * FROM short_urls");
    console.log("Url hit");
    return res.send(allUrls);
};


module.exports = {
  getAllUrls,
  createUrl,
};