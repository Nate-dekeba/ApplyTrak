/**
 * Select
 * Shared select primitive — same id/label association and visual language as Input.
 */
import { useId } from 'react'

export default function Select({ label, id, error, helperText, required, className = '', children, ...props }) {
    const generatedId = useId()
    const selectId = id || generatedId

    return (
        <div>
            {label && (
                <label htmlFor={selectId} className="block text-[13px] font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                className={[
                    'w-full py-2.5 px-3.5 rounded-control border text-sm cursor-pointer',
                    'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800',
                    'outline-none transition-all duration-150',
                    error
                        ? 'border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500/10',
                    className,
                ].join(' ')}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p id={`${selectId}-error`} className="text-xs text-error-600 dark:text-error-500 mt-1">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p id={`${selectId}-helper`} className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    )
}
