/**
 * Jobs router — /api/jobs
 * All routes require a valid JWT (enforced by authenticateToken middleware).
 */
import express from 'express'
import { getJobs, createJob, deleteJob, updateJob } from '../Controllers/jobsController.js'
import { authenticateToken } from '../Middleware/authMiddleware.js'

export const apiRouter = express.Router()

// Apply auth middleware to every route in this router
apiRouter.use(authenticateToken)

apiRouter.get('/', getJobs)       // GET    /api/jobs
apiRouter.post('/', createJob)    // POST   /api/jobs
apiRouter.put('/:id', updateJob)  // PUT    /api/jobs/:id
apiRouter.delete('/:id', deleteJob) // DELETE /api/jobs/:id
