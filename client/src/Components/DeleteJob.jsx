import { useState } from 'react'
import { API_URL } from '../config.js'

export default function DeleteJob({onDeleteJob}){

    const [title, setTitle] = useState('')
    const [company, setCompany] = useState('')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState('Applied')
    const [dateApplied, setdateApplied] = useState('')
    const [jobType, setJobType] = useState('')
    const [notes, setNotes] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        


        try {
            const response = await fetch(`${API_URL}/api/jobs`,{
                method: 'DELETE', 
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({title, company, location, status, dateApplied, jobType, notes})
            })
            const data = await response.json()
            if (!response.ok){
                throw new Error(data.error || 'Failed to delete job.' )
            }
            onDeleteJob(data.job)
            setTitle('')
            setCompany('')
            setLocation('')
            setStatus('Applied')
            setdateApplied('')
            setJobType('')
            setNotes('')
        }catch(err){
            setError(err.message)
        }
        finally{
            setLoading(false)
        }
    }
    return ( 
        <div>
            <form className="delete-job" onhandleSubmit={handleSubmit}>
                <h2>Delete Job</h2>
                {error && <p className="error">Error: {error}</p>}
                <input type="text" placeholder="Job Title" value={title}
                    onChange={ (e) => setTitle(e.target.value)} required />
                
                <input type="text" placeholder="Company" value={company}
                    onChange={ (e) => setCompany(e.target.value)} required />
                
                <input type="text" placeholder="Location" value={location}
                    onChange={ (e) => setLocation(e.target.value)} />
                
                <input type="date" placeholder="Date Applied" value={dateApplied}
                    onChange= {(e) => setdateApplied(e.target.value)} required />
                
                <select value={status} onChange={(e) => setStatus(e.target.value)} required >
                    <option value = "Applied">Applied</option>
                    <option value = "Interviewing">Interviewing</option>
                    <option value = "Offered">Offered</option>
                    <option value = "Rejected">Rejected</option>
                </select>
                
                <input type="text" placeholder="Job Type" value={jobType}
                    onChange= {(e) => setJobType(e.target.value)} />
                
                <textarea placeholder="Notes" value={notes}
                    onChange= {(e) => setNotes(e.target.value)} ></textarea>
                
                <button type="submit" disabled={loading}>
                    {loading ? "Deleting..." : "Delete Job"}
                </button>
            </form>
        </div>
    )
}