/**
 * Signup
 * Registration form with a confirm-password match indicator.
 * Validates that passwords match and are at least 8 characters before submitting.
 */
import { useState } from "react"
import { API_URL } from '../config.js'

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Signup failed')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full py-2.5 px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
  const labelClass = "block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5"

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="w-full max-w-[440px] mx-4 text-center bg-white dark:bg-gray-900 px-8 py-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-500 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-[440px] mx-4 animate-slideIn">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg">
            A
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">ApplyTrak</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white dark:bg-gray-900 px-8 py-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800"
        >
          <div className="text-center mb-1">
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 m-0">Create your account</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 m-0">Track every application. Land the right job.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`${inputClass} ${confirmPassword.length > 0 ? (passwordsMatch ? 'border-emerald-400 focus:border-emerald-500' : 'border-red-400 focus:border-red-500') : ''}`}
              />
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${passwordsMatch ? 'text-emerald-500' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[15px] font-semibold cursor-pointer mt-1 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="bg-transparent border-none text-blue-500 font-medium cursor-pointer p-0 hover:text-blue-700 hover:underline transition-colors duration-150 text-sm"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
