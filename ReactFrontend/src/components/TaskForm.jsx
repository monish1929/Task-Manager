import { useState } from 'react'
import Modal from './Modal'
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  toPriorityOption,
  toStatusOption,
} from '../utils/taskMeta'
import { getErrorMessage } from '../utils/errors'

const DESCRIPTION_LIMIT = 200

export default function TaskForm({ task, onClose, onSubmit }) {
  const isEditing = Boolean(task)

  const [form, setForm] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: toStatusOption(task?.status),
    priority: toPriorityOption(task?.priority),
  }))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  function requestClose() {
    if (!saving) {
      onClose()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const title = form.title.trim()
    const description = form.description.trim()
    const nextErrors = {}

    if (!title) {
      nextErrors.title = 'Give this task a title.'
    }

    if (description.length > DESCRIPTION_LIMIT) {
      nextErrors.description = `Keep the description under ${DESCRIPTION_LIMIT} characters.`
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setSubmitError('')

    try {
      await onSubmit({
        title,
        description,
        status: form.status,
        priority: form.priority,
      })
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, 'Could not save this task. Try again.'),
      )
    } finally {
      setSaving(false)
    }
  }

  function inputClass(field) {
    return `field-input ${
      errors[field]
        ? 'border-danger focus:border-danger focus:ring-danger/15'
        : ''
    }`
  }

  return (
    <Modal
      title={isEditing ? 'Edit task' : 'New task'}
      description={
        isEditing
          ? `Task #${task.id}`
          : 'Add what needs doing and where it stands.'
      }
      onClose={requestClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={requestClose}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      }
    >
      <form
        id="task-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <div>
          <label htmlFor="task-title" className="field-label">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className={inputClass('title')}
            placeholder="What needs doing?"
            autoFocus
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
          />
          {errors.title && (
            <p id="task-title-error" className="field-error">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label
              htmlFor="task-description"
              className="text-sm font-medium text-ink"
            >
              Description
            </label>
            <span
              className={`text-xs tabular-nums ${
                form.description.length > DESCRIPTION_LIMIT
                  ? 'text-danger'
                  : 'text-muted'
              }`}
            >
              {form.description.length}/{DESCRIPTION_LIMIT}
            </span>
          </div>
          <textarea
            id="task-description"
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            rows={4}
            maxLength={DESCRIPTION_LIMIT}
            className={`${inputClass('description')} min-h-[104px] resize-y`}
            placeholder="Add context, a link, or the next step."
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? 'task-description-error' : undefined
            }
          />
          {errors.description && (
            <p id="task-description-error" className="field-error">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-status" className="field-label">
              Status
            </label>
            <select
              id="task-status"
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="field-input"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="field-label">
              Priority
            </label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value)}
              className="field-input"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm leading-relaxed text-danger"
          >
            {submitError}
          </div>
        )}
      </form>
    </Modal>
  )
}
