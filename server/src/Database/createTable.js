/**
 * Database schema initialization.
 * Called once on server startup — creates tables if they don't already exist.
 * Safe to run on every boot (IF NOT EXISTS).
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
