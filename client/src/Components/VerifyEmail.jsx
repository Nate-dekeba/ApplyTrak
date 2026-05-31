/**
 * VerifyEmail
 * Handles the ?verify=token URL param.
 * Calls the backend to verify the token, then shows success or error.
 */
import { useState, useEffect } from 'react'
import { API_URL } from '../config.js'

export default function VerifyEmail({ token, onBackToLogin }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Verification failed')
        setStatus('success')
        setMessage(data.message)
      } catch (err) {
        setStatus('error')
        setMessage(err.message)
      }
    }
    verify()
  }, [token])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-[440px] mx-4 text-center bg-white dark:bg-gray-900 px-8 py-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800">

        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 mb-2">Email verified!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[15px] font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-50 mb-2">Verification failed</h2>
            <p className="text-sm text-red-500 mb-6">{message}</p>
            <button
              onClick={onBackToLogin}
              className="text-blue-500 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              Back to login
            </button>
          </>
        )}

      </div>
    </div>
  )
}
