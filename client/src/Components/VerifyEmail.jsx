/**
 * VerifyEmail
 * OTP code entry screen shown after registration.
 * User enters the 6-digit code sent to their email.
 */
import { useState, useRef } from 'react'
import { API_URL } from '../config.js'

export default function VerifyEmail({ email, onVerified, onBackToSignup }) {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState('') // '' | 'sending' | 'sent'
  const inputs = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // digits only
    const updated = [...digits]
    updated[index] = value.slice(-1) // one digit per box
    setDigits(updated)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const updated = Array(6).fill('')
    pasted.split('').forEach((d, i) => { updated[i] = d })
    setDigits(updated)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return setError('Enter all 6 digits.')

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      onVerified()
    } catch (err) {
      setError(err.message)
      setDigits(Array(6).fill(''))
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendStatus('sending')
    setError('')
    try {
      await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendStatus('sent')
      setTimeout(() => setResendStatus(''), 5000)
    } catch {
      setResendStatus('')
    }
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
          className="flex flex-col gap-5 bg-white dark:bg-gray-900 px-8 py-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 m-0">Check your email</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 m-0">
              We sent a 6-digit code to<br />
              <strong className="text-gray-600 dark:text-gray-300">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* OTP boxes */}
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 py-3"
                style={{ width: '44px', height: '52px' }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="w-full py-3 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[15px] font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Didn't receive it?{' '}
            {resendStatus === 'sent' ? (
              <span className="text-emerald-500 font-medium">Code sent!</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === 'sending'}
                className="bg-transparent border-none text-blue-500 font-medium cursor-pointer p-0 hover:underline disabled:opacity-60"
              >
                {resendStatus === 'sending' ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToSignup}
            className="bg-transparent border-none text-gray-400 text-sm cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors mx-auto"
          >
            ← Back
          </button>
        </form>
      </div>
    </div>
  )
}
