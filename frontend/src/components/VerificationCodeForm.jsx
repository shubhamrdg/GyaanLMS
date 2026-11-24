// components/VerificationCodeForm.jsx
// Shared 6-digit email verification code form used by Register, VerifyEmail and
// the standalone VerifyEmailCode page. Verifies against
// POST /api/auth/verify-email-code and can resend the code.
import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

const VerificationCodeForm = ({ email = '', showEmailField = false, onVerified, className = '' }) => {
  const [emailInput, setEmailInput] = useState(email)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    setEmailInput(email)
  }, [email])

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const targetEmail = (emailInput || email || '').trim()

  const handleCodeChange = (e) => {
    // Keep digits only so pasted codes like "123 456" still work
    setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
    if (error) setError('')
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!targetEmail) {
      return setError('Please enter your registered email address.')
    }
    if (code.length !== CODE_LENGTH) {
      return setError(`Please enter the ${CODE_LENGTH}-digit code from your email.`)
    }

    setVerifying(true)
    setError('')
    try {
      const { data } = await api.post('/auth/verify-email-code', { email: targetEmail, code })
      toast.success(data?.message || 'Email verified successfully!')
      setCode('')
      onVerified?.(data)
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.'
      setError(message)
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resending || cooldown > 0) return
    if (!targetEmail) {
      return setError('Please enter your registered email address.')
    }

    setResending(true)
    setError('')
    try {
      const { data } = await api.post('/auth/resend-verification', { email: targetEmail })
      toast.success(data?.message || 'A new verification code has been sent!')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send a new verification code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className={`space-y-3 text-left ${className}`}>
      {showEmailField && (
        <div>
          <label className="label">Registered Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value)
              if (error) setError('')
            }}
            required
          />
        </div>
      )}

      <div>
        <label className="label">{CODE_LENGTH}-Digit Verification Code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          className="input text-center text-2xl font-bold tracking-[0.5em]"
          placeholder="······"
          value={code}
          onChange={handleCodeChange}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
          The code is valid for 10 minutes. Never share it with anyone.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold animate-shake">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={verifying || code.length !== CODE_LENGTH}
        className="w-full btn-primary py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {verifying ? 'Verifying...' : 'Verify Email'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || cooldown > 0}
        className="w-full btn-secondary py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {resending
          ? 'Sending...'
          : cooldown > 0
          ? `Resend Code in ${cooldown}s`
          : 'Resend Verification Code'}
      </button>
    </form>
  )
}

export default VerificationCodeForm
