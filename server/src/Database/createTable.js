import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createUsersTable } from './createUsersTable.js';
import { createJobsTable } from './createJobsTable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createTable() {

    const db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });
    await db.exec(`

        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY Autoincrement,
            username TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT,
            status TEXT NOT NULL,
            dateApplied TEXT NOT NULL,
            jobType TEXT,
            notes TEXT,
            userId INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);

    await db.close();
}


/*
async function setUpDatabase() {
    try{
        await createUsersTable()
        await createJobsTable()
        
    }catch(err){
        console.error('error setting up database:', err.message)
    }
}
setUpDatabase()
*/

