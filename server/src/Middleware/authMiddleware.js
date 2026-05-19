/**
 * JWT authentication middleware.
 * Validates the Bearer token on every protected route.
 * On success, attaches the decoded user payload to req.user so
 * downstream controllers can access the authenticated user's id, email, and name.
 */
import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // expect: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // { id, email, name }
        next()
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' })
    }
}
