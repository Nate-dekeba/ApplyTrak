/**
 * JobCard
 * Renders a single job application in either card or table-row format,
 * controlled by the `viewMode` prop.
 *
 * Delete confirmation is handled here (UI concern), but the actual
 * API call and state update live in App.jsx via the onDelete prop.
 */
import { ExternalLink, MapPin, Briefcase, Calendar } from 'lucide-react'
import CompanyAvatar from './CompanyAvatar.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import { getRelativeDate } from '../utils/dateUtils.js'
import { STATUS_STYLES, DEFAULT_STATUS_STYLE } from '../constants/statusStyles.js'

export default function JobCard({ job, onDelete, onEdit, viewMode = 'cards' }) {
    const style  = STATUS_STYLES[job.status] || DEFAULT_STATUS_STYLE
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
            <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                        <CompanyAvatar company={job.company} size="sm" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{job.title}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                {job.company}
                                {job.sourceUrl && (
                                    <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 text-primary-600 hover:text-primary-700" onClick={(e) => e.stopPropagation()}>
                                        View posting <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="py-3.5 px-4 text-[13px] text-slate-500 dark:text-slate-400">{job.location || '--'}</td>
                <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-chip text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                        {job.status}
                    </span>
                </td>
                <td className="py-3.5 px-4 text-[13px] text-slate-500 dark:text-slate-400">{job.jobType || '--'}</td>
                <td className="py-3.5 px-4 text-xs text-slate-400 dark:text-slate-500">{relDate}</td>
                <td className="py-3.5 px-3">
                    <div className="flex gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(job)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={handleDeleteJob}>Delete</Button>
                    </div>
                </td>
            </tr>
        )
    }

    /* ── Card view ── */
    return (
        <Card
            padding="lg"
            hoverable
            className={`border-l-[3px] ${style.border} hover:-translate-y-0.5 transition-transform duration-200 animate-fadeIn`}
        >
            {/* Header: avatar + title + status badge */}
            <div className="flex gap-3.5 mb-3.5">
                <CompanyAvatar company={job.company} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">{job.title}</div>
                            <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{job.company}</span>
                                {job.sourceUrl && (
                                    <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 text-xs text-primary-600 hover:text-primary-700 shrink-0">
                                        View posting <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-chip text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
                            {job.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detail tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {job.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-chip bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={11} />{job.location}
                    </span>
                )}
                {job.jobType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-chip bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                        <Briefcase size={11} />{job.jobType}
                    </span>
                )}
                {job.dateApplied && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-chip bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar size={11} />{relDate}
                    </span>
                )}
            </div>

            {/* Notes preview */}
            {job.notes && (
                <div className="text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-control p-3 mb-3.5 border-l-[3px] border-slate-200 dark:border-slate-700 leading-relaxed line-clamp-3">
                    {job.notes}
                </div>
            )}

            {/* Footer: date + actions */}
            <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-300 dark:text-slate-600">{job.dateApplied}</span>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit(job)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteJob}>Delete</Button>
                </div>
            </div>
        </Card>
    )
}
