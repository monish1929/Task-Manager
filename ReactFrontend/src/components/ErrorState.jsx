import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
      role="alert"
    >
      <span className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-danger/20 bg-danger/5 text-danger">
        <AlertTriangle size={20} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary mt-5"
        >
          <RefreshCw size={15} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  )
}
