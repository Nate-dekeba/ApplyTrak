/**
 * Server entry point.
 * Initializes the database, configures middleware, mounts routes, and starts listening.
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { apiRouter } from './Routes/apiRoutes.js'
import { authRouter } from './Routes/AuthRouter.js'
import { createTable } from './Database/createTable.js'

const app = express()

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow one or more frontend origins defined in FRONTEND_URL (comma-separated)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`))
        }
    },
    credentials: true,
}))

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json()) // Parse JSON request bodies

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/jobs', apiRouter)   // protected — requires JWT
app.use('/api/auth', authRouter)  // public — login & register

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000

createTable()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err.message)
        process.exit(1)
    })
