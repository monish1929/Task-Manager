import { Eye, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityIndicator from './PriorityIndicator'

export default function TaskCard({ task, onView, onEdit, onDelete }) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-ink">
          {task.title || 'Untitled task'}
        </h3>
        <PriorityIndicator
          value={task.priority}
          showLabel={false}
          className="mt-0.5 shrink-0"
        />
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
        {task.description || 'No description'}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <StatusBadge value={task.status} />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onView(task)}
            className="icon-btn"
            aria-label={`View ${task.title || 'task'}`}
            title="View task"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="icon-btn"
            aria-label={`Edit ${task.title || 'task'}`}
            title="Edit task"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="icon-btn hover:bg-danger/10 hover:text-danger"
            aria-label={`Delete ${task.title || 'task'}`}
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
