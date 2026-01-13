import { useState } from "react"
import { API_URL } from '../config.js'


export default function UpdateJob ({onJobUpdated, job, userId}) {

    const [title, setTitle] = useState (job.title)
    const [company, setCompany] = useState(job.company)
    const [location, setLocation] = useState(job.location)
    const [status, setStatus] = useState(job.status)
    const [dateApplied, setdateApplied] = useState(job.dateApplied)
    const [jobType, setJobType] = useState(job.jobType)
    const [notes, setNotes] = useState(job.notes)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) =>{
        e.preventDefault()
        setLoading(true)
        setError (null)

        try {
            const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({title, company, location, status, dateApplied, jobType, notes, userId})
            })
            const data = await response.json()
            if (!response.ok){
                throw new Error(data.error || 'Failed to update job.')
            }
            // Backend returns the updated job object (following REST pattern)
            onJobUpdated(data.job)
        }catch(err){
            setError(err.message)
        }finally{
            setLoading(false)
        }
    }

    return (
        <div>
            <form className="create-job-form" onSubmit={handleSubmit}>
                <h2 className="update-form">Update Job</h2>
                {error && <p className="error">Error: {error}</p>}
                <input type="text" placeholder="Job Title" value={title}
                    onChange={(e) => setTitle(e.target.value)} required />

                <input type="text" placeholder="Company" value={company}
                    onChange={(e) => setCompany(e.target.value)} required />

                <input type="text" placeholder="Location" value={location}
                    onChange={(e) => setLocation(e.target.value)} required />

                <input type="date" placeholder="Date Applied" value={dateApplied}
                    onChange={(e) => setdateApplied(e.target.value)} required />

                <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <select value={jobType} onChange={(e) => setJobType(e.target.value)} required>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                </select>

                <textarea placeholder="Notes" value={notes}
                    onChange={(e) => setNotes(e.target.value)}>
                </textarea>

                <button type="submit" disabled={loading}>
                    {loading ? "Updating Job..." : "Update Job"}
                </button>
            </form>
        </div>
    )


}