const jwt = require("jsonwebtoken");
const { pool } = require("../config/db.js");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      return res.status(401).json({ success: false, message });
    }

    // Confirm the user still exists (e.g. wasn't deleted after the token was issued)
    const { rows } = await pool.query(
      `SELECT id, email FROM users WHERE id = $1`,
      [decoded.id],
    );

    if (!rows[0]) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }

    req.user = rows[0]; // { id, email }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { authenticate };
