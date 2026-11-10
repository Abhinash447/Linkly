const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// POST /api/auth/signup
const handleSignup = async (req, res) => {
  try {
    // Missing or malformed bodies should produce validation errors, not TypeErrors.
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!EMAIL_RE.test(email) || email.length > 255) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 to 72 characters",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password)
             VALUES ($1, $2)
             RETURNING id, email`,
      [email, hash],
    );

    const user = rows[0];

    res.status(201).json({
      success: true,
      message: "Account created",
      data: { user, token: signToken(user) },
    });
  } catch (err) {
    // Unique violation: email already exists
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/auth/login
const handleLogin = async (req, res) => {
  try {
    // Match signup's defensive handling for absent or malformed request bodies.
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { rows } = await pool.query(
      `SELECT id, email, password FROM users WHERE email = $1`,
      [email],
    );

    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password));

    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Never send the password hash to the client
    const { password: _hash, ...safeUser } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: { user: safeUser, token: signToken(user) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/auth/me (protected by the authenticate middleware)
// req.user = { id, email }, loaded from the DB by the middleware
const handleMe = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = {
  handleSignup,
  handleLogin,
  handleMe,
};
