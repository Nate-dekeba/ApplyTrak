/**
 * @file billingController.js
 * @description Stripe billing — create checkout session, manage subscriptions
 */
import Stripe from 'stripe'

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
            success_url: `${process.env.FRONTEND_URL_CLIENT}?checkout=success`,
            cancel_url: `${process.env.FRONTEND_URL_CLIENT}?checkout=cancelled`,
        })

        res.json({ url: session.url })
    } catch (err) {
        console.error('Stripe checkout error:', err)
        res.status(500).json({ error: 'Failed to create checkout session' })
    }
}
