import { API_URL } from '../config.js'

export default function JobCard({job, onDelete, onEdit}) {

    const handleDeleteJob = async () => {
        if (window.confirm(`Delete ${job.title} at ${job.company}?`)) {
            try {
                const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
                    method: 'DELETE'})
                if (!response.ok){
                    throw new Error ('Failed to delete job.')
                }
                onDelete(job.id)
            } catch (err) {
                alert(`Error: ${err.message}`)
        
            }
        }
    }




    return (
        <div className= "job-card">
            <h3> {job.title} at {job.company}</h3>
            <p><strong>Status: </strong>{job.status}</p>
            <p><strong>Date Applied: </strong> {job.dateApplied}</p> 
            {job.location && <p><strong>Location: </strong>{job.location}</p>}
            {job.jobType && <p><strong>Job Type: </strong>{job.jobType}</p>}
            {job.notes && <p><strong>Notes: </strong>{job.notes}</p>}
            <button onClick={() => onEdit(job)} className="edit-button">Edit</button>
            <button onClick={handleDeleteJob} className="delete-button">Delete</button>
        </div>
    )
}