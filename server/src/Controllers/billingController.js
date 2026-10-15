/**
 * @file billingController.js
 * @description Stripe billing — create checkout session, manage subscriptions
 */
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import pool from '../Database/db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    annual: process.env.STRIPE_PRICE_ANNUAL,
}

// POST /api/billing/checkout
export async function createCheckoutSession(req, res) {
    const { plan } = req.body // 'monthly' | 'annual'
    const userId = req.user.id
    const userEmail = req.user.email

    const priceId = PRICE_IDS[plan]
    if (!priceId) return res.status(400).json({ error: 'Invalid plan selected' })

    // FRONTEND_URL may be a comma-separated list (for CORS) — use the first as the canonical app URL
    const primaryFrontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim()

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: {
                metadata: { userId: String(userId) },
            },
            metadata: { userId: String(userId) },
            success_url: `${primaryFrontendUrl}?checkout=success`,
            cancel_url: `${primaryFrontendUrl}?checkout=cancelled`,
        })

        res.json({ url: session.url })
    } catch (err) {
        console.error('Stripe checkout error:', err)
        res.status(500).json({ error: 'Failed to create checkout session' })
    }
}

// POST /api/billing/portal — for users with an existing subscription to manage/cancel it
export async function createPortalSession(req, res) {
    const userId = req.user.id

    // FRONTEND_URL may be a comma-separated list (for CORS) — use the first as the canonical app URL
    const primaryFrontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim()

    try {
        const result = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId])
        const customerId = result.rows[0]?.stripe_customer_id

        if (!customerId) {
            return res.status(400).json({ error: 'No billing account found. Subscribe to a plan first.' })
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: primaryFrontendUrl,
        })

        res.json({ url: session.url })
    } catch (err) {
        console.error('Stripe billing portal error:', err)
        res.status(500).json({ error: 'Failed to create billing portal session' })
    }
}

// POST /api/billing/start-trial
// Local, Stripe-free 14-day Pro trial — no card required. One-time per account:
// trial_ends_at being set at all (even in the past) means the trial has been used.
export async function startTrial(req, res) {
    const userId = req.user.id

    try {
        const result = await pool.query(
            'SELECT plan, trial_ends_at FROM users WHERE id = $1',
            [userId]
        )
        const user = result.rows[0]

        if (user.trial_ends_at) {
            return res.status(400).json({ error: "You've already used your free trial." })
        }
        if (user.plan === 'trialing' || user.plan === 'pro') {
            return res.status(400).json({ error: "You're already on this plan." })
        }

        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        const updated = await pool.query(
            `UPDATE users SET plan = 'trialing', trial_ends_at = $1 WHERE id = $2
             RETURNING id, name, email, plan, trial_ends_at`,
            [trialEndsAt, userId]
        )
        const row = updated.rows[0]

        const userData = { id: row.id, email: row.email, name: row.name, plan: row.plan, trialEndsAt: row.trial_ends_at }
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(200).json({ message: 'Your 14-day Pro trial has started.', token, user: userData })
    } catch (err) {
        console.error('Start trial error:', err)
        res.status(500).json({ error: 'Failed to start trial' })
    }
}
