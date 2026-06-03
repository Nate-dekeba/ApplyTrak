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
app.use(express.json())

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/jobs', apiRouter)   // protected — requires JWT
app.use('/api/auth', authRouter)  // public — login & register

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000

// Retry DB init up to 5 times — handles Neon cold-start delays
async function startServer(retries = 8, delay = 5000) {
    for (let i = 1; i <= retries; i++) {
        try {
            await createTable()
            await app.listen(PORT)
            console.log(`Server running on port ${PORT}`)
            return
        } catch (err) {
            console.error(`DB init attempt ${i} failed:`, err.message || err)
            if (i === retries) { console.error('All retries exhausted. Exiting.'); process.exit(1) }
            await new Promise(r => setTimeout(r, delay))
        }
    }
}

startServer()
