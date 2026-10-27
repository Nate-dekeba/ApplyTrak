/**
 * PipelineBar
 * A segmented horizontal progress bar showing the proportion of jobs
 * in each status, with a color-coded legend below.
 * Segments with 0% are omitted to keep the bar clean.
 */
import { JOB_STATUSES } from '../constants/jobStatuses.js'
import { STATUS_STYLES } from '../constants/statusStyles.js'

export default function PipelineBar({ jobs }) {
    const total = jobs.length

    // Count jobs per status in a single pass
    const stats = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
    }, {})

    return (
        <div className="mb-7">
            {/* Segmented bar */}
            <div className="flex rounded-full overflow-hidden h-2 bg-slate-200 dark:bg-slate-700">
                {JOB_STATUSES.map((status) => {
                    const count = stats[status] || 0
                    const pct   = total > 0 ? (count / total) * 100 : 0
                    if (pct === 0) return null
                    return (
                        <div
                            key={status}
                            className={`${STATUS_STYLES[status].bg} transition-all duration-400`}
                            style={{ width: `${pct}%` }}
                        />
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
                {JOB_STATUSES.map((status) => (
                    <div key={status} className="flex items-center gap-1.5 text-caption text-slate-500 dark:text-slate-400">
                        <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                        {status} ({stats[status] || 0})
                    </div>
                ))}
            </div>
        </div>
    )
}
