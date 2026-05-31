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
import ForgotPassword from './Components/ForgotPassword.jsx'
import ResetPassword from './Components/ResetPassword.jsx'
import VerifyEmail from './Components/VerifyEmail.jsx'
import { API_URL } from './config.js'
import { getSavedUser, clearSession, authHeaders } from './auth.js'
import { JOB_STATUSES } from './constants/jobStatuses.js'

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

  const urlParams = new URLSearchParams(window.location.search)
  const resetToken = urlParams.get('token')
  const verifyToken = urlParams.get('verify')

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

  const handleSignup = (userData) => {
    setUser(userData)
    setShowWelcome(true)
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
    // Email verification link
    if (verifyToken) {
      return (
        <VerifyEmail
          token={verifyToken}
          onBackToLogin={() => {
            window.history.replaceState({}, '', window.location.pathname)
            setShowLanding(false)
            setShowLogin(true)
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
          onGetStarted={() => { setShowLanding(false); setShowLogin(false) }}
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
      <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowLogin(true)} />
    )
  }

  /* ── Main app ── */
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
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
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 m-0">
                {activeView === 'analytics' ? 'Analytics' : activeView === 'settings' ? 'Settings' : 'Applications'}
              </h1>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5 m-0">
                {activeView === 'applications'
                  ? `${filteredJobs.length} of ${jobs.length} applications`
                  : `Welcome back, ${user.name}`}
              </p>
            </div>
          </div>

          {activeView === 'applications' && (
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="flex items-center gap-1.5 px-4 md:px-5 py-2.5 rounded-[10px] border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[13px] font-semibold cursor-pointer shadow-[0_2px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200"
            >
              <span className="text-[17px] leading-none font-normal">+</span>
              <span className="hidden sm:inline">Add Job</span>
            </button>
          )}
        </header>

        {activeView === 'applications' && (
          <div className="px-4 md:px-8 py-7">
            <StatCards jobs={jobs} />
            <PipelineBar jobs={jobs} />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              {/* Search */}
              <div className="flex-1 min-w-[180px] relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-3.5 rounded-[10px] border border-gray-200 dark:border-gray-700 text-[13px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-3.5 rounded-[10px] border border-gray-200 dark:border-gray-700 text-[13px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer min-w-[140px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
              >
                <option value="">All Statuses</option>
                {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* View toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-[10px] p-[3px]">
                {[
                  {
                    mode: 'cards', label: 'Cards',
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
                  },
                  {
                    mode: 'table', label: 'Table',
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
                  },
                  {
                    mode: 'kanban', label: 'Kanban',
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" /></svg>,
                  },
                ].map(({ mode, label, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={[
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg border-none cursor-pointer text-xs font-semibold transition-all duration-150',
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'bg-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400',
                    ].join(' ')}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="flex items-center gap-2 text-blue-500 text-sm py-3">
                <div className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                Loading jobs...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-700 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Content */}
            {!loading && jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                <div className="text-[40px] mb-3">📝</div>
                <p className="text-[15px] font-medium dark:text-gray-400">No jobs tracked yet.</p>
                <p className="text-[13px] mt-1">
                  Hit <strong className="text-gray-600 dark:text-gray-300">+ Add Job</strong> to log your first application!
                </p>
              </div>
            ) : viewMode === 'kanban' ? (
              <KanbanBoard
                jobs={filteredJobs}
                onStatusChange={handleStatusUpdate}
                onEdit={setEditingJob}
              />
            ) : viewMode === 'table' ? (
              <div className="bg-white dark:bg-gray-900 rounded-[14px] border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      {['Position', 'Location', 'Status', 'Type', 'Applied', ''].map((h) => (
                        <th key={h} className="py-3 px-4 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
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
                {filteredJobs.length === 0 && (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                    <p className="text-sm font-medium">No applications match your search.</p>
                  </div>
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
                  <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                    <div className="text-[40px] mb-3">🔍</div>
                    <p className="text-[15px] font-medium dark:text-gray-400">No applications match your search.</p>
                    <p className="text-[13px] mt-1">Try a different keyword or clear filters.</p>
                  </div>
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
          <div className="px-4 md:px-8 py-7">
            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
              <div className="text-[48px] mb-4">⚙️</div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Settings Coming Soon</p>
              <p className="text-sm mt-2">Manage your profile, notifications, and preferences.</p>
            </div>
          </div>
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
            <AddJob onJobAdded={handleJobAdded} />
          </JobFormPopUp>
        )}
      </main>
    </div>
  )
}
