export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-line/70 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  )
}

export default function Loading({ label = 'Loading', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-sm text-muted ${className}`}
      role="status"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-cobalt motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}
