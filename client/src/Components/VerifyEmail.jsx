/**
 * VerifyEmail
 * OTP code entry screen shown after registration.
 * User enters the 6-digit code sent to their email.
 */
import { useState, useRef } from 'react'
import { Mail } from 'lucide-react'
import { API_URL } from '../config.js'
import AuthShell from './ui/AuthShell.jsx'
import Button from './ui/Button.jsx'

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
    if (loading) return
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
    <AuthShell maxWidth="440px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-3">
            <Mail size={22} />
          </div>
          <h2 className="text-h2 font-bold text-slate-900 dark:text-slate-50 m-0">Check your email</h2>
          <p className="text-body-sm text-slate-400 dark:text-slate-500 mt-2 m-0">
            We sent a 6-digit code to<br />
            <strong className="text-slate-600 dark:text-slate-300">{email}</strong>
          </p>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="flex items-center gap-2 text-error-700 dark:text-error-400 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
            {error}
          </div>
        )}

        {/* OTP boxes */}
        <fieldset className="border-none p-0 m-0">
          <legend className="sr-only">6-digit verification code</legend>
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1} of 6`}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-13 text-center text-xl font-bold rounded-control border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all duration-150 py-3"
                style={{ width: '44px', height: '52px' }}
              />
            ))}
          </div>
        </fieldset>

        <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length < 6} className="w-full">
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Didn't receive it?{' '}
          {resendStatus === 'sent' ? (
            <span className="text-success-600 dark:text-success-500 font-medium">Code sent!</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="bg-transparent border-none text-primary-600 font-medium cursor-pointer p-0 hover:underline disabled:opacity-60 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {resendStatus === 'sending' ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBackToSignup}
          className="bg-transparent border-none text-slate-400 text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors mx-auto rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          ← Back
        </button>
      </form>
    </AuthShell>
  )
}
