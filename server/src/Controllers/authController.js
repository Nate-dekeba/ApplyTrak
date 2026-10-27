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
import { getCurrentPlanState } from '../utils/plan.js'

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

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' })
        }

        const planState = await getCurrentPlanState(user.id)
        const userData = { id: user.id, email: user.email, name: user.name, plan: planState.plan, trialEndsAt: planState.trialEndsAt }
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(200).json({ message: 'Login successful', token, user: userData })
    } catch (err) {
        res.status(500).json({ error: 'Failed to login', details: err.message })
    }
}

async function sendVerificationCode(email, name) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex')
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await pool.query(
        'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE email = $3',
        [hashedCode, expires, email]
    )

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
        from: 'ApplyTrak <contact@applytrak.io>',
        to: email,
        subject: 'Your ApplyTrak verification code',
        html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
                <div style="text-align:center;margin-bottom:24px">
                    <span style="display:inline-block;width:40px;height:40px;line-height:40px;background:#2563eb;color:#ffffff;font-weight:700;font-size:18px;border-radius:10px;text-align:center">A</span>
                </div>
                <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;text-align:center">Verify your email</h2>
                <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center">
                    Hi ${name}, enter this code in the app to activate your account.
                    It expires in <strong>15 minutes</strong>.
                </p>
                <div style="text-align:center;margin:32px 0">
                    <span style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:700;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;padding:16px 20px;border-radius:10px;font-family:'Courier New',Courier,monospace">
                        ${code}
                    </span>
                </div>
                <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center">
                    If you didn't create an account, you can safely ignore this email.
                </p>
            </div>
        `,
    })

    return code
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

        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query(
            `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
            [name, email, hashedPassword]
        )

        await sendVerificationCode(email, name)

        res.status(201).json({ message: 'Account created. Check your email for your verification code.' })
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already in use' })
        }
        res.status(500).json({ error: 'Failed to register user', details: err.message })
    }
}

// POST /api/auth/verify-email
export async function verifyEmail(req, res) {
    try {
        const { email, code } = req.body
        if (!email || !code) return res.status(400).json({ error: 'Email and code are required' })

        const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex')

        const result = await pool.query(
            `UPDATE users
             SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
             WHERE email = $1
               AND verification_token = $2
               AND verification_token_expires > NOW()
             RETURNING id`,
            [email.trim(), hashedCode]
        )

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Invalid or expired code. Please try again.' })
        }

        res.status(200).json({ message: 'Email verified! You can now log in.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify email', details: err.message })
    }
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email is required' })

        const result = await pool.query(
            'SELECT name, is_verified FROM users WHERE email = $1',
            [email.trim()]
        )
        const user = result.rows[0]

        if (!user) return res.status(200).json({ message: 'If that email is registered, a new code has been sent.' })
        if (user.is_verified) return res.status(400).json({ error: 'This email is already verified.' })

        await sendVerificationCode(email.trim(), user.name)

        res.status(200).json({ message: 'A new verification code has been sent.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to resend code', details: err.message })
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

        // FRONTEND_URL may be a comma-separated list (for CORS) — use the first as the canonical app URL
        const primaryFrontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim()
        const resetUrl = `${primaryFrontendUrl}?token=${rawToken}`

        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
            from: 'ApplyTrak <contact@applytrak.io>',
            to: email.trim(),
            subject: 'Reset your ApplyTrak password',
            html: `
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
                    <div style="text-align:center;margin-bottom:24px">
                        <span style="display:inline-block;width:40px;height:40px;line-height:40px;background:#2563eb;color:#ffffff;font-weight:700;font-size:18px;border-radius:10px;text-align:center">A</span>
                    </div>
                    <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;text-align:center">Reset your password</h2>
                    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center">
                        Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                    </p>
                    <div style="text-align:center;margin:32px 0">
                        <a href="${resetUrl}"
                           style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
                            Reset Password
                        </a>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0 0 24px;text-align:center;word-break:break-all">
                        Or copy and paste this link into your browser:<br />
                        <a href="${resetUrl}" style="color:#2563eb">${resetUrl}</a>
                    </p>
                    <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;text-align:center">
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
