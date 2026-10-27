/**
 * ForgotPassword
 * Sends a password reset link to the user's email via the backend.
 * Always shows a success message after submit (no email enumeration).
 */
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { API_URL } from '../config.js'
import AuthShell from './ui/AuthShell.jsx'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Something went wrong')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const backLink = (
    <button
      type="button"
      onClick={onBackToLogin}
      className="bg-transparent border-none text-primary-600 font-medium cursor-pointer p-0 hover:text-primary-700 hover:underline transition-colors duration-150 text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      Back to Log in
    </button>
  )

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send a reset link.">
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center text-success-500">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If <strong>{email}</strong> is registered, a reset link is on its way. Check your inbox.
          </p>
          <div className="mt-2">{backLink}</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div role="alert" aria-live="polite" className="flex items-center gap-2 text-error-700 dark:text-error-400 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 m-0">
            {backLink}
          </p>
        </form>
      )}
    </AuthShell>
  )
}
