import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, X } from 'lucide-react'
import Brand from './Brand'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', Icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', Icon: ListChecks },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const initial = user?.username?.charAt(0).toUpperCase() || '?'

  function handleLogout() {
    logout()
    onClose()
    showToast('Signed out.', 'info')
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-white/5 bg-ink shadow-2xl transition-transform duration-200 motion-reduce:transition-none lg:translate-x-0 lg:shadow-none ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <Brand onDark showSubtitle />
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-lg p-2 text-paper/60 transition-colors hover:bg-white/5 hover:text-paper focus-visible:outline-cobalt-soft lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-cobalt-soft ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-paper/60 hover:bg-white/5 hover:text-paper'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-cobalt-soft"
                          aria-hidden="true"
                        />
                      )}
                      <Icon size={18} strokeWidth={1.8} />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-1 py-1">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-semibold text-paper"
              aria-hidden="true"
            >
              {initial}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-paper">
              {user?.username}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-paper/60 transition-colors hover:bg-white/5 hover:text-paper focus-visible:outline-cobalt-soft"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
