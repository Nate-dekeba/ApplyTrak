/**
 * UpdateJob
 * Pre-populated form for editing an existing job application.
 * Initialized with the current job data and calls onJobUpdated(updatedJob)
 * on success so the parent can update its list in place.
 */
import { useState } from 'react'
import { API_URL } from '../config.js'
import { authHeaders } from '../auth.js'
import { JOB_STATUSES } from '../constants/jobStatuses.js'

export default function UpdateJob({ job, onJobUpdated }) {
    const [title, setTitle]           = useState(job.title)
    const [company, setCompany]       = useState(job.company)
    const [location, setLocation]     = useState(job.location)
    const [status, setStatus]         = useState(job.status)
    const [dateApplied, setDateApplied] = useState(job.dateApplied)
    const [jobType, setJobType]       = useState(job.jobType)
    const [notes, setNotes]           = useState(job.notes)
    const [error, setError]           = useState(null)
    const [loading, setLoading]       = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ title, company, location, status, dateApplied, jobType, notes }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to update job.')
            onJobUpdated(data.job)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full py-2.5 px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
    const labelClass = "block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5"

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0 mb-1">Update Job</h2>

            {error && (
                <div className="flex items-center gap-2 text-red-700 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Job Title *</label>
                    <input type="text" placeholder="Job Title" value={title}
                        onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Company *</label>
                    <input type="text" placeholder="Company" value={company}
                        onChange={(e) => setCompany(e.target.value)} required className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Location *</label>
                    <input type="text" placeholder="Location" value={location}
                        onChange={(e) => setLocation(e.target.value)} required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Date Applied *</label>
                    <input type="date" value={dateApplied}
                        onChange={(e) => setDateApplied(e.target.value)} required className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} required className={inputClass}>
                        {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Job Type</label>
                    <select value={jobType} onChange={(e) => setJobType(e.target.value)} required className={inputClass}>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-y`}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Updating...' : 'Update Job'}
            </button>
        </form>
    )
}
