require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./config/db");
const urlRoutes = require("./routes/urlRoute");



const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(cors());

// Routes
app.use("/api", urlRoutes);

// app.get("/api/urls", async (req, res) => {
//   const result = await pool.query("SELECT * FROM short_urls");
//   for (let i = 0; i < result.rowCount; i++) {
//     console.log(result.rows[i]);
//   }
//   res.send(result.rows[0]);
// });


// Error handling middleware


// Testing postgres connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`Database name is: ${result.rows[0].current_database}`);
})

// Server is running
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
