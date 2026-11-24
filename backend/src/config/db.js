require('dotenv').config();
const pkg = require('pg');
const { Pool } = pkg;


// This connection pool for neon server
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

//  // this connection pool is for local server 
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
  
// });

pool.on("connect", () => {
  console.log("Connection pool established with Database");
});

exports.pool = pool;