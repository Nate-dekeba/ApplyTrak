import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';


export async function createUsersTable() {
    const db = await open({
        filename: path.join('database.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP)
    `)
    console.log('table created')
    await db.close()
}