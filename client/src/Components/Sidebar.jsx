/**
 * Sidebar
 * Navigation sidebar with two layouts:
 *  - Desktop: sticky, collapsible (icon-only when collapsed)
 *  - Mobile:  fixed overlay drawer, slides in from the left
 *
 * Dark mode toggle and user sign-out are anchored to the bottom.
 */
import { useState } from 'react'
import { FileText, BarChart3, Settings as SettingsIcon, Sun, Moon, LogOut } from 'lucide-react'
import Logo from './ui/Logo.jsx'
import Badge from './ui/Badge.jsx'

const NAV_ITEMS = [
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ user, onLogout, activeView, onViewChange, mobileOpen, onMobileClose, darkMode, onToggleDark, isPro, jobCount, jobLimit, onUpgradeClick }) {
  const [collapsed, setCollapsed] = useState(false)

  const daysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt) - new Date()) / (24 * 60 * 60 * 1000)))
    : 0

  return (
    <aside
      className={[
        'bg-white dark:bg-slate-900',
        'border-r border-slate-200 dark:border-slate-800',
        'flex flex-col transition-all duration-200 shrink-0',
        // Desktop: sticky sidebar with collapsible width
        'md:sticky md:top-0 md:h-screen',
        collapsed ? 'md:w-[68px]' : 'md:w-[220px]',
        // Mobile: fixed overlay drawer, always 220px wide
        'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:h-full max-md:w-[220px]',
        mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
      ].join(' ')}
    >
      {/* Logo — click to collapse/expand (desktop only) */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 px-5 pt-5 pb-1 mb-6`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="max-md:pointer-events-none border-none bg-transparent p-0 cursor-pointer rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Logo size="sm" />
        </button>
        {!collapsed && (
          <span className="text-h3 font-bold text-slate-900 dark:text-slate-50 tracking-tight">ApplyTrak</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id); onMobileClose?.() }}
              className={[
                'flex items-center gap-2.5 py-2.5 px-3 rounded-control border-none cursor-pointer text-sm font-medium transition-colors duration-150 w-full text-left',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" strokeWidth={2} />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom controls: dark mode toggle */}
      <div className="px-3 mb-2 flex gap-1.5">
        <button
          onClick={onToggleDark}
          className={[
            'flex items-center justify-center gap-1.5 p-2 rounded-control border-none bg-transparent cursor-pointer transition-colors duration-150',
            'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
            collapsed ? 'w-full' : 'flex-1',
          ].join(' ')}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span className="text-xs font-medium">{darkMode ? 'Light' : 'Dark'}</span>}
        </button>
      </div>

      {/* Plan status */}
      {!collapsed && (
        <div className="px-4 mb-3">
          {user?.plan === 'pro' ? (
            <Badge tone="primary">Pro</Badge>
          ) : user?.plan === 'trialing' && isPro ? (
            <div className="flex flex-col gap-1.5">
              <Badge tone="info">Pro Trial · {daysLeft}d left</Badge>
              <button
                onClick={onUpgradeClick}
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-transparent border-none cursor-pointer text-left p-0"
              >
                Upgrade now →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold">Free plan</span>
                <span className="tabular-nums">{jobCount}/{jobLimit}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-primary-600"
                  style={{ width: `${Math.min(100, (jobCount / jobLimit) * 100)}%` }}
                />
              </div>
              <button
                onClick={onUpgradeClick}
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-transparent border-none cursor-pointer text-left p-0"
              >
                Upgrade to Pro →
              </button>
            </div>
          )}
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-[13px] shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-error-600 dark:hover:text-error-500 bg-transparent border-none cursor-pointer p-0 transition-colors duration-150"
            >
              <LogOut size={11} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
