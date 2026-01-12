
import { error } from "node:console";
import { getDatabaseConnection } from "../Database/db.js";



export async function getAllJobs(req, res){
    const db = await getDatabaseConnection();
    try {
        let query = 'SELECT * FROM jobs'
        const jobs = await db.all(query)
        res.json({jobs})
    } catch(error) {
        res.status(500).json({error: 'Failed to fetch jobs', details: error.message})
    } finally {
        await db.close()
    }
}

export async function getStatuses(req, res){
    const db = await getDatabaseConnection();
    try {
        const statusRows = await db.all('SELECT DISTINCT status FROM jobs')
        const statuses = statusRows.map(row => row.status)
        res.json({statuses})
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch statuses', details: error.message})
    } finally {
        await db.close()
    }
} 

export async function getJobs(req, res){
    const db = await getDatabaseConnection();
    try {
        const {status, userId} = req.query

        if(!userId){
            return res.status(400).json({error: 'userId is required'})
        }

        let query = 'SELECT * FROM jobs WHERE userId = ?'
        let params = [userId]

        if(status){
            query += ' AND status = ?'
            params.push(status)
        }

        const jobs = await db.all(query, params)
        res.json({jobs})
    } catch(err) {
        res.status(500).json({error: 'Failed to fetch jobs', details: err.message})
    } finally {
        await db.close()
    }
}

//todo: CRUD
//create job
export async function createJob(req, res){
    const db = await getDatabaseConnection()
    try {
        const {title, company, location, status, dateApplied, jobType, notes, userId} = req.body

        if(!title || !company || !status || !dateApplied || !userId){
            return res.status(400).json({error: 'missing fields'})
        }

        //insert in database
        const result = await db.run(
            `INSERT INTO jobs (title, company, location, status, dateApplied, jobType, notes, userId)
            Values(?,?,?,?,?,?,?,?)`,
            [title, company, location, status, dateApplied, jobType, notes, userId]
        )
        const newJob = { 
            id: result.lastID,
            title,
            company,
            location,
            status,
            dateApplied,
            jobType,
            notes
        }
        res.status(201).json({job:newJob})
    }catch(err){
        res.status(500).json({error: 'Failed to create job', details: err.message})
    }finally{
        await db.close()
    }
}

export async function deleteJob(req, res){
    const db = await getDatabaseConnection()
    try {
        const {id} = req.params

        // get the job before deleting
        const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id])

        if(!job){
            return res.status(404).json({error: 'Job not found'})
        }

        // delete job
        await db.run('DELETE FROM jobs WHERE id = ?', [id])

        // return deleted job object
        res.status(200).json({job, message: 'Job deleted successfully'})
    }catch(err){
        res.status(500).json({error: 'Cannot delete job', details: err.message})
    }finally{
        await db.close()
    }
}

export async function updateJob(req, res){
    const db = await getDatabaseConnection()
    try {
        const {id} = req.params
        const {title, company, location, status, dateApplied, jobType, notes} = req.body
        const result = await db.run(`UPDATE jobs SET
            title =?, company=?, location=?, status=?, dateApplied=?, jobType=?, notes=? WHERE id =?`,
            [title, company, location, status, dateApplied, jobType, notes, id]
        )
        if (result.changes === 0){
            return res.status(404).json({error: 'Job is not found'})
        }

        // Return the updated job object
        const updatedJob = {
            id: parseInt(id),
            title,
            company,
            location,
            status,
            dateApplied,
            jobType,
            notes
        }
        res.status(200).json({job: updatedJob})
    }catch(err){
        res.status(500).json({error: 'Cannot update job', details: err.message})
    }finally{
        await db.close()
    }

}