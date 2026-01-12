import express from 'express'
import { getJobs, createJob, deleteJob, updateJob } from '../Controllers/jobsController.js';

export const apiRouter = express.Router()

apiRouter.get('/', getJobs);


//POST
apiRouter.post('/',createJob )

//put 
apiRouter.put('/:id', updateJob)

//delete
apiRouter.delete('/:id', deleteJob) 



