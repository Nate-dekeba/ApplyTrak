/**
 * @file billingRoutes.js
 * @description Billing router — /api/billing
 * All routes require valid JWT.
 */
import express from 'express'
import { createCheckoutSession } from '../Controllers/billingController.js'
import { authenticateToken } from '../Middleware/authMiddleware.js'

export const billingRouter = express.Router()
billingRouter.use(authenticateToken)

billingRouter.post('/checkout', createCheckoutSession) // POST /api/billing/checkout
