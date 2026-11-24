import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function Register() {
  const { isAuthenticated, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const username = form.username.trim()
    const nextErrors = {}

    if (!username) {
      nextErrors.username = 'Choose a username.'
    } else if (username.length < 3) {
      nextErrors.username = 'Use at least 3 characters.'
    } else if (username.length > 30) {
      nextErrors.username = 'Use 30 characters or fewer.'
    }

    if (!form.password) {
      nextErrors.password = 'Choose a password.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Use at least 6 characters.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Enter your password again.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'The passwords do not match.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setApiError('')

    try {
      await register(username, form.password)
      showToast('Account created. Sign in to continue.', 'success')
      navigate('/login', { state: { username } })
    } catch (error) {
      const message =
        error.response?.status === 409
          ? 'That username is already taken. Try another one.'
          : getErrorMessage(error, 'Registration failed. Try again.')

      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account keeps your tasks separate from everyone else's."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-cobalt hover:text-cobalt-deep"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm leading-relaxed text-danger"
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            {apiError}
          </div>
        )}

        <div>
          <label htmlFor="username" className="field-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            className={`field-input ${
              errors.username
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : ''
            }`}
            placeholder="Choose a username"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <p id="username-error" className="field-error">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            className={`field-input ${
              errors.password
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : ''
            }`}
            placeholder="At least 6 characters"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'password-error' : 'password-hint'
            }
          />
          {errors.password ? (
            <p id="password-error" className="field-error">
              {errors.password}
            </p>
          ) : (
            <p id="password-hint" className="mt-1.5 text-xs text-muted">
              Use 6 characters or more.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField('confirmPassword', event.target.value)
            }
            className={`field-input ${
              errors.confirmPassword
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : ''
            }`}
            placeholder="Enter it again"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'confirm-password-error' : undefined
            }
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="field-error">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
