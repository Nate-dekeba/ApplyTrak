/**
 * Login
 * Email + password login form.
 * On success, persists the session via saveSession() and notifies
 * the parent with the user object via onLogin().
 */
import { useState } from "react"
import { API_URL } from '../config.js'
import { saveSession } from '../auth.js'
import AuthShell from './ui/AuthShell.jsx'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'

export default function Login({ onLogin, onSwitchToSignUp, onForgotPassword }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      saveSession(data.token, data.user)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your job search dashboard.">
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-[13px] font-medium text-slate-600 dark:text-slate-400">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[12px] text-primary-600 font-medium bg-transparent border-none cursor-pointer p-0 hover:text-primary-700 hover:underline transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
          {loading ? 'Logging in...' : 'Log in'}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1 m-0">
          No account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="bg-transparent border-none text-primary-600 font-medium cursor-pointer p-0 hover:text-primary-700 hover:underline transition-colors duration-150 text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthShell>
  )
}
