import { Menu } from 'lucide-react'
import Brand from './Brand'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onOpenSidebar }) {
  const { user } = useAuth()
  const initial = user?.username?.charAt(0).toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="icon-btn"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <Brand />
        </div>

        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-paper"
          aria-hidden="true"
        >
          {initial}
        </span>
      </div>
    </header>
  )
}
