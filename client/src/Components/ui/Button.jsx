/**
 * Button
 * Shared action primitive — replaces the gradient-pill-plus-glow-shadow
 * markup previously copy-pasted across 10+ files.
 *
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'sm' | 'md' | 'lg'
 */
import { Loader2 } from 'lucide-react'

const VARIANT_CLASSES = {
    primary:
        'bg-primary-600 text-white border border-transparent hover:bg-primary-700 disabled:bg-primary-300',
    secondary:
        'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50',
    ghost:
        'bg-transparent text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
    danger:
        'bg-white dark:bg-slate-800 text-error-600 dark:text-error-500 border border-error-200 dark:border-error-900/50 hover:bg-error-50 dark:hover:bg-error-900/20 disabled:opacity-50',
}

const SIZE_CLASSES = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-[15px] gap-2',
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    className = '',
    children,
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={[
                'inline-flex items-center justify-center rounded-control font-semibold cursor-pointer',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                'disabled:cursor-not-allowed',
                VARIANT_CLASSES[variant],
                SIZE_CLASSES[size],
                className,
            ].join(' ')}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />}
            {children}
        </button>
    )
}
