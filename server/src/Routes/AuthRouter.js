/**
 * Auth router — /api/auth
 * Public routes (no JWT required).
 */
import express from 'express'
import { login, registerUser, forgotPassword, resetPassword, verifyEmail, resendVerification } from '../Controllers/authController.js'

export const authRouter = express.Router()

authRouter.post('/register', registerUser)                // POST /api/auth/register
authRouter.post('/login', login)                          // POST /api/auth/login
authRouter.post('/verify-email', verifyEmail)             // POST /api/auth/verify-email
authRouter.post('/resend-verification', resendVerification) // POST /api/auth/resend-verification
authRouter.post('/forgot-password', forgotPassword)       // POST /api/auth/forgot-password
authRouter.post('/reset-password', resetPassword)         // POST /api/auth/reset-password
