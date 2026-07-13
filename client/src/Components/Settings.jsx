/**
 * Settings
 * Lets users update their name, change their email (with OTP verification),
 * and change their password.
 */
import { useState } from 'react'
import { API_URL } from '../config.js'
import { authHeaders, saveSession } from '../auth.js'

const inputClass = "w-full py-2.5 px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
const labelClass = "block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5"

function SuccessBanner({ message }) {
  return (
    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm">
      <span>✓</span> {message}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
      {message}
    </div>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50 m-0">{title}</h3>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5 m-0">{description}</p>
      </div>
      {children}
    </div>
  )
}

// ── Billing Section ────────────────────────────────────────────────────────────
const PLAN_BADGES = {
  free: { label: 'Free Plan', className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  trialing: { label: 'Pro Trial', className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  pro: { label: 'Pro', className: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' },
}

function BillingSection({ user }) {
  const [loading, setLoading] = useState(null) // 'monthly' | 'annual' | 'portal'
  const [error, setError] = useState('')

  const badge = PLAN_BADGES[user.plan] || PLAN_BADGES.free
  const hasSubscription = user.plan === 'trialing' || user.plan === 'pro'

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

  const handleManageSubscription = async () => {
    setLoading('portal')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/billing/portal`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <SectionCard title="Billing" description="Manage your subscription and plan.">
      <div className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>{badge.label}</span>
          {user.plan === 'trialing' && user.trialEndsAt && (
            <span className="text-[13px] text-gray-400 dark:text-gray-500">
              Trial ends {new Date(user.trialEndsAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {hasSubscription ? (
          <div className="flex justify-end">
            <button
              onClick={handleManageSubscription}
              disabled={!!loading}
              className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'portal' ? 'Opening...' : 'Manage Subscription'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={!!loading}
              className="flex-1 px-5 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'monthly' ? 'Redirecting...' : 'Upgrade Monthly — $15/mo'}
            </button>
            <button
              onClick={() => handleUpgrade('annual')}
              disabled={!!loading}
              className="flex-1 px-5 py-2.5 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'annual' ? 'Redirecting...' : 'Upgrade Annually — $99/yr'}
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ── Profile Section ────────────────────────────────────────────────────────────
function ProfileSection({ user, onUserUpdate }) {
  const [name, setName] = useState(user.name)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (name.trim() === user.name) return
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update name')
      saveSession(data.token, data.user)
      onUserUpdate(data.user)
      setSuccess('Name updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard title="Profile" description="Update your display name.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="text"
            value={user.email}
            disabled
            className={`${inputClass} opacity-50 cursor-not-allowed`}
          />
          <p className="text-[11px] text-gray-400 mt-1">To change your email, use the section below.</p>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || name.trim() === user.name}
            className="px-5 py-2.5 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

// ── Email Change Section ───────────────────────────────────────────────────────
function EmailSection({ user, onUserUpdate }) {
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'verify'
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/user/request-email-change`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: newEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send code')
      setStep('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/user/confirm-email-change`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      saveSession(data.token, data.user)
      onUserUpdate(data.user)
      setSuccess(`Email updated to ${data.user.email}`)
      setStep('form')
      setNewEmail('')
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard title="Change Email" description="A verification code will be sent to your new email.">
      {success && <SuccessBanner message={success} />}

      {step === 'form' ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className={labelClass}>New Email Address</label>
            <input
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code sent to <strong className="text-gray-700 dark:text-gray-300">{newEmail}</strong>
          </p>
          <div>
            <label className={labelClass}>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
              className={`${inputClass} text-center text-xl font-bold tracking-widest`}
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => { setStep('form'); setError('') }}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer p-0"
            >
              ← Change email
            </button>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="px-5 py-2.5 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Confirm Change'}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  )
}

// ── Password Section ───────────────────────────────────────────────────────────
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setError('New passwords do not match.')
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.')
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')
      setSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard title="Change Password" description="Enter your current password to set a new one.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}
        <div>
          <label className={labelClass}>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>New Password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Confirm New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className={`${inputClass} ${confirmPassword.length > 0 ? (passwordsMatch ? 'border-emerald-400 focus:border-emerald-500' : 'border-red-400 focus:border-red-500') : ''}`}
            />
            {confirmPassword.length > 0 && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${passwordsMatch ? 'text-emerald-500' : 'text-red-400'}`}>
                {passwordsMatch ? '✓' : '✗'}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

// ── Main Settings Component ────────────────────────────────────────────────────
export default function Settings({ user, onUserUpdate }) {
  return (
    <div className="px-4 md:px-8 py-7 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 m-0">Account Settings</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 m-0">Manage your profile and security preferences.</p>
      </div>
      <div className="flex flex-col gap-5">
        <BillingSection user={user} />
        <ProfileSection user={user} onUserUpdate={onUserUpdate} />
        <EmailSection user={user} onUserUpdate={onUserUpdate} />
        <PasswordSection />
      </div>
    </div>
  )
}
