/**
 * @file userRoutes.js
 * @description User router — /api/users
 * All routes are require valid JWT 
 */

import express from 'express'
import {updateName, requestEmailChange, confirmEmailChange, changePassword} from '../Controllers/userController.js'
import { authenticateToken} from '../Middleware/authMiddleware.js'

export const userRouter = express.Router()
userRouter.use(authenticateToken)

userRouter.put('/profile', updateName)                            // PUT  /api/user/profile
userRouter.post('/request-email-change', requestEmailChange)      // POST /api/user/request-email-change
userRouter.post('/confirm-email-change', confirmEmailChange)      // POST /api/user/confirm-email-change
userRouter.put('/password', changePassword)                       // PUT  /api/user/password
