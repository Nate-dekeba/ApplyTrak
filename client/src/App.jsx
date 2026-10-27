/**
 * App — root component
 * Owns all application state and data-fetching logic.
 * Child components receive data and callbacks as props;
 * they do not call the API directly (except AddJob and UpdateJob forms,
 * which own their own submission lifecycle).
 *
 * Auth flow:
 *   Landing → SignUp/Login → Dashboard
 *   After signup, the WelcomeModal is shown once.
 *
 * View modes: 'cards' | 'table' | 'kanban'
 */
import { useState, useEffect } from 'react'
import { Menu, Plus, Search, LayoutGrid, Table as TableIcon, Columns3, FileText, SearchX } from 'lucide-react'
import Button from './Components/ui/Button.jsx'
import Input from './Components/ui/Input.jsx'
import Select from './Components/ui/Select.jsx'
import EmptyState from './Components/ui/EmptyState.jsx'
import JobCard from './Components/JobCard.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/SignUp.jsx'
import AddJob from './Components/AddJob.jsx'
import UpdateJob from './Components/UpdateJob.jsx'
import JobFormPopUp from './Components/JobFormPopUp.jsx'
import Sidebar from './Components/Sidebar.jsx'
import StatCards from './Components/StatCards.jsx'
import PipelineBar from './Components/PipelineBar.jsx'
import KanbanBoard from './Components/KanbanBoard.jsx'
import LandingPage from './Components/LandingPage.jsx'
import WelcomeModal from './Components/WelcomeModal.jsx'
import Settings from './Components/Settings.jsx'
import ForgotPassword from './Components/ForgotPassword.jsx'
import ResetPassword from './Components/ResetPassword.jsx'
import VerifyEmail from './Components/VerifyEmail.jsx'
import UpgradeModal from './Components/UpgradeModal.jsx'
import { API_URL } from './config.js'
import { getSavedUser, saveSession, clearSession, authHeaders } from './auth.js'
import { JOB_STATUSES } from './constants/jobStatuses.js'
import { FREE_JOB_LIMIT, isProActive } from './constants/plans.js'

const VIEW_TOGGLE_OPTIONS = [
  { mode: 'cards', label: 'Cards', Icon: LayoutGrid },
  { mode: 'table', label: 'Table', Icon: TableIcon },
  { mode: 'kanban', label: 'Kanban', Icon: Columns3 },
]

function getSavedDarkMode() {
  try {
    return localStorage.getItem('darkMode') === 'true'
  } catch {
    return false
  }
}

export default function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(getSavedUser)
  const [showLogin, setShowLogin] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [activeView, setActiveView] = useState('applications')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(getSavedDarkMode)
  const [showLanding, setShowLanding] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  const [pendingPlan, setPendingPlan] = useState(null) // 'monthly' | 'annual' — set when a landing pricing card is clicked
  const [checkoutRedirecting, setCheckoutRedirecting] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const resetToken = new URLSearchParams(window.location.search).get('token')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (user) fetchJobs()
  }, [user])

  // After returning from Stripe checkout, refetch the profile so plan/trialEndsAt
  // reflect the webhook update instead of the stale values from last login.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutStatus = params.get('checkout')
    if (!checkoutStatus) return

    params.delete('checkout')
    const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
    window.history.replaceState({}, '', cleanUrl)

    if (checkoutStatus === 'success') {
      fetch(`${API_URL}/api/user/me`, { headers: authHeaders() })
        .then((resp) => (resp.ok ? resp.json() : Promise.reject(new Error('Failed to refresh profile'))))
        .then(({ user: freshUser, token }) => {
          saveSession(token, freshUser)
          setUser(freshUser)
        })
        .catch((err) => console.error('Failed to refresh user after checkout:', err))
    }
  }, [])

  // If the user picked a plan on the landing page before signing up/logging in,
  // fire checkout automatically once they have a session instead of dropping them on the free dashboard.
  useEffect(() => {
    if (!user || !pendingPlan) return
    if (user.plan !== 'free') { setPendingPlan(null); return }

    const plan = pendingPlan
    setPendingPlan(null)
    setCheckoutRedirecting(true)

    fetch(`${API_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ plan }),
    })
      .then((resp) => (resp.ok ? resp.json() : Promise.reject(new Error('Failed to start checkout'))))
      .then(({ url }) => { window.location.href = url })
      .catch((err) => {
        console.error('Failed to start checkout after signup:', err)
        setCheckoutRedirecting(false)
      })
  }, [user, pendingPlan])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`${API_URL}/api/jobs`, { headers: authHeaders() })
      if (!resp.ok) throw new Error('Failed to fetch jobs')
      const data = await resp.json()
      setJobs(data.jobs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => setUser(userData)

  const handleLogout = () => {
    clearSession()
    setUser(null)
    setJobs([])
  }

  const handleJobAdded = (newJob) => {
    setJobs((prev) => [...prev, newJob])
    setShowJobForm(false)
  }

  const handleJobUpdated = (updatedJob) => {
    setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
    setEditingJob(null)
  }

  const handleDeleteJob = async (jobId) => {
    try {
      const resp = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!resp.ok) throw new Error('Failed to delete job')
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleStatusUpdate = async (job, newStatus) => {
    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)))
    try {
      const resp = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...job, status: newStatus }),
      })
      if (!resp.ok) throw new Error('Update failed')
    } catch {
      // Revert on failure
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)))
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      (job.location && job.location.toLowerCase().includes(query))
    const matchesStatus = statusFilter === '' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  /* ── Auth / Landing screens ── */
  if (!user) {
    // Email verification — shown after registration
    if (pendingVerificationEmail) {
      return (
        <VerifyEmail
          email={pendingVerificationEmail}
          onVerified={() => {
            setPendingVerificationEmail(null)
            setShowLanding(false)
            setShowLogin(true)
          }}
          onBackToSignup={() => {
            setPendingVerificationEmail(null)
            setShowLogin(false)
          }}
        />
      )
    }

    // Password reset link — takes priority over all other screens
    if (resetToken) {
      return (
        <ResetPassword
          token={resetToken}
          onBackToLogin={() => {
            // Clear the token from the URL and go to login
            window.history.replaceState({}, '', window.location.pathname)
            setShowLanding(false)
            setShowLogin(true)
          }}
        />
      )
    }

    if (showForgotPassword) {
      return (
        <ForgotPassword
          onBackToLogin={() => { setShowForgotPassword(false); setShowLogin(true) }}
        />
      )
    }

    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={(plan) => {
            if (plan) setPendingPlan(plan)
            setShowLanding(false)
            setShowLogin(false)
          }}
          onLogin={() => { setShowLanding(false); setShowLogin(true) }}
        />
      )
    }
    return showLogin ? (
      <Login
        onLogin={handleLogin}
        onSwitchToSignUp={() => setShowLogin(false)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    ) : (
      <Signup onNeedVerification={(email) => setPendingVerificationEmail(email)} onSwitchToLogin={() => setShowLogin(true)} />
    )
  }

  /* ── Redirecting to checkout after picking a plan on the landing page ── */
  if (checkoutRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting you to checkout...</p>
        </div>
      </div>
    )
  }

  const isPro = isProActive(user)
  const atJobLimit = !isPro && jobs.length >= FREE_JOB_LIMIT

  /* ── Main app ── */
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v); setMobileNavOpen(false) }}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        isPro={isPro}
        jobCount={jobs.length}
        jobLimit={FREE_JOB_LIMIT}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-control text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-none bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-h1 font-bold text-slate-900 dark:text-slate-50 m-0">
                {activeView === 'analytics' ? 'Analytics' : activeView === 'settings' ? 'Settings' : 'Applications'}
              </h1>
            </div>
          </div>

          {activeView === 'applications' && (
            <Button
              variant="primary"
              onClick={() => (atJobLimit ? setShowUpgradeModal(true) : setShowJobForm(!showJobForm))}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Job</span>
            </Button>
          )}
        </header>

        {activeView === 'applications' && (
          <div className="px-4 md:px-8 py-7">
            <StatCards jobs={jobs} />
            <PipelineBar jobs={jobs} />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              {/* Search */}
              <div className="flex-1 min-w-[180px]">
                <Input
                  type="text"
                  icon={Search}
                  aria-label="Search applications"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <Select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[140px]"
              >
                <option value="">All Statuses</option>
                {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>

              {/* Result count — shown only when a filter is active */}
              {(statusFilter !== '' || searchQuery !== '') && jobs.length > 0 && (
                <span className="text-[12px] text-slate-400 dark:text-slate-500 whitespace-nowrap tabular-nums">
                  {filteredJobs.length} of {jobs.length}
                </span>
              )}

              {/* View toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-control p-[3px]">
                {VIEW_TOGGLE_OPTIONS.map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setViewMode(item.mode)}
                    className={[
                      'flex items-center gap-1 px-3 py-1.5 rounded-control border-none cursor-pointer text-xs font-semibold transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                      viewMode === item.mode
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-soft-xs'
                        : 'bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400',
                    ].join(' ')}
                  >
                    <item.Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="flex items-center gap-2 text-primary-600 text-sm py-3">
                <div className="w-3.5 h-3.5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                Loading jobs...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-error-700 px-3.5 py-2.5 bg-error-50 border border-error-200 rounded-control text-sm mb-4">
                {error}
              </div>
            )}

            {/* Content */}
            {!loading && jobs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No jobs tracked yet."
                description="Hit Add Job to log your first application!"
                actionLabel="Add Job"
                onAction={() => (atJobLimit ? setShowUpgradeModal(true) : setShowJobForm(true))}
              />
            ) : viewMode === 'kanban' ? (
              <KanbanBoard
                jobs={filteredJobs}
                onStatusChange={handleStatusUpdate}
                onEdit={setEditingJob}
              />
            ) : viewMode === 'table' ? (
              <div className="bg-white dark:bg-slate-900 rounded-card border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        {['Position', 'Location', 'Status', 'Type', 'Applied', ''].map((h) => (
                          <th key={h} className="py-3 px-4 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} onDelete={handleDeleteJob} onEdit={setEditingJob} viewMode="table" />
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredJobs.length === 0 && (
                  <EmptyState
                    icon={SearchX}
                    title="No applications match your search."
                    actionLabel="Clear filters"
                    onAction={() => { setSearchQuery(''); setStatusFilter('') }}
                    className="py-12"
                  />
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} onDelete={handleDeleteJob} onEdit={setEditingJob} viewMode="cards" />
                  ))}
                </div>
                {filteredJobs.length === 0 && jobs.length > 0 && (
                  <EmptyState
                    icon={SearchX}
                    title="No applications match your search."
                    description="Try a different keyword or clear filters."
                    actionLabel="Clear filters"
                    onAction={() => { setSearchQuery(''); setStatusFilter('') }}
                    className="py-12"
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="px-4 md:px-8 py-7">
            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
              <div className="text-[48px] mb-4">📊</div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Analytics Coming Soon</p>
              <p className="text-sm mt-2">Track your application trends, response rates, and more.</p>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <Settings
            user={user}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />
        )}

        {/* Welcome modal — shown once after signup */}
        {showWelcome && (
          <WelcomeModal
            user={user}
            onClose={() => setShowWelcome(false)}
            onAddJob={() => { setShowWelcome(false); setShowJobForm(true) }}
          />
        )}

        {/* Modals */}
        {editingJob ? (
          <JobFormPopUp trigger={editingJob} onClose={() => setEditingJob(null)}>
            <UpdateJob job={editingJob} onJobUpdated={handleJobUpdated} />
          </JobFormPopUp>
        ) : (
          <JobFormPopUp trigger={showJobForm} onClose={() => setShowJobForm(false)}>
            <AddJob
              onJobAdded={handleJobAdded}
              onUpgradeNeeded={() => { setShowJobForm(false); setShowUpgradeModal(true) }}
              isPro={isPro}
            />
          </JobFormPopUp>
        )}

        {showUpgradeModal && (
          <UpgradeModal
            user={user}
            onClose={() => setShowUpgradeModal(false)}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />
        )}
      </main>
    </div>
  )
}
