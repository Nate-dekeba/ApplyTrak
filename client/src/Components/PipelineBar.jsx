/**
 * PipelineBar
 * A segmented horizontal progress bar showing the proportion of jobs
 * in each status, with a color-coded legend below.
 * Segments with 0% are omitted to keep the bar clean.
 */

const STAGES = [
    { key: 'Applied',      color: 'bg-blue-500',    dotColor: 'bg-blue-500' },
    { key: 'Interviewing', color: 'bg-amber-500',   dotColor: 'bg-amber-500' },
    { key: 'Offered',      color: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
    { key: 'Rejected',     color: 'bg-red-500',     dotColor: 'bg-red-500' },
]

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
            <div className="flex rounded-lg overflow-hidden h-2 bg-gray-200 dark:bg-gray-700">
                {STAGES.map((stage) => {
                    const count = stats[stage.key] || 0
                    const pct   = total > 0 ? (count / total) * 100 : 0
                    if (pct === 0) return null
                    return (
                        <div
                            key={stage.key}
                            className={`${stage.color} transition-all duration-400`}
                            style={{ width: `${pct}%` }}
                        />
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
                {STAGES.map((stage) => (
                    <div key={stage.key} className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                        {stage.key} ({stats[stage.key] || 0})
                    </div>
                ))}
            </div>
        </div>
    )
}
