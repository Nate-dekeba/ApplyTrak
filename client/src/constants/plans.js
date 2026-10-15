// Mirrors server/src/utils/plan.js — keep the limit in sync with the backend.
export const FREE_JOB_LIMIT = 25

// Whether the user currently has Pro-level access — true if paid, or if
// trialing and the trial hasn't lapsed yet. Use this everywhere instead of
// checking user.plan directly, since a lapsed trial should read as Free
// until the server's next lazy downgrade catches up.
export function isProActive(user) {
    if (!user) return false
    if (user.plan === 'pro') return true
    if (user.plan === 'trialing' && user.trialEndsAt) {
        return new Date(user.trialEndsAt) > new Date()
    }
    return false
}
