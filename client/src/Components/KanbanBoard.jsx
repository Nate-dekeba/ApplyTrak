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
 *
 * Keyboard-accessible alternative: dragging has no keyboard equivalent,
 * so every card's "Edit" button opens the same status dropdown used
 * elsewhere in the app — that's the keyboard-operable path to move a card
 * between columns without drag-and-drop.
 */
import { useState } from 'react'
import CompanyAvatar from './CompanyAvatar.jsx'
import Card from './ui/Card.jsx'
import { getRelativeDate } from '../utils/dateUtils.js'
import { JOB_STATUSES } from '../constants/jobStatuses.js'
import { STATUS_STYLES } from '../constants/statusStyles.js'

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
            {JOB_STATUSES.map((status) => {
                const style   = STATUS_STYLES[status]
                const colJobs = jobs.filter((j) => j.status === status)
                const isOver  = dragOverColumn === status

                return (
                    <div
                        key={status}
                        className={[
                            'flex-shrink-0 w-[272px] flex flex-col rounded-card',
                            'border border-slate-200 dark:border-slate-700 border-t-[3px]',
                            style.topBorder,
                            'bg-slate-50 dark:bg-slate-800/50',
                            'transition-all duration-150',
                            isOver ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-slate-900' : '',
                        ].join(' ')}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragLeave={() => setDragOverColumn(null)}
                    >
                        {/* Column header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{status}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.countBadge}`}>
                                {colJobs.length}
                            </span>
                        </div>

                        {/* Draggable job cards */}
                        <div className="flex flex-col gap-2.5 p-3 min-h-[200px]">
                            {colJobs.map((job) => (
                                <Card
                                    key={job.id}
                                    padding="sm"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, job.id)}
                                    onDragEnd={handleDragEnd}
                                    className={[
                                        'cursor-grab active:cursor-grabbing select-none',
                                        'hover:shadow-soft-sm transition-all duration-150',
                                        draggedJobId === job.id ? 'opacity-40 scale-95' : 'opacity-100',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start gap-2.5 mb-2">
                                        <CompanyAvatar company={job.company} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">
                                                {job.title}
                                            </div>
                                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{job.company}</div>
                                        </div>
                                    </div>

                                    {job.location && (
                                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 truncate">
                                            {job.location}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            {getRelativeDate(job.dateApplied)}
                                        </span>
                                        <button
                                            onClick={() => onEdit(job)}
                                            className="text-[10px] px-2.5 py-0.5 rounded-chip border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer bg-white dark:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </Card>
                            ))}

                            {/* Empty column drop target */}
                            {colJobs.length === 0 && (
                                <div
                                    className={[
                                        'flex-1 rounded-control border-2 border-dashed',
                                        'flex items-center justify-center py-10',
                                        'text-[12px] transition-colors duration-150',
                                        isOver
                                            ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10 text-primary-500'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600',
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
