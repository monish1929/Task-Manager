import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-done',
    barClass: 'bg-done',
  },
  error: {
    Icon: AlertCircle,
    iconClass: 'text-danger',
    barClass: 'bg-danger',
  },
  info: {
    Icon: Info,
    iconClass: 'text-cobalt',
    barClass: 'bg-cobalt',
  },
}

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const { Icon, iconClass, barClass } = VARIANTS[toast.variant] || VARIANTS.info

  return (
    <div className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-line bg-white py-3 pl-5 pr-4 shadow-[0_12px_32px_-14px_rgba(24,36,32,0.4)] animate-toast-in sm:w-[360px]">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${barClass}`}
        aria-hidden="true"
      />
      <Icon
        size={18}
        strokeWidth={1.9}
        className={`mt-0.5 shrink-0 ${iconClass}`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm leading-snug text-ink">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  )
}
