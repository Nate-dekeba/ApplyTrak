import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'
import {jobs} from '../data/jobsData.js'

export async function seedTable() { 

    const db = await open({
        filename: path.join('database.db'),
        driver: sqlite3.Database
    })


    try {
        await db.exec('BEGIN TRANSACTION;')
        for (const {title, company, location, status, dateApplied, jobType, notes} of jobs){
            await db.run(
                `INSERT INTO jobs(title, company, location, status, dateApplied, jobType, notes)
                VALUES(?,?,?,?,?,?,?)`,
                [title, company, location, status, dateApplied, jobType, notes]
            )
        }
        await db.exec('COMMIT;')
        console.log('Jobs added successfully.')

    }catch (error) {
        await db.exec('ROLLBACK') 
        console.error('Error seeding jobs table:', error)
    } finally {
        await db.close()
    }
}

