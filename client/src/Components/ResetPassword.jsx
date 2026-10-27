/**
 * ResetPassword
 * Shown when the user follows a reset link (/reset-password?token=...).
 * Validates the token via the backend and sets a new password.
 */
import { useState } from 'react'
import { CheckCircle2, Check, X } from 'lucide-react'
import { API_URL } from '../config.js'
import AuthShell from './ui/AuthShell.jsx'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'

export default function ResetPassword({ token, onBackToLogin }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')

    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Reset failed')
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center text-success-500">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your password has been updated. You can now log in.
          </p>
          <Button variant="primary" onClick={onBackToLogin} className="w-full mt-2">
            Log in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div role="alert" aria-live="polite" className="flex items-center gap-2 text-error-700 dark:text-error-400 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
              {error}
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="Create a new password"
            helperText="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            success={confirmPassword.length > 0 && passwordsMatch}
            error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
            endAdornment={confirmPassword.length > 0 && (
              passwordsMatch
                ? <Check size={16} className="text-success-500" />
                : <X size={16} className="text-error-500" />
            )}
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
