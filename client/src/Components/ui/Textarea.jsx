/**
 * Textarea
 * Shared textarea primitive — same id/label association and visual language as Input.
 */
import { useId } from 'react'

export default function Textarea({ label, id, error, helperText, className = '', ...props }) {
    const generatedId = useId()
    const textareaId = id || generatedId

    return (
        <div>
            {label && (
                <label htmlFor={textareaId} className="block text-[13px] font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                aria-invalid={!!error}
                aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                className={[
                    'w-full py-2.5 px-3.5 rounded-control border text-sm min-h-[80px] resize-y',
                    'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800',
                    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                    'outline-none transition-all duration-150',
                    error
                        ? 'border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary-500/10',
                    className,
                ].join(' ')}
                {...props}
            />
            {error && (
                <p id={`${textareaId}-error`} className="text-xs text-error-600 dark:text-error-500 mt-1">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p id={`${textareaId}-helper`} className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    )
}
