/**
 * @file webhookRoutes.js
 * @description Stripe webhook endpoint — /api/webhooks/stripe
 * Must receive raw (unparsed) body for signature verification.
 */
import express from 'express'
import Stripe from 'stripe'
import pool from '../Database/db.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const webhookRouter = express.Router()

webhookRouter.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature']

        let event
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object
                    const customerId = session.customer
                    const subscriptionId = session.subscription
                    const userId = session.metadata?.userId

                    if (userId) {
                        // Checkout never creates a Stripe-side trial (trials are handled
                        // locally via /api/billing/start-trial) — a completed session
                        // always means an immediately-active paid subscription.
                        await pool.query(
                            `UPDATE users SET plan = 'pro', stripe_customer_id = $1, stripe_subscription_id = $2 WHERE id = $3`,
                            [customerId, subscriptionId, userId]
                        )
                        console.log(`User ${userId} subscribed to Pro`)
                    }
                    break
                }

                case 'customer.subscription.updated': {
                    const subscription = event.data.object
                    const status = subscription.status
                    const customerId = subscription.customer

                    // active means paid and current; anything else (past_due, unpaid, canceled) → downgrade to free
                    const plan = status === 'active' ? 'pro' : 'free'

                    await pool.query(
                        `UPDATE users SET plan = $1 WHERE stripe_customer_id = $2`,
                        [plan, customerId]
                    )
                    console.log(`Subscription updated — customer ${customerId} plan: ${plan}`)
                    break
                }

                case 'customer.subscription.deleted': {
                    const subscription = event.data.object
                    const customerId = subscription.customer

                    await pool.query(
                        `UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_customer_id = $1`,
                        [customerId]
                    )
                    console.log(`Subscription cancelled for customer ${customerId}`)
                    break
                }

                case 'invoice.payment_failed': {
                    const invoice = event.data.object
                    const customerId = invoice.customer
                    console.warn(`Payment failed for customer ${customerId}`)
                    // TODO: send email notification to user
                    break
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`)
            }
        } catch (err) {
            console.error('Error processing webhook event:', err)
            return res.status(500).json({ error: 'Webhook handler failed' })
        }

        res.json({ received: true })
    }
)
