import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import TaskDetails from '../components/TaskDetails'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'
import PriorityIndicator from '../components/PriorityIndicator'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/Loading'
import { useToast } from '../context/ToastContext'
import * as taskService from '../services/taskService'
import { getErrorMessage } from '../utils/errors'
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  normalizePriority,
  normalizeStatus,
} from '../utils/taskMeta'

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const STATUS_RANK = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2 }

function newestFirst(first, second) {
  return Number(second.id) - Number(first.id)
}

function compareTasks(first, second, sortBy) {
  if (sortBy === 'oldest') {
    return Number(first.id) - Number(second.id)
  }

  if (sortBy === 'title') {
    return (
      String(first.title || '').localeCompare(String(second.title || '')) ||
      newestFirst(first, second)
    )
  }

  if (sortBy === 'priority') {
    return (
      (PRIORITY_RANK[normalizePriority(first.priority)] ?? 9) -
        (PRIORITY_RANK[normalizePriority(second.priority)] ?? 9) ||
      newestFirst(first, second)
    )
  }

  if (sortBy === 'status') {
    return (
      (STATUS_RANK[normalizeStatus(first.status)] ?? 9) -
        (STATUS_RANK[normalizeStatus(second.status)] ?? 9) ||
      newestFirst(first, second)
    )
  }

  return newestFirst(first, second)
}

export default function Tasks() {
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [details, setDetails] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Lets us ignore a details response if the dialog was closed in the meantime.
  const detailsRequest = useRef(0)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await taskService.getMyTasks()
      setTasks(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load your tasks.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase()

    return tasks
      .filter((task) => {
        const matchesSearch =
          !term || String(task.title ?? '').toLowerCase().includes(term)
        const matchesStatus =
          statusFilter === 'ALL' ||
          normalizeStatus(task.status) === statusFilter
        const matchesPriority =
          priorityFilter === 'ALL' ||
          normalizePriority(task.priority) === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
      })
      .sort((first, second) => compareTasks(first, second, sortBy))
  }, [tasks, search, statusFilter, priorityFilter, sortBy])

  const hasFilters =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL'

  function clearFilters() {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
  }

  function openCreate() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingTask(null)
  }

  async function openDetails(task) {
    const requestId = detailsRequest.current + 1
    detailsRequest.current = requestId

    setDetails({ id: task.id, task: null, loading: true, error: '' })

    try {
      const freshTask = await taskService.getTaskById(task.id)

      if (detailsRequest.current !== requestId) return

      setDetails({
        id: task.id,
        task: freshTask,
        loading: false,
        error: '',
      })
    } catch (detailError) {
      if (detailsRequest.current !== requestId) return

      setDetails({
        id: task.id,
        task: null,
        loading: false,
        error: getErrorMessage(detailError, 'Could not open this task.'),
      })
    }
  }

  function closeDetails() {
    detailsRequest.current += 1
    setDetails(null)
  }

  function openEdit(task) {
    if (!task) return

    closeDetails()
    setEditingTask(task)
    setFormOpen(true)
  }

  function requestDelete(task) {
    if (!task) return

    closeDetails()
    setDeleteTarget(task)
  }

  async function handleCreate(values) {
    const created = await taskService.createTask(values)

    setTasks((current) => [created, ...current])
    closeForm()
    showToast('Task created.', 'success')
  }

  async function handleUpdate(values) {
    const updated = await taskService.updateTask(editingTask.id, values)

    setTasks((current) =>
      current.map((task) =>
        task.id === updated.id ? { ...task, ...updated } : task,
      ),
    )
    closeForm()
    showToast('Task updated.', 'success')
  }

  async function handleDelete() {
    await taskService.deleteTask(deleteTarget.id)

    setTasks((current) =>
      current.filter((task) => task.id !== deleteTarget.id),
    )
    setDeleteTarget(null)
    showToast('Task deleted.', 'success')
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Search, filter, and update the work you own."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary"
          >
            <Plus size={18} aria-hidden="true" />
            New task
          </button>
        }
      />

      <div className="panel mb-4 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_160px_160px_180px]">
          <div className="relative sm:col-span-3 xl:col-span-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <label htmlFor="task-search" className="sr-only">
              Search tasks by title
            </label>
            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title"
              className="field-input pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="field-input"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="field-input"
            >
              <option value="ALL">All priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort-by" className="sr-only">
              Sort tasks
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="field-input"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A to Z</option>
              <option value="priority">Priority, high to low</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-muted" aria-live="polite">
            {loading
              ? 'Loading tasks'
              : `Showing ${visibleTasks.length} of ${tasks.length} ${
                  tasks.length === 1 ? 'task' : 'tasks'
                }`}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-cobalt hover:text-cobalt-deep"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <TasksSkeleton />
      ) : error ? (
        <div className="panel">
          <ErrorState
            title="Could not load your tasks"
            message={error}
            onRetry={loadTasks}
          />
        </div>
      ) : tasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ClipboardList}
            title="No tasks yet"
            description="Create your first task and it will show up here, ready to search and update."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="btn btn-primary"
              >
                <Plus size={16} aria-hidden="true" />
                Add a task
              </button>
            }
          />
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Search}
            title="No matching tasks"
            description="Nothing matches this search and filter combination. Try a different search or clear the filters."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="panel hidden overflow-hidden md:block">
            <table className="w-full table-fixed">
              <caption className="sr-only">Your tasks</caption>
              <thead>
                <tr className="border-b border-line bg-paper/50">
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-muted"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="w-[136px] px-3 py-3 text-left text-xs font-medium text-muted"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="w-[120px] px-3 py-3 text-left text-xs font-medium text-muted"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="w-[150px] px-4 py-3 text-right text-xs font-medium text-muted"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {visibleTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-paper/60"
                  >
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-medium text-ink">
                        {task.title || 'Untitled task'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {task.description || 'No description'}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge value={task.status} />
                    </td>

                    <td className="px-3 py-4">
                      <PriorityIndicator value={task.priority} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => openDetails(task)}
                          className="icon-btn"
                          aria-label={`View ${task.title || 'task'}`}
                          title="View task"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(task)}
                          className="icon-btn"
                          aria-label={`Edit ${task.title || 'task'}`}
                          title="Edit task"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(task)}
                          className="icon-btn hover:bg-danger/10 hover:text-danger"
                          aria-label={`Delete ${task.title || 'task'}`}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:hidden">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={openDetails}
                onEdit={openEdit}
                onDelete={requestDelete}
              />
            ))}
          </div>
        </>
      )}

      {formOpen && (
        <TaskForm
          task={editingTask}
          onClose={closeForm}
          onSubmit={editingTask ? handleUpdate : handleCreate}
        />
      )}

      {details && (
        <TaskDetails
          task={details.task}
          loading={details.loading}
          error={details.error}
          onRetry={() => openDetails({ id: details.id })}
          onClose={closeDetails}
          onEdit={() => openEdit(details.task)}
          onDelete={() => requestDelete(details.task)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this task?"
          message={`This deletes "${deleteTarget.title}". It cannot be undone.`}
          confirmLabel="Delete task"
          busyLabel="Deleting..."
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div
      className="panel divide-y divide-line overflow-hidden"
      aria-busy="true"
      aria-label="Loading tasks"
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="mt-2 h-3 w-3/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="hidden h-4 w-14 sm:block" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
