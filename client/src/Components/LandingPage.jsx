import { Sparkles, ClipboardList, Columns3, Gift, Check } from 'lucide-react'
import Logo from './ui/Logo.jsx'
import Button from './ui/Button.jsx'
import Card from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'
import { STATUS_STYLES } from '../constants/statusStyles.js'

const FEATURES = [
  {
    Icon: ClipboardList,
    title: 'Track Every Application',
    desc: 'Log jobs in seconds. Search, filter, and manage your entire pipeline from one clean dashboard.',
  },
  {
    Icon: Columns3,
    title: 'Visual Pipeline',
    desc: 'See your whole job search at a glance with Kanban board and status tracking built right in.',
  },
  {
    Icon: Gift,
    title: 'Free to Start',
    desc: 'Track up to 25 applications free, forever — no credit card required. Upgrade only when you need more.',
  },
]

const MONTHLY_FEATURES = [
  'Unlimited job applications',
  'Kanban board, table & card views',
  'Priority support',
  'Early access to new features',
]

const ANNUAL_FEATURES = [
  'Everything in Monthly',
  'Save $81/year vs. monthly billing',
]

const MOCK_STATS = [
  { label: 'Applications', value: '24', colorClass: 'text-primary-600' },
  { label: 'Interviews', value: '3', colorClass: STATUS_STYLES.Interviewing.text },
  { label: 'Response Rate', value: '67%', colorClass: 'text-slate-700' },
]

const MOCK_JOBS = [
  {
    company: 'Stripe', title: 'Software Engineer', status: 'Interviewing',
    location: 'Remote', avatarBg: 'bg-indigo-600',
  },
  {
    company: 'Google', title: 'Product Manager', status: 'Applied',
    location: 'New York, NY', avatarBg: 'bg-blue-600',
  },
]

const TRUST_POINTS = ['Free forever', 'Set up in 60 seconds', 'No spreadsheets']

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="px-3 py-2 rounded-control text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      {children}
    </a>
  )
}

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">ApplyTrak</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-control"
          >
            Log in
          </button>
          <Button variant="primary" onClick={() => onGetStarted()}>
            Get Started Free
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left — copy */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-xs font-semibold mb-6">
            <Sparkles size={13} />
            Free to get started — no credit card needed
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Stop losing track.<br />
            <span className="text-primary-600">Start landing jobs.</span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
            ApplyTrak keeps every application organized in one place — track your pipeline, spot what's working, and never miss a follow-up again.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Button variant="primary" size="lg" onClick={() => onGetStarted()}>
              Get Started Free →
            </Button>
            <Button variant="secondary" size="lg" onClick={onLogin}>
              Log in
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-primary-600" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Right — static mock preview of the product (not a live component) */}
        <div className="flex-1 w-full max-w-md">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {MOCK_STATS.map((stat) => (
              <Card key={stat.label} padding="sm">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
              </Card>
            ))}
          </div>

          {/* Mock job cards */}
          <div className="flex flex-col gap-3">
            {MOCK_JOBS.map((job) => {
              const style = STATUS_STYLES[job.status]
              return (
                <Card key={job.company} padding="sm" className={`border-l-[3px] ${style.border} flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-control ${job.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{job.title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{job.company} · {job.location}</div>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-chip uppercase tracking-wide ${style.badge}`}>
                    {job.status}
                  </span>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-16 py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Everything your job search needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built for serious job seekers who want results, not more busywork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} padding="lg">
                <div className="w-10 h-10 rounded-control bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                  <f.Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-16 py-20 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Simple, upfront pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Free to start. Upgrade for unlimited applications whenever you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* Monthly */}
            <Card padding="lg" className="flex flex-col">
              <div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Monthly</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$15</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm mb-1">/month</span>
                </div>
                <div className="text-sm text-slate-400 dark:text-slate-500 mb-7">cancel anytime</div>
                <ul className="flex flex-col gap-3 mb-8">
                  {MONTHLY_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Check size={16} className="text-primary-600 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="secondary" size="lg" onClick={() => onGetStarted('monthly')} className="mt-auto w-full">
                Subscribe Monthly
              </Button>
            </Card>

            {/* Annual — featured */}
            <Card padding="lg" className="relative border-2 border-primary-600 shadow-soft-md flex flex-col">
              <div className="absolute -top-3 left-6">
                <Badge tone="primary">Best Value</Badge>
              </div>
              <div>
                <div className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">Annual</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$99</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm mb-1">/year</span>
                </div>
                <div className="text-sm text-slate-400 dark:text-slate-500 mb-7">
                  <span className="text-primary-600 font-semibold">$8.25/mo</span> · save $81
                </div>
                <ul className="flex flex-col gap-3 mb-8">
                  {ANNUAL_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Check size={16} className="text-primary-600 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="primary" size="lg" onClick={() => onGetStarted('annual')} className="mt-auto w-full">
                Subscribe Annually
              </Button>
            </Card>

          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            New here? <button onClick={() => onGetStarted()} className="text-primary-600 font-semibold underline bg-transparent border-none cursor-pointer p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">Sign up free</button> — no card required — and start a 14-day Pro trial anytime from Settings.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 md:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">ApplyTrak</span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 m-0">© 2026 ApplyTrak. All rights reserved.</p>
      </footer>

    </div>
  )
}
