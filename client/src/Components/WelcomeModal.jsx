/**
 * WelcomeModal
 * One-time onboarding modal shown immediately after a user registers.
 * Gives two options: jump straight into adding a job, or dismiss and explore.
 */
import { ClipboardList, Columns3, Target } from 'lucide-react'
import Logo from './ui/Logo.jsx'
import Button from './ui/Button.jsx'

const STEPS = [
  { Icon: ClipboardList, label: 'Log every application' },
  { Icon: Columns3, label: 'Track your pipeline' },
  { Icon: Target, label: 'Land the right job' },
]

export default function WelcomeModal({ user, onClose, onAddJob }) {
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-[1000] p-5">
      <div className="bg-white dark:bg-slate-900 rounded-modal max-w-[460px] w-full p-8 shadow-soft-md border border-slate-100 dark:border-slate-800 animate-slideIn">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Logo size="lg" />
          </div>
          <h2 className="text-h1 font-bold text-slate-900 dark:text-white mb-2">
            Welcome, {firstName}! 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            You're all set. Start logging your applications and take control of your job search — it only takes seconds.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {STEPS.map((step) => (
              <div key={step.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-card p-4">
                <div className="flex justify-center mb-2 text-primary-600 dark:text-primary-400">
                  <step.Icon size={20} />
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" onClick={onAddJob} className="w-full mb-3">
            Add Your First Job →
          </Button>
          <button
            onClick={onClose}
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  )
}
