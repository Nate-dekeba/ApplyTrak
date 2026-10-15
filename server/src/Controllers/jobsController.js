/**
 * Jobs controllers.
 * All routes are protected — req.user is populated by authMiddleware.
 * Every query is scoped to the authenticated user's id to prevent
 * one user from accessing another's data.
 */
import pool from '../Database/db.js'
import { getCurrentPlanState, FREE_JOB_LIMIT } from '../utils/plan.js'
import { safeFetchHtml, extractJobFromHtml } from '../utils/urlImport.js'

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
        const { title, company, location, status, dateApplied, jobType, notes, sourceUrl } = req.body
        const userId = req.user.id

        if (!title || !company || !status || !dateApplied) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const planState = await getCurrentPlanState(userId)
        if (planState.plan === 'free') {
            const countResult = await pool.query('SELECT COUNT(*) FROM jobs WHERE "userId" = $1', [userId])
            if (parseInt(countResult.rows[0].count, 10) >= FREE_JOB_LIMIT) {
                return res.status(403).json({
                    error: 'FREE_PLAN_LIMIT',
                    limit: FREE_JOB_LIMIT,
                    message: `You've reached the Free plan limit of ${FREE_JOB_LIMIT} applications. Upgrade to Pro for unlimited tracking.`,
                })
            }
        }

        const result = await pool.query(
            `INSERT INTO jobs (title, company, location, status, "dateApplied", "jobType", notes, "userId", "sourceUrl")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [title, company, location, status, dateApplied, jobType, notes, userId, sourceUrl || null]
        )

        const newJob = {
            id: result.rows[0].id,
            title, company, location, status, dateApplied, jobType, notes, sourceUrl: sourceUrl || null
        }
        res.status(201).json({ job: newJob })
    } catch (err) {
        res.status(500).json({ error: 'Failed to create job', details: err.message })
    }
}

// POST /api/jobs/import-url — Pro-only. Fetches a job posting URL server-side
// and extracts structured job data to pre-fill the Add Job form.
export async function importJobUrl(req, res) {
    try {
        const userId = req.user.id
        const { url } = req.body

        const planState = await getCurrentPlanState(userId)
        if (planState.plan === 'free') {
            return res.status(403).json({
                error: 'PRO_FEATURE_REQUIRED',
                message: 'URL import is a Pro feature. Start your free trial or upgrade to use it.',
            })
        }

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'A URL is required' })
        }

        let normalizedUrl
        try {
            normalizedUrl = new URL(url).toString()
        } catch {
            return res.status(400).json({ error: 'That doesn\'t look like a valid URL' })
        }

        const fetched = await safeFetchHtml(normalizedUrl)
        if (!fetched) {
            return res.status(200).json({ extracted: false, url: normalizedUrl })
        }

        const extracted = extractJobFromHtml(fetched.html)
        if (!extracted) {
            return res.status(200).json({ extracted: false, url: fetched.finalUrl })
        }

        res.status(200).json({ extracted: true, url: fetched.finalUrl, ...extracted })
    } catch (err) {
        console.warn('importJobUrl error:', err.message)
        res.status(200).json({ extracted: false, url: req.body?.url || '' })
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
        const { title, company, location, status, dateApplied, jobType, notes, sourceUrl } = req.body

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
                "dateApplied" = $5, "jobType" = $6, notes = $7, "sourceUrl" = $8
             WHERE id = $9`,
            [title, company, location, status, dateApplied, jobType, notes, sourceUrl || null, id]
        )

        const updatedJob = {
            id: parseInt(id),
            title, company, location, status, dateApplied, jobType, notes, sourceUrl: sourceUrl || null
        }
        res.status(200).json({ job: updatedJob })
    } catch (err) {
        res.status(500).json({ error: 'Cannot update job', details: err.message })
    }
}
