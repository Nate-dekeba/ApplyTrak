/**
 * UpgradeModal
 * In-context upgrade prompt — shown when a Free-plan user hits the job cap
 * or clicks "Upgrade" from the Sidebar/Settings. Unlike the old full-screen
 * Paywall, this never blocks access to the rest of the app.
 */
import { useState } from 'react'
import { API_URL } from '../config.js'
import { authHeaders, saveSession } from '../auth.js'

const FEATURES = [
  'Unlimited applications — no 25-job cap',
  'Priority support',
  'Early access to new features',
]

export default function UpgradeModal({ user, onClose, onUserUpdate }) {
  const [loading, setLoading] = useState(null) // 'trial' | 'monthly' | 'annual'
  const [error, setError] = useState('')

  const hasUsedTrial = !!user?.trialEndsAt

  const handleStartTrial = async () => {
    setLoading('trial')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/billing/start-trial`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start trial')
      saveSession(data.token, data.user)
      onUserUpdate(data.user)
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(null)
    }
  }

  const handleUpgrade = async (plan) => {
    setLoading(plan)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-[1000] p-5"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-[440px] w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl mb-5">
          A
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upgrade to Pro</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {hasUsedTrial
            ? "You're on the Free plan. Upgrade for unlimited applications."
            : 'Try Pro free for 14 days — no credit card required.'}
        </p>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <ul className="flex flex-col gap-2.5 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-indigo-500 font-bold shrink-0 mt-0.5">✓</span> {f}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2.5">
          {!hasUsedTrial && (
            <button
              onClick={handleStartTrial}
              disabled={!!loading}
              className="w-full py-3 rounded-xl border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'trial' ? 'Starting trial...' : 'Start free 14-day trial'}
            </button>
          )}
          <div className="flex gap-2.5">
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={!!loading}
              className="flex-1 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'monthly' ? '...' : 'Monthly — $15/mo'}
            </button>
            <button
              onClick={() => handleUpgrade('annual')}
              disabled={!!loading}
              className="flex-1 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'annual' ? '...' : 'Annual — $99/yr'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center mt-5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer transition-colors duration-150"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
