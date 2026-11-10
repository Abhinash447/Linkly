require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
// `extended` is the Express option that enables URL-encoded form parsing.
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
// Support the configured /api base URL while keeping existing root-level short links valid.
app.use("/api", urlRoutes);
app.use("/", urlRoutes);
app.use("/api/auth", authRoutes);

// Server is running
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
