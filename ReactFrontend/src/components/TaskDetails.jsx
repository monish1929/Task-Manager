import { Trash2 } from 'lucide-react'
import Modal from './Modal'
import Loading from './Loading'
import ErrorState from './ErrorState'
import StatusBadge from './StatusBadge'
import PriorityIndicator from './PriorityIndicator'

export default function TaskDetails({
  task,
  loading,
  error,
  onRetry,
  onClose,
  onEdit,
  onDelete,
}) {
  const footer = task ? (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onDelete}
        className="btn btn-ghost justify-start px-2 text-danger hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={16} />
        Delete task
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary flex-1 sm:flex-none"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="btn btn-primary flex-1 sm:flex-none"
        >
          Edit task
        </button>
      </div>
    </div>
  ) : undefined

  return (
    <Modal
      title="Task details"
      description={task ? `Task #${task.id}` : undefined}
      onClose={onClose}
      footer={footer}
    >
      {loading && <Loading label="Opening task" className="py-10" />}

      {!loading && error && (
        <ErrorState
          title="Could not open this task"
          message={error}
          onRetry={onRetry}
        />
      )}

      {!loading && task && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusBadge value={task.status} />
            <PriorityIndicator value={task.priority} />
          </div>

          <h3 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-[-0.01em] text-ink">
            {task.title || 'Untitled task'}
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {task.description || 'No description added.'}
          </p>
        </>
      )}
    </Modal>
  )
}
