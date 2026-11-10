const jwt = require("jsonwebtoken");
const { pool } = require("../config/db.js");

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    req.user = null;

    // Guest user: continue without authentication
    if (!authHeader) {
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [decoded.id],
    );

    if (!rows[0]) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = rows[0];

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { optionalAuthenticate };
