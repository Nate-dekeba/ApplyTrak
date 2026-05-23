/**
 * Authentication controllers.
 * Handles user registration, login, and password reset.
 * login and registerUser return a signed JWT + public profile on success.
 * forgotPassword sends a reset link via Resend; resetPassword validates the
 * token and updates the hashed password.
 */
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import pool from '../Database/db.js'

// POST /api/auth/login
export async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Enter required fields' })
        }

        // Look up the user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]

        // Use the same error message for both "not found" and "wrong password"
        // to avoid leaking which emails are registered
        if (!user) {
            return res.status(400).json({ error: 'User credentials invalid' })
        }

        const isValidPass = await bcrypt.compare(password, user.password)
        if (!isValidPass) {
            return res.status(400).json({ error: 'User credentials invalid' })
        }

        const userData = { id: user.id, email: user.email, name: user.name }
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(200).json({ message: 'Login successful', token, user: userData })
    } catch (err) {
        res.status(500).json({ error: 'Failed to login', details: err.message })
    }
}

// POST /api/auth/register
export async function registerUser(req, res) {
    try {
        let { name, email, password } = req.body

        name = name?.trim()
        email = email?.trim()

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Enter required fields' })
        }

        // Hash the password before storing — never store plaintext
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id`,
            [name, email, hashedPassword]
        )

        const userData = { id: result.rows[0].id, email, name }
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({ message: 'User registered successfully', token, user: userData })
    } catch (err) {
        // Postgres unique constraint violation — email already registered
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already in use' })
        }
        res.status(500).json({ error: 'Failed to register user', details: err.message })
    }
}

// POST /api/auth/forgot-password
// Generates a secure reset token, stores it hashed in the DB, and emails a link.
// Always returns 200 to avoid leaking whether an email is registered.
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email is required' })

        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim()])
        const user = result.rows[0]

        // Respond 200 regardless — don't reveal if the email exists
        if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' })

        // Generate a random token and store its SHA-256 hash (never store raw tokens)
        const rawToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [hashedToken, expires, user.id]
        )

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`

        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
            from: 'ApplyTrak <onboarding@resend.dev>',
            to: email.trim(),
            subject: 'Reset your ApplyTrak password',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                    <h2 style="color:#1e293b;margin-bottom:8px">Reset your password</h2>
                    <p style="color:#64748b;margin-bottom:24px">
                        Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                    </p>
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 28px;background:linear-gradient(to right,#3b82f6,#6366f1);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
                        Reset Password
                    </a>
                    <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
        })

        res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to send reset email', details: err.message })
    }
}

// POST /api/auth/reset-password
// Validates the raw token against the stored hash and updates the password.
export async function resetPassword(req, res) {
    try {
        const { token, password } = req.body
        if (!token || !password) return res.status(400).json({ error: 'Token and password are required' })
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

        // Hash the incoming raw token to compare against what's stored
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const result = await pool.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [hashedToken]
        )
        const user = result.rows[0]

        if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' })

        const hashedPassword = await bcrypt.hash(password, 10)

        // Update password and clear the reset token in a single query
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        )

        res.status(200).json({ message: 'Password updated successfully.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset password', details: err.message })
    }
}
