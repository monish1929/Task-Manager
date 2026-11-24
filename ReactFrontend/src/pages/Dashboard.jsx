import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import PriorityIndicator from '../components/PriorityIndicator'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import TaskForm from '../components/TaskForm'
import { Skeleton } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import * as taskService from '../services/taskService'
import { getErrorMessage } from '../utils/errors'
import {
  getStatusMeta,
  normalizePriority,
  normalizeStatus,
} from '../utils/taskMeta'

function countTasks(tasks) {
  return tasks.reduce(
    (counts, task) => {
      const status = normalizeStatus(task.status)
      counts.total += 1

      if (status === 'PENDING') counts.pending += 1
      else if (status === 'IN_PROGRESS') counts.inProgress += 1
      else if (status === 'COMPLETED') counts.completed += 1
      else counts.other += 1

      return counts
    },
    { total: 0, pending: 0, inProgress: 0, completed: 0, other: 0 },
  )
}

function share(count, total) {
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await taskService.getMyTasks()
      setTasks(data)
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'Could not load your task statistics.'),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleCreate(values) {
    const created = await taskService.createTask(values)

    setTasks((current) => [created, ...current])
    setFormOpen(false)
    setError('')
    showToast('Task created.', 'success')
  }

  const counts = countTasks(tasks)
  const openCount = counts.pending + counts.inProgress

  const highPriorityOpen = tasks.filter(
    (task) =>
      normalizePriority(task.priority) === 'HIGH' &&
      normalizeStatus(task.status) !== 'COMPLETED',
  ).length

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  let summary

  if (loading) {
    summary = 'Fetching your latest tasks.'
  } else if (error) {
    summary = 'Your task list is unavailable right now.'
  } else if (openCount === 0) {
    summary = `${today}. Nothing is open right now.`
  } else {
    summary = `${today}. ${openCount} ${
      openCount === 1 ? 'task is' : 'tasks are'
    } still open.`
  }

  const stats = [
    {
      label: 'Total tasks',
      value: counts.total,
      dotClass: 'bg-ink',
      hint:
        counts.total === 0
          ? 'Your list is empty'
          : highPriorityOpen > 0
            ? `${highPriorityOpen} high-priority ${
                highPriorityOpen === 1 ? 'task' : 'tasks'
              } open`
            : 'No high-priority work open',
    },
    {
      label: 'Pending',
      value: counts.pending,
      dotClass: 'bg-pending',
      hint:
        counts.total === 0
          ? 'Nothing here yet'
          : `${share(counts.pending, counts.total)}% of all tasks`,
    },
    {
      label: 'In progress',
      value: counts.inProgress,
      dotClass: 'bg-progress',
      hint:
        counts.total === 0
          ? 'Nothing here yet'
          : `${share(counts.inProgress, counts.total)}% of all tasks`,
    },
    {
      label: 'Completed',
      value: counts.completed,
      dotClass: 'bg-done',
      hint:
        counts.total === 0
          ? 'Nothing here yet'
          : `${share(counts.completed, counts.total)}% of all tasks`,
    },
  ]

  const mix = [
    {
      label: 'Pending',
      count: counts.pending,
      barClass: 'bg-pending',
      dotClass: 'bg-pending',
    },
    {
      label: 'In progress',
      count: counts.inProgress,
      barClass: 'bg-progress',
      dotClass: 'bg-progress',
    },
    {
      label: 'Completed',
      count: counts.completed,
      barClass: 'bg-done',
      dotClass: 'bg-done',
    },
  ]

  if (counts.other > 0) {
    mix.push({
      label: 'Other',
      count: counts.other,
      barClass: 'bg-line',
      dotClass: 'bg-muted',
    })
  }

  const filledMix = mix.filter((item) => item.count > 0)
  const mixLabel = `Task status distribution: ${mix
    .map((item) => `${item.count} ${item.label.toLowerCase()}`)
    .join(', ')}.`

  const recentTasks = [...tasks]
    .sort((first, second) => Number(second.id) - Number(first.id))
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`${getGreeting()}, ${user?.username || 'there'}`}
        description={summary}
        action={
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} aria-hidden="true" />
            New task
          </button>
        }
      />

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="panel">
          <ErrorState
            title="Could not load your dashboard"
            message={error}
            onRetry={loadTasks}
          />
        </div>
      ) : (
        <>
          <section
            aria-label="Task statistics"
            className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-4 py-5 sm:px-5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${stat.dotClass}`}
                    aria-hidden="true"
                  />
                  {stat.label}
                </p>
                <p className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs leading-snug text-muted">
                  {stat.hint}
                </p>
              </div>
            ))}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="panel overflow-hidden">
              <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Recent tasks
                </h2>
                <Link
                  to="/tasks"
                  className="text-sm font-medium text-cobalt hover:text-cobalt-deep"
                >
                  View all
                </Link>
              </header>

              {recentTasks.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No tasks yet"
                  description="Create your first task and it will appear here."
                  action={
                    <button
                      type="button"
                      onClick={() => setFormOpen(true)}
                      className="btn btn-primary"
                    >
                      <Plus size={16} aria-hidden="true" />
                      Add a task
                    </button>
                  }
                />
              ) : (
                <ul className="divide-y divide-line">
                  {recentTasks.map((task) => {
                    const status = getStatusMeta(task.status)

                    return (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 px-5 py-3.5"
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${status.dotClass}`}
                          aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {task.title || 'Untitled task'}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {task.description || 'No description'}
                          </p>
                        </div>

                        <PriorityIndicator
                          value={task.priority}
                          showLabel={false}
                          className="hidden shrink-0 sm:inline-flex"
                        />
                        <StatusBadge
                          value={task.status}
                          className="shrink-0"
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="panel p-5" aria-labelledby="status-mix-title">
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id="status-mix-title"
                  className="font-display text-lg font-semibold text-ink"
                >
                  Status mix
                </h2>
                <span className="text-xs text-muted">
                  {counts.total} {counts.total === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {counts.total === 0 ? (
                <p className="mt-8 text-sm leading-relaxed text-muted">
                  Add a task to see how your work is distributed.
                </p>
              ) : (
                <>
                  <div
                    className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-paper"
                    role="img"
                    aria-label={mixLabel}
                  >
                    {filledMix.map((item) => (
                      <span
                        key={item.label}
                        className={`h-full ${item.barClass}`}
                        style={{ flexGrow: item.count, flexBasis: 0 }}
                      />
                    ))}
                  </div>

                  <ul className="mt-5 space-y-3">
                    {mix.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2 text-ink">
                          <span
                            className={`h-2 w-2 rounded-full ${item.dotClass}`}
                            aria-hidden="true"
                          />
                          {item.label}
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span className="font-medium text-ink tabular-nums">
                            {item.count}
                          </span>
                          <span className="w-10 text-right text-xs text-muted tabular-nums">
                            {share(item.count, counts.total)}%
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        </>
      )}

      {formOpen && (
        <TaskForm
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="bg-white px-4 py-5 sm:px-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-9 w-14" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <Skeleton className="h-5 w-32" />
          <div className="mt-6 space-y-5">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
