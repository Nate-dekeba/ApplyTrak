/**
 * JobCard
 * Renders a single job application in either card or table-row format,
 * controlled by the `viewMode` prop.
 *
 * Delete confirmation is handled here (UI concern), but the actual
 * API call and state update live in App.jsx via the onDelete prop.
 */
import CompanyAvatar from './CompanyAvatar.jsx'
import { getRelativeDate } from '../utils/dateUtils.js'

// Status-to-style mapping — keeps conditional classes out of JSX
const STATUS_STYLES = {
    Applied:      { badge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',     border: 'border-l-blue-500' },
    Interviewing: { badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', border: 'border-l-amber-500' },
    Offered:      { badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', border: 'border-l-emerald-500' },
    Rejected:     { badge: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',         border: 'border-l-red-500' },
}

export default function JobCard({ job, onDelete, onEdit, viewMode = 'cards' }) {
    const style  = STATUS_STYLES[job.status] || STATUS_STYLES.Applied
    const relDate = getRelativeDate(job.dateApplied)

    // Confirm before delegating the delete to the parent
    const handleDeleteJob = () => {
        if (window.confirm(`Delete "${job.title}" at ${job.company}?`)) {
            onDelete(job.id)
        }
    }

    /* ── Table row view ── */
    if (viewMode === 'table') {
        return (
            <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                        <CompanyAvatar company={job.company} size="sm" />
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.title}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{job.company}</div>
                        </div>
                    </div>
                </td>
                <td className="py-3.5 px-4 text-[13px] text-gray-500 dark:text-gray-400">{job.location || '--'}</td>
                <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                        {job.status}
                    </span>
                </td>
                <td className="py-3.5 px-4 text-[13px] text-gray-500 dark:text-gray-400">{job.jobType || '--'}</td>
                <td className="py-3.5 px-4 text-xs text-gray-400 dark:text-gray-500">{relDate}</td>
                <td className="py-3.5 px-3">
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => onEdit(job)}
                            className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteJob}
                            className="px-3 py-1 rounded-md border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 text-red-500 text-xs font-medium cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        )
    }

    /* ── Card view ── */
    return (
        <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-[3px] ${style.border} rounded-[14px] p-[22px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn`}>
            {/* Header: avatar + title + status badge */}
            <div className="flex gap-3.5 mb-3.5">
                <CompanyAvatar company={job.company} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <div className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug truncate">{job.title}</div>
                            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</div>
                        </div>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                            {job.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detail tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {job.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        📍 {job.location}
                    </span>
                )}
                {job.jobType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        💼 {job.jobType}
                    </span>
                )}
                {job.dateApplied && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        📅 {relDate}
                    </span>
                )}
            </div>

            {/* Notes preview */}
            {job.notes && (
                <div className="text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3.5 border-l-[3px] border-gray-200 dark:border-gray-700 leading-relaxed">
                    {job.notes}
                </div>
            )}

            {/* Footer: date + actions */}
            <div className="flex justify-between items-center pt-3.5 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-300 dark:text-gray-600">{job.dateApplied}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(job)}
                        className="px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDeleteJob}
                        className="px-3.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-medium cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
