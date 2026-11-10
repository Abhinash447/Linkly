# Backend

## Neon database setup

For a new, empty Neon database, open the Neon SQL Editor and run [`schema.sql`](./schema.sql).
This creates the existing `users`, `short_urls`, and `click_events` tables,
their sequences, constraints, and indexes, plus the migration tracking table.
The owner column is nullable so guest-created links remain supported.

Do not run this fresh-database schema over an existing production database.
For an existing database, use the migration runner instead.

## Database migrations

Run pending SQL migrations before starting or deploying the backend:

```sh
npm run migrate
npm start
```

The migration runner records applied files in `schema_migrations`, applies each
file in a transaction, and stops on failure. Run `npm run migrate` again after
deploying new migration files.
