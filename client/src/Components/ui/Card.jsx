/**
 * Card
 * Shared surface primitive — white panel on soft neutral background,
 * restrained single-weight border, no colored glow shadow.
 */
export default function Card({ padding = 'md', hoverable = false, className = '', children, ...props }) {
    const paddingClasses = { sm: 'p-4', md: 'p-6', lg: 'p-7' }

    return (
        <div
            className={[
                'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card',
                paddingClasses[padding] || paddingClasses.md,
                hoverable ? 'transition-shadow duration-150 hover:shadow-soft-sm' : '',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </div>
    )
}
