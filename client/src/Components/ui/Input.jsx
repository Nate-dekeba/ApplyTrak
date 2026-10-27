/**
 * Input
 * Shared text-input primitive. Owns id-generation so label/input are always
 * properly associated via htmlFor — the previous per-form markup rendered
 * labels as plain unassociated text, which broke screen-reader navigation.
 */
import { useId } from 'react'

export default function Input({ label, id, error, success, helperText, required, icon: Icon, endAdornment, className = '', ...props }) {
    const generatedId = useId()
    const inputId = id || generatedId

    const input = (
        <input
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={[
                'w-full py-2.5 px-3.5 rounded-control border text-sm',
                Icon ? 'pl-9' : '',
                endAdornment ? 'pr-9' : '',
                'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'outline-none transition-all duration-150',
                error
                    ? 'border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/10'
                    : success
                        ? 'border-success-400 focus:border-success-500 focus:ring-2 focus:ring-success-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500/10',
                className,
            ].join(' ')}
            {...props}
        />
    )

    return (
        <div>
            {label && (
                <label htmlFor={inputId} className="block text-[13px] font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    {label}
                </label>
            )}
            {Icon || endAdornment ? (
                <div className="relative">
                    {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
                    {input}
                    {endAdornment && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                            {endAdornment}
                        </span>
                    )}
                </div>
            ) : input}
            {error && (
                <p id={`${inputId}-error`} className="text-xs text-error-600 dark:text-error-500 mt-1">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p id={`${inputId}-helper`} className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    )
}
