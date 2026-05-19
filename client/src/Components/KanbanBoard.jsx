/**
 * KanbanBoard
 * Drag-and-drop board view with one column per job status.
 * Uses the native HTML5 Drag and Drop API — no external library.
 *
 * Flow:
 *  1. User drags a card → draggedJobId is stored in state
 *  2. Dragging over a column highlights it (dragOverColumn)
 *  3. On drop, onStatusChange(job, newStatus) is called in the parent,
 *     which optimistically updates state and syncs with the API
 */
import { useState } from 'react'
import CompanyAvatar from './CompanyAvatar.jsx'
import { getRelativeDate } from '../utils/dateUtils.js'

const COLUMNS = [
    { key: 'Applied',      label: 'Applied',      topColor: 'border-t-blue-500',    countBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { key: 'Interviewing', label: 'Interviewing', topColor: 'border-t-amber-500',   countBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { key: 'Offered',      label: 'Offered',      topColor: 'border-t-emerald-500', countBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { key: 'Rejected',     label: 'Rejected',     topColor: 'border-t-red-500',     countBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
]

export default function KanbanBoard({ jobs, onStatusChange, onEdit }) {
    const [draggedJobId,  setDraggedJobId]  = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)

    const handleDragStart = (e, jobId) => {
        setDraggedJobId(jobId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, columnKey) => {
        e.preventDefault() // required to allow dropping
        e.dataTransfer.dropEffect = 'move'
        setDragOverColumn(columnKey)
    }

    const handleDrop = (e, newStatus) => {
        e.preventDefault()
        const job = jobs.find((j) => j.id === draggedJobId)
        // Only trigger if the status actually changed
        if (job && job.status !== newStatus) {
            onStatusChange(job, newStatus)
        }
        setDraggedJobId(null)
        setDragOverColumn(null)
    }

    const handleDragEnd = () => {
        // Reset drag state if the card is dropped outside a valid column
        setDraggedJobId(null)
        setDragOverColumn(null)
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
            {COLUMNS.map((col) => {
                const colJobs = jobs.filter((j) => j.status === col.key)
                const isOver  = dragOverColumn === col.key

                return (
                    <div
                        key={col.key}
                        className={[
                            'flex-shrink-0 w-[272px] flex flex-col rounded-xl',
                            'border border-gray-200 dark:border-gray-700 border-t-[3px]',
                            col.topColor,
                            'bg-gray-50 dark:bg-gray-800/50',
                            'transition-all duration-150',
                            isOver ? 'ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-gray-900' : '',
                        ].join(' ')}
                        onDragOver={(e) => handleDragOver(e, col.key)}
                        onDrop={(e) => handleDrop(e, col.key)}
                        onDragLeave={() => setDragOverColumn(null)}
                    >
                        {/* Column header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                                {colJobs.length}
                            </span>
                        </div>

                        {/* Draggable job cards */}
                        <div className="flex flex-col gap-2.5 p-3 min-h-[200px]">
                            {colJobs.map((job) => (
                                <div
                                    key={job.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, job.id)}
                                    onDragEnd={handleDragEnd}
                                    className={[
                                        'bg-white dark:bg-gray-800',
                                        'border border-gray-200 dark:border-gray-700',
                                        'rounded-xl p-3.5',
                                        'cursor-grab active:cursor-grabbing',
                                        'shadow-sm hover:shadow-md',
                                        'transition-all duration-150 select-none',
                                        // Fade out the card being dragged
                                        draggedJobId === job.id ? 'opacity-40 scale-95' : 'opacity-100',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start gap-2.5 mb-2">
                                        <CompanyAvatar company={job.company} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug truncate">
                                                {job.title}
                                            </div>
                                            <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{job.company}</div>
                                        </div>
                                    </div>

                                    {job.location && (
                                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 truncate">
                                            <span className="mr-1">📍</span>{job.location}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {getRelativeDate(job.dateApplied)}
                                        </span>
                                        <button
                                            onClick={() => onEdit(job)}
                                            className="text-[10px] px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-gray-800 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Empty column drop target */}
                            {colJobs.length === 0 && (
                                <div
                                    className={[
                                        'flex-1 rounded-lg border-2 border-dashed',
                                        'flex items-center justify-center py-10',
                                        'text-[12px] transition-colors duration-150',
                                        isOver
                                            ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10 text-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600',
                                    ].join(' ')}
                                >
                                    {isOver ? 'Drop here' : 'No applications'}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
