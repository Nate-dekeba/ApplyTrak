/**
 * Job-status color mapping — single source of truth, replacing four
 * independent copies previously maintained in StatCards, PipelineBar,
 * JobCard, and KanbanBoard. Deliberately distinct from the generic
 * success/warning/error/info system-feedback tokens in index.css: this is
 * domain-specific (job application status), not system messaging.
 */
export const STATUS_STYLES = {
    Applied: {
        text: 'text-sky-500',
        dot: 'bg-sky-500',
        bg: 'bg-sky-500',
        badge: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
        border: 'border-sky-500',
        topBorder: 'border-t-sky-500',
        countBadge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    },
    Interviewing: {
        text: 'text-amber-500',
        dot: 'bg-amber-500',
        bg: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        border: 'border-amber-500',
        topBorder: 'border-t-amber-500',
        countBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    Offered: {
        text: 'text-emerald-500',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        border: 'border-emerald-500',
        topBorder: 'border-t-emerald-500',
        countBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    Rejected: {
        text: 'text-red-500',
        dot: 'bg-red-500',
        bg: 'bg-red-500',
        badge: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        border: 'border-red-500',
        topBorder: 'border-t-red-500',
        countBadge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
}

export const DEFAULT_STATUS_STYLE = STATUS_STYLES.Applied
