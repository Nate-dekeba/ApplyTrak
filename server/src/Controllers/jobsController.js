/**
 * Jobs controllers.
 * All routes are protected — req.user is populated by authMiddleware.
 * Every query is scoped to the authenticated user's id to prevent
 * one user from accessing another's data.
 */
import pool from '../Database/db.js'

// GET /api/jobs
// Returns all jobs for the authenticated user, with optional status filter
export async function getJobs(req, res) {
    try {
        const userId = req.user.id
        const { status } = req.query

        let query = 'SELECT * FROM jobs WHERE "userId" = $1'
        const params = [userId]

        // Append status filter if provided (e.g. ?status=Interviewing)
        if (status) {
            query += ' AND status = $2'
            params.push(status)
        }

        const result = await pool.query(query, params)
        res.json({ jobs: result.rows })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch jobs', details: err.message })
    }
}

// POST /api/jobs
// Creates a new job application for the authenticated user
export async function createJob(req, res) {
    try {
        const { title, company, location, status, dateApplied, jobType, notes } = req.body
        const userId = req.user.id

        if (!title || !company || !status || !dateApplied) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const result = await pool.query(
            `INSERT INTO jobs (title, company, location, status, "dateApplied", "jobType", notes, "userId")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [title, company, location, status, dateApplied, jobType, notes, userId]
        )

        const newJob = {
            id: result.rows[0].id,
            title, company, location, status, dateApplied, jobType, notes
        }
        res.status(201).json({ job: newJob })
    } catch (err) {
        res.status(500).json({ error: 'Failed to create job', details: err.message })
    }
}


export async function deleteJob(req, res) {
    try {
        const { id } = req.params

        // Fetch first to verify the job exists and belongs to this user
        const existing = await pool.query(
            'SELECT * FROM jobs WHERE id = $1 AND "userId" = $2',
            [id, req.user.id]
        )
        const job = existing.rows[0]

        if (!job) {
            // Return 404 whether the job doesn't exist or belongs to someone else
            // to avoid leaking information about other users' data
            return res.status(404).json({ error: 'Job not found' })
        }

        await pool.query('DELETE FROM jobs WHERE id = $1', [id])
        res.status(200).json({ job, message: 'Job deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Cannot delete job', details: err.message })
    }
}

// PUT /api/jobs/:id
// Updates a job — only the owner can update their own jobs
export async function updateJob(req, res) {
    try {
        const { id } = req.params
        const { title, company, location, status, dateApplied, jobType, notes } = req.body

        // Fetch first to verify the job exists and belongs to this user
        const existing = await pool.query(
            'SELECT * FROM jobs WHERE id = $1 AND "userId" = $2',
            [id, req.user.id]
        )
        const job = existing.rows[0]

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        await pool.query(
            `UPDATE jobs SET
                title = $1, company = $2, location = $3, status = $4,
                "dateApplied" = $5, "jobType" = $6, notes = $7
             WHERE id = $8`,
            [title, company, location, status, dateApplied, jobType, notes, id]
        )

        const updatedJob = {
            id: parseInt(id),
            title, company, location, status, dateApplied, jobType, notes
        }
        res.status(200).json({ job: updatedJob })
    } catch (err) {
        res.status(500).json({ error: 'Cannot update job', details: err.message })
    }
}
