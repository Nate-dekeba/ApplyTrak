/**
 * Auth router — /api/auth
 * Public routes (no JWT required).
 */
import express from 'express'
import { login, registerUser } from '../Controllers/authController.js'

export const authRouter = express.Router()

authRouter.post('/register', registerUser) // POST /api/auth/register
authRouter.post('/login', login)           // POST /api/auth/login
