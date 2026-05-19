/**
 * Authentication controllers.
 * Handles user registration and login — both return a signed JWT
 * and the user's public profile on success.
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
