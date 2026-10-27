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
import Input from './ui/Input.jsx'
import Select from './ui/Select.jsx'
import Textarea from './ui/Textarea.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'

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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-h2 font-bold text-slate-900 dark:text-slate-100 m-0 mb-1">Add New Job</h2>

            {error && (
                <div className="flex items-center justify-between gap-3 text-error-700 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
                    <span>{error}</span>
                    {atFreeLimit && onUpgradeNeeded && (
                        <button
                            type="button"
                            onClick={onUpgradeNeeded}
                            className="shrink-0 text-error-700 dark:text-error-400 font-semibold underline bg-transparent border-none cursor-pointer p-0"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
            )}

            {/* Import from a job link */}
            <div className="rounded-control border border-primary-100 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-900/10 p-3.5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Paste a job link to auto-fill
                    {!isPro && <Badge tone="primary">Pro</Badge>}
                </label>
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder="https://company.com/careers/job-123"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleImport}
                        loading={importLoading}
                        disabled={!importUrl.trim()}
                        className="shrink-0"
                    >
                        Import
                    </Button>
                </div>
                {importNote && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-0">{importNote}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input label="Job Title *" type="text" placeholder="e.g. Frontend Engineer" value={title}
                    onChange={(e) => setTitle(e.target.value)} required />
                <Input label="Company *" type="text" placeholder="e.g. Stripe" value={company}
                    onChange={(e) => setCompany(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input label="Location *" type="text" placeholder="e.g. Remote" value={location}
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
                placeholder="Any notes about this application..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
                {loading ? 'Adding Job...' : 'Add Job'}
            </Button>
        </form>
    )
}
