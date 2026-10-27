/**
 * StatCards
 * Displays four summary metrics at the top of the dashboard:
 * total applications, interviews, offers, and response rate.
 *
 * Response rate = (jobs that got any response) / total
 * where "no response" means still in Applied status.
 */
import Card from './ui/Card.jsx'
import { STATUS_STYLES } from '../constants/statusStyles.js'

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
        { label: 'Total Sent',    value: total,                    colorClass: 'text-primary-600' },
        { label: 'Interviewing',  value: stats.Interviewing || 0,  colorClass: STATUS_STYLES.Interviewing.text },
        { label: 'Offers',        value: stats.Offered || 0,       colorClass: STATUS_STYLES.Offered.text },
        { label: 'Response Rate', value: `${responseRate}%`,       colorClass: 'text-slate-700 dark:text-slate-300' },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
            {items.map((item) => (
                <Card key={item.label} padding="md">
                    <div className="text-caption text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-1.5">
                        {item.label}
                    </div>
                    <div className={`text-[28px] font-bold ${item.colorClass} leading-none`}>
                        {item.value}
                    </div>
                </Card>
            ))}
        </div>
    )
}
