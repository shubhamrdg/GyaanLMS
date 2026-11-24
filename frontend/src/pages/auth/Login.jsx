// pages/auth/Login.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../redux/slices/authSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector(state => state.auth)

  const errorMessage = typeof error === 'string' ? error : error?.message || ''
  const isUnverified = typeof error === 'object' && error?.requiresVerification
  const unverifiedEmail = error?.email || form.email

  useEffect(() => {
    if (user) {
      const routes = { admin: '/admin', faculty: '/faculty', student: '/student' }
      navigate(routes[user.role] || '/')
    }
  }, [user, navigate])

  useEffect(() => {
    if (error && !isUnverified) {
      toast.error(errorMessage)
    }
  }, [error, isUnverified, errorMessage])

  const handleSubmit = (e) => {
    e.preventDefault()
    setResendSuccess('')
    dispatch(loginUser(form))
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    setResending(true)
    setResendSuccess('')
    try {
      const { data } = await api.post('/auth/resend-verification', { email: unverifiedEmail })
      setResendSuccess(data.message || 'A new verification code has been sent to your email!')
      toast.success(data.message || 'Verification code resent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="GyaanLMS logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg bg-white" />
          <h1 className="text-2xl font-bold dark:text-white">Welcome Back!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your GyaanLMS account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => {
                  setForm({ ...form, email: e.target.value })
                  if (error) dispatch(clearError())
                }}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-500 font-medium">Forgot Password?</Link>
              </div>
              <input
                type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => {
                  setForm({ ...form, password: e.target.value })
                  if (error) dispatch(clearError())
                }}
                required
              />
            </div>

            {isUnverified ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="font-semibold leading-relaxed">
                    {errorMessage}
                  </div>
                </div>

                {resendSuccess ? (
                  <div className="text-green-700 dark:text-green-300 font-semibold bg-green-50 dark:bg-green-900/30 p-2.5 rounded-xl border border-green-200 dark:border-green-800">
                    ✅ {resendSuccess}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full text-center py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-sm"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Code'}
                  </button>
                )}

                <Link
                  to={`/verify-email-code${unverifiedEmail ? `?email=${encodeURIComponent(unverifiedEmail)}` : ''}`}
                  className="block w-full text-center py-2 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-amber-700 dark:text-amber-200 font-bold rounded-xl border border-amber-200 dark:border-amber-800 transition-all"
                >
                  I Have a Verification Code
                </Link>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                <span className="text-sm">⚠️</span>
                {errorMessage}
              </div>
            ) : null}

            <button type="submit" className="w-full btn-primary py-2.5" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:underline font-medium">Register</Link>
          </div>
          <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Have an inquiry? <Link to="/contact" className="text-primary-600 hover:underline font-medium">Contact Admin</Link>
          </div>
        </div>
      </div>
    </div >
  )
}

export default Login
