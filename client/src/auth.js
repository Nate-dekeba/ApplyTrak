/**
 * Session management utilities.
 * Stores the JWT token and user profile in localStorage so the session
 * persists across page refreshes. All API requests use authHeaders()
 * to attach the token to the Authorization header.
 */

const TOKEN_KEY = 'applytrak_token'
const USER_KEY  = 'applytrak_user'

// Persist token and user profile after login or registration
export function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

// Returns the saved user object, or null if not logged in
export function getSavedUser() {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
}

// Clears both token and user — called on logout
export function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

// Returns headers for authenticated API requests
export function authHeaders() {
    const token = getToken()
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    }
}
