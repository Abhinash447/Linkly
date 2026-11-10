const fs = require("node:fs");
const path = require("node:path");
const { pool } = require("../src/config/db");

const migrationsDirectory = path.join(__dirname, "..", "migrations");

async function runMigrations() {
  const migrationFiles = fs
    .readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (const filename of migrationFiles) {
      const { rowCount } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [filename],
      );

      if (rowCount) continue;

      const sql = fs.readFileSync(
        path.join(migrationsDirectory, filename),
        "utf8",
      );

      console.log(`Applying migration ${filename}`);
      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations are up to date.");
  } finally {
    client.release();
  }
}

runMigrations()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
