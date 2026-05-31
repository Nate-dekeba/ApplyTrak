/**
 * Database schema initialization.
 * Called once on server startup — creates tables if they don't already exist.
 * ALTER TABLE ... ADD COLUMN IF NOT EXISTS safely migrates existing tables.
 */
import pool from './db.js'

export async function createTable() {
    // Users — stores account credentials and profile info
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id         SERIAL PRIMARY KEY,
            name       TEXT        NOT NULL,
            email      TEXT        NOT NULL UNIQUE,
            password   TEXT        NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `)

    // Add password reset columns if they don't exist (safe migration)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`)

    // Email verification columns
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT`)

    // Jobs — each row is one job application, scoped to a user
    await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
            id            SERIAL  PRIMARY KEY,
            title         TEXT    NOT NULL,
            company       TEXT    NOT NULL,
            location      TEXT,
            status        TEXT    NOT NULL,
            "dateApplied" TEXT    NOT NULL,
            "jobType"     TEXT,
            notes         TEXT,
            "userId"      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    console.log('Database tables ready')
}
