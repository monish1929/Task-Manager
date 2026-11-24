import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ToastViewport } from '../components/Toast'

const ToastContext = createContext(null)

let nextToastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, variant = 'success') => {
      nextToastId += 1
      const id = nextToastId

      // Keep at most three toasts on screen.
      setToasts((current) => [...current.slice(-2), { id, message, variant }])

      const timer = setTimeout(() => dismissToast(id), 4500)
      timers.current.set(id, timer)
    },
    [dismissToast],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
