/**
 * WelcomeModal
 * One-time onboarding modal shown immediately after a user registers.
 * Gives two options: jump straight into adding a job, or dismiss and explore.
 */

const STEPS = [
  { icon: '📋', label: 'Log every application' },
  { icon: '📊', label: 'Track your pipeline' },
  { icon: '🎯', label: 'Land the right job' },
]

export default function WelcomeModal({ user, onClose, onAddJob }) {
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-[1000] p-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-[460px] w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 animate-slideIn">
        <div className="text-center">
          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-5 shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
            A
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {firstName}! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            You're all set. Start logging your applications and take control of your job search — it only takes seconds.
          </p>

          {/* 3-step visual */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {STEPS.map((step, i) => (
              <div key={step.label} className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-snug">
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <button
            onClick={onAddJob}
            className="w-full py-3 rounded-xl border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[15px] font-semibold cursor-pointer mb-3 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200"
          >
            Add Your First Job →
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer transition-colors duration-150"
          >
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  )
}
