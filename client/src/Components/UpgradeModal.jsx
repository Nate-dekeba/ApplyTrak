/**
 * UpgradeModal
 * In-context upgrade prompt — shown when a Free-plan user hits the job cap
 * or clicks "Upgrade" from the Sidebar/Settings. Unlike the old full-screen
 * Paywall, this never blocks access to the rest of the app.
 */
import { useState } from 'react'
import { Check } from 'lucide-react'
import { API_URL } from '../config.js'
import { authHeaders, saveSession } from '../auth.js'
import Logo from './ui/Logo.jsx'
import Button from './ui/Button.jsx'

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
    if (loading) return
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
    if (loading) return
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
        className="bg-white dark:bg-slate-900 rounded-modal max-w-[440px] w-full p-8 shadow-soft-md border border-slate-100 dark:border-slate-800 animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5">
          <Logo size="md" />
        </div>
        <h2 className="text-h1 font-bold text-slate-900 dark:text-white mb-2">Upgrade to Pro</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {hasUsedTrial
            ? "You're on the Free plan. Upgrade for unlimited applications."
            : 'Try Pro free for 14 days — no credit card required.'}
        </p>

        {error && (
          <div role="alert" aria-live="polite" className="mb-4 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400 rounded-control text-sm">
            {error}
          </div>
        )}

        <ul className="flex flex-col gap-2.5 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <Check size={16} className="text-primary-600 shrink-0 mt-0.5" /> {f}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2.5">
          {!hasUsedTrial && (
            <Button variant="primary" onClick={handleStartTrial} loading={loading === 'trial'} className="w-full">
              {loading === 'trial' ? 'Starting trial...' : 'Start free 14-day trial'}
            </Button>
          )}
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => handleUpgrade('monthly')} loading={loading === 'monthly'} className="flex-1">
              {loading === 'monthly' ? '...' : 'Monthly — $15/mo'}
            </Button>
            <Button variant="secondary" onClick={() => handleUpgrade('annual')} loading={loading === 'annual'} className="flex-1">
              {loading === 'annual' ? '...' : 'Annual — $99/yr'}
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center mt-5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
