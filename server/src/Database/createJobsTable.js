import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path'; 

export async function createJobsTable() {

    const db = await open({
        filename: path.join('database.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT,
            status TEXT NOT NULL,
            dateApplied TEXT NOT NULL,
            jobType TEXT,
            notes TEXT
        )
    `);
    console.log('Jobs tabke created') 
    await db.close()


}