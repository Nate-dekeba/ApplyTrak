/**
 * User settings controllers.
 * Handles profile updates, email change with OTP verification, and password change.
 */
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import pool from '../Database/db.js'

// PUT /api/user/profile — update display name
export async function updateName(req, res) {
    try {
        const { name } = req.body
        if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

        const result = await pool.query(
            'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
            [name.trim(), req.user.id]
        )

        const user = result.rows[0]
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({ message: 'Name updated successfully.', token, user })
    } catch (err) {
        res.status(500).json({ error: 'Failed to update name', details: err.message })
    }
}

// POST /api/user/request-email-change — send OTP to new email
export async function requestEmailChange(req, res) {
    try {
        const { email } = req.body
        if (!email?.trim()) return res.status(400).json({ error: 'Email is required' })

        const newEmail = email.trim().toLowerCase()

        // Check if email is already taken by another account
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [newEmail, req.user.id]
        )
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email is already in use.' })
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex')
        const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Store pending email + hashed code on the user row
        await pool.query(
            'UPDATE users SET pending_email = $1, email_change_token = $2, email_change_expires = $3 WHERE id = $4',
            [newEmail, hashedCode, expires, req.user.id]
        )

        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
            from: 'ApplyTrak <contact@applytrak.io>',
            to: newEmail,
            subject: 'Verify your new ApplyTrak email',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                    <h2 style="color:#1e293b;margin-bottom:8px">Verify your new email</h2>
                    <p style="color:#64748b;margin-bottom:24px">
                        Enter this code in ApplyTrak to confirm your new email address.
                        It expires in <strong>15 minutes</strong>.
                    </p>
                    <div style="text-align:center;margin:32px 0">
                        <span style="display:inline-block;letter-spacing:12px;font-size:36px;font-weight:700;color:#1e293b;background:#f1f5f9;padding:16px 24px;border-radius:12px;font-family:monospace">
                            ${code}
                        </span>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
        })

        res.status(200).json({ message: 'Verification code sent to your new email.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to send verification code', details: err.message })
    }
}

// POST /api/user/confirm-email-change — verify OTP and apply new email
export async function confirmEmailChange(req, res) {
    try {
        const { code } = req.body
        if (!code) return res.status(400).json({ error: 'Code is required' })

        const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex')

        const result = await pool.query(
            `UPDATE users
             SET email = pending_email,
                 pending_email = NULL,
                 email_change_token = NULL,
                 email_change_expires = NULL
             WHERE id = $1
               AND email_change_token = $2
               AND email_change_expires > NOW()
             RETURNING id, name, email`,
            [req.user.id, hashedCode]
        )

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Invalid or expired code.' })
        }

        const user = result.rows[0]
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({ message: 'Email updated successfully.', token, user })
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm email change', details: err.message })
    }
}

// PUT /api/user/password — change password
export async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' })
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' })
        }

        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id])
        const user = result.rows[0]

        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            return res.status(400).json({ error: 'Current password is incorrect' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id])

        res.status(200).json({ message: 'Password updated successfully.' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to update password', details: err.message })
    }
}
