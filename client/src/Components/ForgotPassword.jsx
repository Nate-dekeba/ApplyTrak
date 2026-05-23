/**
 * ForgotPassword
 * Sends a password reset link to the user's email via the backend.
 * Always shows a success message after submit (no email enumeration).
 */
import { useState } from 'react'
import { API_URL } from '../config.js'

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
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

  const inputClass = "w-full py-2.5 px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-[420px] mx-4 animate-slideIn">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg">
            A
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">ApplyTrak</span>
        </div>

        <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 px-8 py-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-1">
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 m-0">Forgot your password?</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 m-0">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 text-2xl">
                ✓
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If <strong>{email}</strong> is registered, a reset link is on its way. Check your inbox.
              </p>
              <button
                onClick={onBackToLogin}
                className="mt-2 text-sm text-blue-500 font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Back to Log in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 text-red-700 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[15px] font-semibold cursor-pointer mt-1 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 m-0">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="bg-transparent border-none text-blue-500 font-medium cursor-pointer p-0 hover:text-blue-700 hover:underline transition-colors duration-150 text-sm"
                >
                  Back to Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
