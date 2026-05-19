/**
 * StatCards
 * Displays four summary metrics at the top of the dashboard:
 * total applications, interviews, offers, and response rate.
 *
 * Response rate = (jobs that got any response) / total
 * where "no response" means still in Applied status.
 */

const STATUS_CONFIG = {
    Applied:      { color: 'text-blue-500',    bg: 'bg-blue-50' },
    Interviewing: { color: 'text-amber-500',   bg: 'bg-amber-50' },
    Offered:      { color: 'text-emerald-500', bg: 'bg-emerald-50' },
    Rejected:     { color: 'text-red-500',     bg: 'bg-red-50' },
}

export default function StatCards({ jobs }) {
    // Count jobs per status in a single pass
    const stats = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
    }, {})

    const total = jobs.length
    // "Responded" = anything that moved past Applied (interview, offer, or rejection)
    const responded    = total - (stats.Applied || 0)
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

    const items = [
        { label: 'Total Sent',   value: total,             colorClass: 'text-indigo-500' },
        { label: 'Interviewing', value: stats.Interviewing || 0, colorClass: 'text-amber-500' },
        { label: 'Offers',       value: stats.Offered || 0,      colorClass: 'text-emerald-500' },
        { label: 'Response Rate', value: `${responseRate}%`,     colorClass: 'text-blue-500' },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[14px] p-5 relative overflow-hidden"
                >
                    <div className="text-[12px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1.5">
                        {item.label}
                    </div>
                    <div className={`text-[28px] font-bold ${item.colorClass} leading-none`}>
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    )
}
