// pages/auth/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../redux/slices/authSlice'
import { validatePassword } from '../../utils/validatePassword'
import VerificationCodeForm from '../../components/VerificationCodeForm'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [registeredEmail, setRegisteredEmail] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector(state => state.auth)

  useEffect(() => {
    if (user) {
      const routes = { admin: '/admin', faculty: '/faculty', student: '/student' }
      navigate(routes[user.role] || '/')
    }
  }, [user, navigate])

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Registration failed'
      toast.error(errorMessage)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.isValid) {
      return toast.error(passwordCheck.message);
    }
    
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Check your email for the verification code.')
      setRegisteredEmail(form.email)
    }
  }

  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              ✉️
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              We have sent a 6-digit verification code to:
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl font-semibold text-primary-600 dark:text-primary-400 text-sm mb-6 break-all">
              {registeredEmail}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 leading-relaxed">
              Enter the 6-digit code below (or click the link in the email) to activate your account. Once verified, you will be able to log in.
            </p>

            <VerificationCodeForm
              email={registeredEmail}
              onVerified={() => navigate('/login')}
            />

            <Link
              to="/login"
              className="block w-full btn-primary py-2.5 text-sm text-center mt-3"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="GyaanLMS logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg bg-white" />
          <h1 className="text-2xl font-bold dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join GyaanLMS today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Rohan Patel"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 8 chars, A-Z, a-z, 0-9, symbol"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div>
              <label className="label">Register As</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="faculty">Faculty / Instructor</option>
              </select>
            </div>

            <button type="submit" className="w-full btn-primary py-2.5" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
