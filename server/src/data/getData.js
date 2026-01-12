import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'



async function getData(){
    const db =  await open({
        filename: path.join('database.db'),
        driver: sqlite3.Database
    })

    try{
        const query = 'SELECT * FROM jobs WHERE location = ?';
        const params = ['Remote'];

        const jobs = await db.all(query, params)
        console.log('Jobs located in Remote:', jobs)


    }catch(error){
        console.error('Error fetching data:', error)
        console.log(error)

    }
}
getData()
