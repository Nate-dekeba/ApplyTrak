/**
 * @file billingController.js
 * @description Stripe billing — create checkout session, manage subscriptions
 */
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
                trial_period_days: 14,
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
