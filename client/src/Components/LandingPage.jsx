const FEATURES = [
  {
    icon: '📋',
    title: 'Track Every Application',
    desc: 'Log jobs in seconds. Search, filter, and manage your entire pipeline from one clean dashboard.',
  },
  {
    icon: '📊',
    title: 'Visual Pipeline',
    desc: 'See your whole job search at a glance with Kanban board and status tracking built right in.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Tools',
    desc: 'Tailor your resume, generate cover letters, and prep for interviews — all with AI assistance. (Pro)',
  },
]

const FREE_FEATURES = [
  'Up to 25 active jobs',
  'Kanban board & card views',
  'Search & filter',
  'Status tracking',
]

const PRO_FEATURES = [
  'Unlimited jobs',
  'URL import (auto-fill from job links)',
  'AI resume tailoring',
  'Cover letter generator',
  'Interview prep assistant',
  'Analytics dashboard',
  'Weekly email digest',
]

const ANNUAL_FEATURES = [
  'Everything in Pro',
  'Priority support',
  'Early access to new features',
  'Exportable application history',
]

const MOCK_STATS = [
  { label: 'Applications', value: '24', color: 'text-indigo-500' },
  { label: 'Interviews', value: '3', color: 'text-amber-500' },
  { label: 'Response Rate', value: '67%', color: 'text-emerald-500' },
]

const MOCK_JOBS = [
  {
    company: 'Stripe', title: 'Software Engineer', status: 'Interviewing',
    location: 'Remote', avatarBg: 'bg-indigo-600',
    borderColor: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-600',
  },
  {
    company: 'Google', title: 'Product Manager', status: 'Applied',
    location: 'New York, NY', avatarBg: 'bg-blue-600',
    borderColor: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-600',
  },
]

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-[15px]">
            A
          </div>
          <span className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">ApplyTrak</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-150"
          >
            Log in
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg border-none cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left — copy */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
            ✨ Free to get started — no credit card needed
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Stop losing track.<br />
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Start landing jobs.
            </span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
            ApplyTrak keeps every application organized in one place — track your pipeline, spot what's working, and never miss a follow-up again.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl border-none cursor-pointer shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.45)] transition-all duration-200"
            >
              Get Started Free →
            </button>
            <button
              onClick={onLogin}
              className="px-6 py-3 text-[15px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Log in
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            ✓ Free forever &nbsp;·&nbsp; ✓ Set up in 60 seconds &nbsp;·&nbsp; ✓ No spreadsheets
          </p>
        </div>

        {/* Right — mock UI */}
        <div className="flex-1 w-full max-w-md">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {MOCK_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
              >
                <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Mock job cards */}
          <div className="flex flex-col gap-3">
            {MOCK_JOBS.map((job) => (
              <div
                key={job.company}
                className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-[3px] ${job.borderColor} rounded-2xl p-4 shadow-sm flex items-center gap-3`}
              >
                <div className={`w-9 h-9 rounded-[10px] ${job.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{job.title}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{job.company} · {job.location}</div>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${job.badge}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Everything your job search needs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for serious job seekers who want results, not more busywork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Simple pricing</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Start free. Upgrade when you're ready for the full toolkit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Free tier */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-8 bg-white dark:bg-gray-900">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Free</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-8">forever</div>
              <ul className="flex flex-col gap-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-emerald-500 font-bold text-base shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro tier — most popular */}
            <div className="relative border-2 border-indigo-500 rounded-2xl p-8 bg-gradient-to-b from-blue-50/60 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider whitespace-nowrap">
                  MOST POPULAR
                </span>
              </div>
              <div className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-4">Pro</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$12</span>
                <span className="text-gray-400 dark:text-gray-500 text-sm mb-1">/month</span>
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-8">billed monthly, cancel anytime</div>
              <ul className="flex flex-col gap-3 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-500 font-bold text-base shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-200"
              >
                Start Free Trial
              </button>
            </div>

            {/* Annual tier — best value */}
            <div className="relative border-2 border-emerald-500 rounded-2xl p-8 bg-gradient-to-b from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider whitespace-nowrap">
                  BEST VALUE
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Annual</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$99</span>
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-8">one-time · full year · save $45</div>
              <ul className="flex flex-col gap-3 mb-8">
                {ANNUAL_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-emerald-500 font-bold text-base shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl border-none bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200"
              >
                Get Annual Access
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 px-6 md:px-16 py-8 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">© 2026 ApplyTrak. All rights reserved.</p>
      </footer>

    </div>
  )
}
