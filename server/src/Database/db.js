/**
 * Database connection pool.
 * Uses a single shared pg Pool instance across the app so connections
 * are reused rather than opened per request.
 */
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // required by Neon (cloud-hosted Postgres)
})

export default pool
