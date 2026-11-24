import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return

    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const previousOverflow = document.body.style.overflow

    function closeOnDesktop(event) {
      if (event.matches) {
        setSidebarOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => {
      document.body.style.overflow = previousOverflow
      desktopQuery.removeEventListener('change', closeOnDesktop)
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[248px]">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
