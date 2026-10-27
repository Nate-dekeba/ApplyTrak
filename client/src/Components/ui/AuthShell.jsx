/**
 * AuthShell
 * Shared layout for every auth screen (Login, Signup, Forgot/Reset Password,
 * Verify Email) — replaces 5 copy-pasted centered-card shells. Previously
 * these used a blue/purple gradient backdrop; the approved direction drops
 * the purple tint in favor of a clean, bright, neutral background.
 */
import Logo from './Logo.jsx'

export default function AuthShell({ title, subtitle, children, footer, maxWidth = '420px' }) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full mx-4 animate-slideIn" style={{ maxWidth }}>
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <Logo size="md" />
                    <span className="text-h2 font-bold text-slate-900 dark:text-slate-50 tracking-tight">ApplyTrak</span>
                </div>

                <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 px-8 py-8 rounded-modal shadow-soft-sm border border-slate-100 dark:border-slate-800">
                    {(title || subtitle) && (
                        <div className="text-center mb-1">
                            {title && <h2 className="text-h2 font-bold text-slate-900 dark:text-slate-50 m-0">{title}</h2>}
                            {subtitle && <p className="text-body-sm text-slate-400 dark:text-slate-500 mt-1 m-0">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>

                {footer && <div className="mt-5">{footer}</div>}
            </div>
        </div>
    )
}
