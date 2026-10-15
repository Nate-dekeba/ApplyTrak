/**
 * Plan/billing state helpers.
 * getCurrentPlanState is the single source of truth for a user's effective
 * plan — it lazily downgrades a lapsed local trial to 'free' in the DB so
 * every caller (login, getMe, job creation) sees consistent, current state
 * instead of trusting the JWT payload, which can be up to 7 days stale.
 */
import pool from '../Database/db.js'

export const FREE_JOB_LIMIT = 25

export async function getCurrentPlanState(userId) {
    const result = await pool.query(
        'SELECT plan, trial_ends_at FROM users WHERE id = $1',
        [userId]
    )
    const row = result.rows[0]
    if (!row) return null

    if (row.plan === 'trialing' && row.trial_ends_at && new Date(row.trial_ends_at) < new Date()) {
        await pool.query('UPDATE users SET plan = $1 WHERE id = $2', ['free', userId])
        return { plan: 'free', trialEndsAt: row.trial_ends_at }
    }

    return { plan: row.plan, trialEndsAt: row.trial_ends_at }
}
