/**
 * Badge
 * Shared pill primitive for status/plan labels.
 * tone: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
 */
const TONE_CLASSES = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    success: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-500',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-500',
    error: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-500',
    info: 'bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-500',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
    return (
        <span
            className={[
                'inline-flex items-center px-2.5 py-0.5 rounded-chip text-[11px] font-semibold uppercase tracking-wide',
                TONE_CLASSES[tone] || TONE_CLASSES.neutral,
                className,
            ].join(' ')}
        >
            {children}
        </span>
    )
}
