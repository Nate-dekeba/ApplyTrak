/**
 * Modal
 * Shared modal shell — generalized from the previous one-off JobFormPopUp.
 * Renders nothing when `open` is falsy, so it can be controlled with a
 * boolean or an object reference (e.g. the job being edited).
 */
import { X } from 'lucide-react'

export default function Modal({ open, onClose, size = 'md', children }) {
    if (!open) return null

    const sizeClasses = { sm: 'max-w-[440px]', md: 'max-w-[560px]', lg: 'max-w-[680px]' }

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-[1000] p-5"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className={[
                    'relative bg-white dark:bg-slate-900 p-8 rounded-modal w-full max-h-[90vh] overflow-y-auto',
                    'shadow-soft-md border border-slate-100 dark:border-slate-800 animate-slideIn',
                    sizeClasses[size] || sizeClasses.md,
                ].join(' ')}
            >
                <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none cursor-pointer flex items-center justify-center hover:bg-error-50 dark:hover:bg-error-900/30 hover:text-error-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                    <X size={16} />
                </button>
                {children}
            </div>
        </div>
    )
}
