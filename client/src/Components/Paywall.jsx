/**
 * Paywall
 * Shown when a user's trial has expired and they have no active subscription.
 * Blocks access to the app and prompts them to upgrade.
 */
import { useState } from 'react'
import { API_URL } from '../config.js'
import { authHeaders } from '../auth.js'

const MONTHLY_FEATURES = [
  'Unlimited job applications',
  'Kanban board, table & card views',
  'URL import (auto-fill from job links)',
  'AI resume tailoring',
  'Cover letter generator',
  'Interview prep assistant',
  'Analytics dashboard',
  'Weekly email digest',
]

const ANNUAL_FEATURES = [
  'Everything in Monthly',
  'Priority support',
  'Early access to new features',
  'Exportable application history',
]

export default function Paywall({ onLogout }) {
  const [loading, setLoading] = useState(null) // 'monthly' | 'annual'
  const [error, setError] = useState('')

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-6">
          A
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your trial has ended</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Choose a plan to continue accessing your applications. Your data is safe and waiting for you.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm max-w-md w-full text-center">
          {error}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">

        {/* Monthly */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-7 bg-white dark:bg-gray-900 flex flex-col">
          <div>
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Monthly</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$15</span>
              <span className="text-gray-400 dark:text-gray-500 text-sm mb-1">/month</span>
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-7">cancel anytime</div>
            <ul className="flex flex-col gap-3 mb-8">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-indigo-500 font-bold shrink-0 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={!!loading}
            className="mt-auto w-full py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'monthly' ? 'Redirecting...' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Annual — hero */}
        <div className="relative border-2 border-indigo-500 rounded-2xl p-7 bg-white dark:bg-gray-900 shadow-[0_8px_40px_rgba(99,102,241,0.15)] flex flex-col">
          <div className="absolute -top-3 left-6">
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
              BEST VALUE
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-4">Annual</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$99</span>
              <span className="text-gray-400 dark:text-gray-500 text-sm mb-1">/year</span>
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-7">
              <span className="text-indigo-500 font-semibold">$8.25/mo</span> · save $81
            </div>
            <ul className="flex flex-col gap-3 mb-8">
              {ANNUAL_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-indigo-500 font-bold shrink-0 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('annual')}
            disabled={!!loading}
            className="mt-auto w-full py-3 rounded-xl border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'annual' ? 'Redirecting...' : 'Subscribe Annually'}
          </button>
        </div>

      </div>

      <button
        onClick={onLogout}
        className="mt-8 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer transition-colors duration-150"
      >
        Sign out
      </button>
    </div>
  )
}
