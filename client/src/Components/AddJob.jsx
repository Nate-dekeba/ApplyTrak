/**
 * AddJob
 * Form for logging a new job application.
 * On successful submission, calls onJobAdded(newJob) so the parent
 * can append the job to its list without a full refetch, then resets the form.
 */
import { useState } from 'react'
import { API_URL } from '../config.js'
import { authHeaders } from '../auth.js'
import { JOB_STATUSES } from '../constants/jobStatuses.js'

export default function AddJob({ onJobAdded, onUpgradeNeeded, isPro }) {
    const [title, setTitle]           = useState('')
    const [company, setCompany]       = useState('')
    const [location, setLocation]     = useState('')
    const [status, setStatus]         = useState('Applied')
    const [dateApplied, setDateApplied] = useState('')
    const [jobType, setJobType]       = useState('Full Time')
    const [notes, setNotes]           = useState('')
    const [sourceUrl, setSourceUrl]   = useState('')
    const [error, setError]           = useState(null)
    const [atFreeLimit, setAtFreeLimit] = useState(false)
    const [loading, setLoading]       = useState(false)

    const [importUrl, setImportUrl]   = useState('')
    const [importLoading, setImportLoading] = useState(false)
    const [importNote, setImportNote] = useState('')

    const handleImport = async () => {
        if (!importUrl.trim()) return
        if (!isPro) { onUpgradeNeeded?.(); return }

        setImportLoading(true)
        setImportNote('')
        try {
            const response = await fetch(`${API_URL}/api/jobs/import-url`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ url: importUrl.trim() }),
            })
            const data = await response.json()
            if (!response.ok) {
                if (data.error === 'PRO_FEATURE_REQUIRED') { onUpgradeNeeded?.(); return }
                throw new Error(data.error || 'Failed to import that link.')
            }

            setSourceUrl(data.url || importUrl.trim())

            if (data.extracted) {
                if (!title) setTitle(data.title || '')
                if (!company) setCompany(data.company || '')
                if (!location) setLocation(data.location || '')
                if (!notes) setNotes(data.notes || '')
            } else {
                setImportNote("Couldn't auto-fill from that link — add the details manually. We saved the link.")
            }
        } catch (err) {
            setImportNote(err.message)
        } finally {
            setImportLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setAtFreeLimit(false)

        try {
            const response = await fetch(`${API_URL}/api/jobs`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ title, company, location, status, dateApplied, jobType, notes, sourceUrl }),
            })
            const data = await response.json()
            if (!response.ok) {
                if (data.error === 'FREE_PLAN_LIMIT') {
                    setAtFreeLimit(true)
                    throw new Error(data.message || `You've reached the Free plan's ${data.limit}-application limit.`)
                }
                throw new Error(data.error || 'Failed to add job.')
            }

            onJobAdded(data.job)

            // Reset form to defaults
            setTitle('')
            setCompany('')
            setLocation('')
            setStatus('Applied')
            setDateApplied('')
            setJobType('Full Time')
            setNotes('')
            setSourceUrl('')
            setImportUrl('')
            setImportNote('')
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0 mb-1">Add New Job</h2>

            {error && (
                <div className="flex items-center justify-between gap-3 text-red-700 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    <span>{error}</span>
                    {atFreeLimit && onUpgradeNeeded && (
                        <button
                            type="button"
                            onClick={onUpgradeNeeded}
                            className="shrink-0 text-red-700 dark:text-red-400 font-semibold underline bg-transparent border-none cursor-pointer p-0"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
            )}

            {/* Import from a job link */}
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10 p-3.5">
                <label className={`${labelClass} flex items-center gap-1.5`}>
                    Paste a job link to auto-fill
                    {!isPro && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            Pro
                        </span>
                    )}
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="https://company.com/careers/job-123"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={importLoading || !importUrl.trim()}
                        className="shrink-0 px-4 py-2.5 rounded-lg border-none bg-indigo-600 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {importLoading ? 'Importing...' : 'Import'}
                    </button>
                </div>
                {importNote && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-0">{importNote}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Job Title *</label>
                    <input type="text" placeholder="e.g. Frontend Engineer" value={title}
                        onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Company *</label>
                    <input type="text" placeholder="e.g. Stripe" value={company}
                        onChange={(e) => setCompany(e.target.value)} required className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Location *</label>
                    <input type="text" placeholder="e.g. Remote" value={location}
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
                    placeholder="Any notes about this application..."
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
                {loading ? 'Adding Job...' : 'Add Job'}
            </button>
        </form>
    )
}
