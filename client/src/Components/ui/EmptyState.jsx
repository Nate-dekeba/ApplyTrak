/**
 * EmptyState
 * Shared "nothing here yet" treatment — icon + heading + body + optional
 * real action button. Replaces emoji-only placeholders that described an
 * action in text without actually providing it.
 */
import Button from './Button.jsx'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className = '' }) {
    return (
        <div className={`text-center py-16 text-slate-400 dark:text-slate-600 ${className}`}>
            {Icon && (
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-slate-400 dark:text-slate-500" />
                </div>
            )}
            {title && <p className="text-body font-medium text-slate-600 dark:text-slate-400">{title}</p>}
            {description && <p className="text-body-sm mt-1">{description}</p>}
            {actionLabel && onAction && (
                <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
