/**
 * Settings
 * Lets users update their name, change their email (with OTP verification),
 * change their password, and manage their billing plan.
 */
import { useState } from 'react'
import { CheckCircle2, CreditCard, User, Mail, Lock, Check, X } from 'lucide-react'
import { API_URL } from '../config.js'
import { authHeaders, saveSession } from '../auth.js'
import Card from './ui/Card.jsx'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'

function SuccessBanner({ message }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-success-700 dark:text-success-400 px-3.5 py-2.5 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-control text-sm">
      <CheckCircle2 size={16} className="shrink-0" /> {message}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div role="alert" aria-live="polite" className="flex items-center gap-2 text-error-700 dark:text-error-400 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
      {message}
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <Card padding="lg">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-control bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
          {Icon && <Icon size={17} />}
        </div>
        <div>
          <h3 className="text-h3 font-semibold text-slate-900 dark:text-slate-50 m-0">{title}</h3>
          <p className="text-body-sm text-slate-400 dark:text-slate-500 mt-0.5 m-0">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

// ── Billing Section ────────────────────────────────────────────────────────────
const PLAN_BADGE_TONE = { free: 'neutral', trialing: 'info', pro: 'primary' }
const PLAN_LABEL = { free: 'Free Plan', trialing: 'Pro Trial', pro: 'Pro' }

function BillingSection({ user, onUserUpdate }) {
  const [loading, setLoading] = useState(null) // 'trial' | 'monthly' | 'annual' | 'portal'
  const [error, setError] = useState('')

  const isPaid = user.plan === 'pro'
  const isTrialing = user.plan === 'trialing'
  const trialUsed = !isTrialing && !!user.trialEndsAt // free, but already burned their trial

  const daysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt) - new Date()) / (24 * 60 * 60 * 1000)))
    : 0

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
    } catch (err) {
      setError(err.message)
    } finally {
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

  const handleManageSubscription = async () => {
    if (loading) return
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
    <SectionCard icon={CreditCard} title="Billing" description="Manage your subscription and plan.">
      <div className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}

        <div className="flex items-center gap-3">
          <Badge tone={PLAN_BADGE_TONE[user.plan] || 'neutral'}>{PLAN_LABEL[user.plan] || 'Free Plan'}</Badge>
          {isTrialing && (
            <span className="text-[13px] text-slate-400 dark:text-slate-500">
              Trial ends {new Date(user.trialEndsAt).toLocaleDateString()} · {daysLeft} day{daysLeft === 1 ? '' : 's'} left
            </span>
          )}
          {trialUsed && (
            <span className="text-[13px] text-slate-400 dark:text-slate-500">Your trial has ended.</span>
          )}
        </div>

        {isPaid ? (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleManageSubscription} loading={loading === 'portal'}>
              {loading === 'portal' ? 'Opening...' : 'Manage Subscription'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!isTrialing && !trialUsed && (
              <Button variant="primary" onClick={handleStartTrial} loading={loading === 'trial'} className="w-full">
                {loading === 'trial' ? 'Starting trial...' : 'Start free 14-day trial — no card required'}
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={() => handleUpgrade('monthly')} loading={loading === 'monthly'} className="flex-1">
                {loading === 'monthly' ? 'Redirecting...' : 'Subscribe Monthly — $15/mo'}
              </Button>
              <Button variant="primary" onClick={() => handleUpgrade('annual')} loading={loading === 'annual'} className="flex-1">
                {loading === 'annual' ? 'Redirecting...' : 'Subscribe Annually — $99/yr'}
              </Button>
            </div>
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
    if (loading) return
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
    <SectionCard icon={User} title="Profile" description="Update your display name.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="text"
          value={user.email}
          disabled
          helperText="To change your email, use the section below."
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={loading} disabled={name.trim() === user.name}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}

// ── Email Change Section ───────────────────────────────────────────────────────
function EmailSection({ onUserUpdate }) {
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'verify'
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleRequestCode = async (e) => {
    e.preventDefault()
    if (loading) return
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
    if (loading) return
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
    <SectionCard icon={Mail} title="Change Email" description="A verification code will be sent to your new email.">
      {success && <div className="mb-4"><SuccessBanner message={success} /></div>}

      {step === 'form' ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <Input
            label="New Email Address"
            type="email"
            placeholder="new@email.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the 6-digit code sent to <strong className="text-slate-700 dark:text-slate-300">{newEmail}</strong>
          </p>
          <Input
            label="Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            required
            className="text-center text-xl font-bold tracking-widest"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => { setStep('form'); setError('') }}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              ← Change email
            </button>
            <Button type="submit" variant="primary" loading={loading} disabled={code.length < 6}>
              {loading ? 'Verifying...' : 'Confirm Change'}
            </Button>
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
    if (loading) return
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
    <SectionCard icon={Lock} title="Change Password" description="Enter your current password to set a new one.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Input
          label="New Password"
          type="password"
          placeholder="Create a new password"
          helperText="At least 8 characters"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
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
        <h2 className="text-h1 font-bold text-slate-900 dark:text-slate-50 m-0">Account Settings</h2>
        <p className="text-body-sm text-slate-400 dark:text-slate-500 mt-1 m-0">Manage your profile and security preferences.</p>
      </div>
      <div className="flex flex-col gap-6">
        <BillingSection user={user} onUserUpdate={onUserUpdate} />
        <ProfileSection user={user} onUserUpdate={onUserUpdate} />
        <EmailSection onUserUpdate={onUserUpdate} />
        <PasswordSection />
      </div>
    </div>
  )
}
