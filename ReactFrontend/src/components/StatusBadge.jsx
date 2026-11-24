import { getStatusMeta } from '../utils/taskMeta'

export default function StatusBadge({ value, className = '' }) {
  const meta = getStatusMeta(value)

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${meta.badgeClass} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}
