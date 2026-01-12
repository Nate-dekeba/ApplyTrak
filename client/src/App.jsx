import { useState, useEffect } from 'react'
import JobCard from './Components/JobCard.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/SignUp.jsx'
import AddJob from './Components/AddJob.jsx'
import UpdateJob from './Components/UpdateJob.jsx'
import DeleteJob from './Components/DeleteJob.jsx'
import JobSearchBar from './Components/JobSearchBar.jsx'
import SelectFilterByStatus from './Components/SelectFilterByStatus.jsx'
import JobFormPopUp from './Components/JobFormPopUp.jsx' 




export default function App() {

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user , setUser] = useState(null) 
  const [showLogin, setShowLogin] = useState (true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState (null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (user){
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`http://localhost:3000/api/jobs?userId=${user.id}`)
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
  }

  const handleLogin = (userData) =>{
    setUser(userData)
  }

  const handleLogout = () => {
    setUser (null)
    setJobs ([])
  }

  const handleJobAdded = (newJob) => {
    setJobs (prevJobs => [...prevJobs, newJob])
    setShowJobForm(false)
  }

  const handleJobUpdated = (updatedJob) => {
    setJobs (prevJobs => prevJobs.map (job => job.id == updatedJob.id ? updatedJob : job))
    setEditingJob (null)
  }

  const handleDeleteJob = (jobId) => {
    setJobs (prevJobs => prevJobs.filter (job => job.id !== jobId))
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
  }

  // Filter jobs for display based on search query AND status filter
  const filteredJobs = jobs.filter(job => {
    // First, apply search query filter
    const query = searchQuery.toLowerCase()
    const matchesSearch = (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      (job.location && job.location.toLowerCase().includes(query))
    )
    // Then, apply status filter (if one is selected)
    const matchesStatus = statusFilter === '' || job.status === statusFilter

    // Job must match both filters
    return matchesSearch && matchesStatus
  })




  if (!user){
    return showLogin ? (
      <Login onLogin={handleLogin} onSwitchToSignUp={() => setShowLogin(false)} />
    ) : (
      <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowLogin(true)} />
    )
  }

  return (
    <div className="container">
      <h1 className='logo-name'>ApplyTrack</h1>
      <button onClick={handleLogout} className="logout-button">Logout</button>

      {loading && <p className="loading">Loading..</p>}
      {error && <p className="error">Error: {error}</p>}

      <div>
        <h2>Your Jobs ({filteredJobs.length}{(searchQuery || statusFilter) && ` of ${jobs.length}`})</h2>

        {jobs.length >= 0 && (
          <div className="filters-container">
            <JobSearchBar className='Search-bar'onSearch={handleSearch} />
            <SelectFilterByStatus className='status-dropdown' onFilter={handleStatusFilter} />
            {!editingJob && (
              <button onClick={() => setShowJobForm(!showJobForm)} className="toggle-job-button">
                {showJobForm ? 'Cancel' : 'Add Job'}
              </button>
            )}
          </div>
        )}

        {jobs.length === 0 ? (
          <p>No jobs yet. Add your first job!</p>) : (
          <div className="jobs-grid">

            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} onDelete={handleDeleteJob} onEdit={setEditingJob} />
            ))}
          </div>
        )}
        {editingJob ? (
        <div>
          <JobFormPopUp trigger={editingJob} onClose={() => setEditingJob(null)}>
            <UpdateJob job={editingJob} onJobUpdated={handleJobUpdated} userId={user.id} />
          </JobFormPopUp>

        </div>
      ) : (
        <>
          <JobFormPopUp trigger={showJobForm} onClose={() => setShowJobForm(false)}>
            <AddJob onJobAdded={handleJobAdded} userId={user.id} />
          </JobFormPopUp>
        </>
      )}
      </div>
    </div>
  )
}


