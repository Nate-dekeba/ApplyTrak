import { useState } from "react";
import JobFormPopUp from "./JobFormPopUp";
import { API_URL } from '../config.js';


export default function AddJob ({onJobAdded, userId}){

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
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({title, company, location, status, dateApplied, jobType, notes, userId})
            })
            const data = await response.json()
            if (!response.ok){
                throw new Error(data.error || 'Failed to add job.')
            }

            onJobAdded(data.job)
            setTitle('')
            setCompany('')
            setLocation('')
            setStatus('Applied')
            setdateApplied('')
            setJobType('')
            setNotes('')
        }catch(err){
            setError(err.message)
        }finally{
            setLoading(false)
        }
    }




    return (
        <div>
            <form className= "create-job-form" onSubmit={handleSubmit}>
                <h2>Add New Job</h2>
                {error && <p className="error">Error: {error}</p>}
                <input type="text" placeholder="Job Title" value={title}
                    onChange={ (e) => setTitle(e.target.value)} required />
    
                <input type="text" placeholder="Company" value={company}
                    onChange={ (e) => setCompany(e.target.value)} required />
                
                <input type="text" placeholder="Location" value={location}
                    onChange= {(e) => setLocation(e.target.value)} required />
                
                <input type="date" placeholder="Date Applied" value={dateApplied}
                    onChange= {(e) => setdateApplied(e.target.value)} required />
                
                <select value={status} onChange={(e) => setStatus(e.target.value)} required >
                    <option value = "Applied">Applied</option>
                    <option value = "Interviewing">Interviewing</option>
                    <option value = "Offered">Offered</option>
                    <option value = "Rejected">Rejected</option>
                </select>
                
                <select value ={jobType} onChange={(e) => setJobType(e.target.value)} required>
                    <option value = "Full Time">Full Time</option>
                    <option value = "Part Time">Part Time</option>
                    <option value = "Contract">Contract</option>
                    <option value = "Internship">Internship</option>
                </select>

                <textarea placeholder="Notes" value={notes}
                    onChange={(e) => setNotes(e.target.value)} >
                </textarea>
                
                <button type="submit" disabled={loading}>
                    {loading ? "Adding Job..." : "Add Job"}
                </button>
            </form>
        </div>
    )
}