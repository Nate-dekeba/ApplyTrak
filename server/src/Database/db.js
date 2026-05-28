/**
 * Database connection pool.
 * Uses a single shared pg Pool instance across the app so connections
 * are reused rather than opened per request.
 */
import pg from 'pg'
const { Pool } = pg

if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is not set. Check Render env vars.')
    process.exit(1)
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // required by Neon (cloud-hosted Postgres)
})

export default pool
