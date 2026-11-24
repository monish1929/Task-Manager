import { useState } from 'react'
import Modal from './Modal'
import { getErrorMessage } from '../utils/errors'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  busyLabel = 'Working...',
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function requestClose() {
    if (!busy) {
      onClose()
    }
  }

  async function handleConfirm() {
    setBusy(true)
    setError('')

    try {
      await onConfirm()
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'Could not complete that action.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={title}
      onClose={requestClose}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={requestClose}
            className="btn btn-secondary"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-danger"
            disabled={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{message}</p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm leading-relaxed text-danger"
        >
          {error}
        </div>
      )}
    </Modal>
  )
}
