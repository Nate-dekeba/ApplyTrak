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
import Input from './ui/Input.jsx'
import Select from './ui/Select.jsx'
import Textarea from './ui/Textarea.jsx'
import Button from './ui/Button.jsx'

export default function UpdateJob({ job, onJobUpdated }) {
    const [title, setTitle]           = useState(job.title)
    const [company, setCompany]       = useState(job.company)
    const [location, setLocation]     = useState(job.location)
    const [status, setStatus]         = useState(job.status)
    const [dateApplied, setDateApplied] = useState(job.dateApplied)
    const [jobType, setJobType]       = useState(job.jobType)
    const [notes, setNotes]           = useState(job.notes)
    const [sourceUrl, setSourceUrl]   = useState(job.sourceUrl || '')
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
                body: JSON.stringify({ title, company, location, status, dateApplied, jobType, notes, sourceUrl }),
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-h2 font-bold text-slate-900 dark:text-slate-100 m-0 mb-1">Update Job</h2>

            {error && (
                <div className="flex items-center gap-2 text-error-700 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <Input label="Job Title *" type="text" placeholder="Job Title" value={title}
                    onChange={(e) => setTitle(e.target.value)} required />
                <Input label="Company *" type="text" placeholder="Company" value={company}
                    onChange={(e) => setCompany(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input label="Location *" type="text" placeholder="Location" value={location}
                    onChange={(e) => setLocation(e.target.value)} required />
                <Input label="Date Applied *" type="date" value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} required>
                    {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select label="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)} required>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                </Select>
            </div>

            <Textarea
                label="Notes"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />

            <Input label="Source URL" type="url" placeholder="https://company.com/careers/job-123" value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)} />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Job'}
            </Button>
        </form>
    )
}
