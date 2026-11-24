import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState(() => ({
    username: location.state?.username || '',
    password: '',
  }))
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
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

    const nextErrors = {}

    if (!form.username.trim()) {
      nextErrors.username = 'Enter your username.'
    }

    if (!form.password) {
      nextErrors.password = 'Enter your password.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setApiError('')

    try {
      await login(form.username.trim(), form.password)
      showToast('Signed in. Your tasks are ready.', 'success')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message =
        error.response?.status === 401
          ? 'That username and password do not match. Try again.'
          : getErrorMessage(error, 'Sign-in failed. Try again.')

      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where you left off."
      footer={
        <>
          New to Docket?{' '}
          <Link
            to="/register"
            className="font-medium text-cobalt hover:text-cobalt-deep"
          >
            Create an account
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
            placeholder="your-username"
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              className={`field-input pr-11 ${
                errors.password
                  ? 'border-danger focus:border-danger focus:ring-danger/15'
                  : ''
              }`}
              placeholder="Your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-1 my-auto grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-paper hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="field-error">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
