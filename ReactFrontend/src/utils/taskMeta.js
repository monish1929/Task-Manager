export const STATUS_OPTIONS = [
  {
    value: 'PENDING',
    label: 'Pending',
    dotClass: 'bg-pending',
    badgeClass: 'bg-pending/10 text-pending',
  },
  {
    value: 'IN_PROGRESS',
    label: 'In progress',
    dotClass: 'bg-progress',
    badgeClass: 'bg-progress/10 text-progress',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    dotClass: 'bg-done',
    badgeClass: 'bg-done/10 text-done',
  },
]

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', level: 1 },
  { value: 'MEDIUM', label: 'Medium', level: 2 },
  { value: 'HIGH', label: 'High', level: 3 },
]

/** "In progress", "in-progress" and "IN_PROGRESS" all become IN_PROGRESS. */
export function normalizeStatus(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
}

export function normalizePriority(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

function readableFallback(value) {
  const text = String(value ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getStatusMeta(value) {
  const normalized = normalizeStatus(value)
  const known = STATUS_OPTIONS.find((option) => option.value === normalized)

  if (known) return known

  return {
    value: 'OTHER',
    label: readableFallback(value) || 'No status',
    dotClass: 'bg-muted',
    badgeClass: 'bg-paper text-muted',
  }
}

export function getPriorityMeta(value) {
  const normalized = normalizePriority(value)
  const known = PRIORITY_OPTIONS.find((option) => option.value === normalized)

  if (known) return known

  return {
    value: 'OTHER',
    label: readableFallback(value) || 'No priority',
    level: 0,
  }
}

/** Keep a select usable when the backend contains an older, unknown value. */
export function toStatusOption(value) {
  const normalized = normalizeStatus(value)
  return STATUS_OPTIONS.some((option) => option.value === normalized) ? normalized : 'PENDING'
}

export function toPriorityOption(value) {
  const normalized = normalizePriority(value)
  return PRIORITY_OPTIONS.some((option) => option.value === normalized) ? normalized : 'MEDIUM'
}
