import { getPriorityMeta } from '../utils/taskMeta'

const BAR_COLORS = {
  HIGH: 'bg-danger',
  MEDIUM: 'bg-ink',
  LOW: 'bg-muted',
}

const BAR_HEIGHTS = ['h-1.5', 'h-2.5', 'h-3.5']

export default function PriorityIndicator({
  value,
  showLabel = true,
  className = '',
}) {
  const meta = getPriorityMeta(value)
  const color = BAR_COLORS[meta.value] || 'bg-muted'

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={`Priority: ${meta.label}`}
    >
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`w-[3px] rounded-sm ${BAR_HEIGHTS[level - 1]} ${
              level <= meta.level ? color : 'bg-line'
            }`}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="text-xs font-medium text-ink">{meta.label}</span>
      ) : (
        <span className="sr-only">{meta.label} priority</span>
      )}
    </span>
  )
}
