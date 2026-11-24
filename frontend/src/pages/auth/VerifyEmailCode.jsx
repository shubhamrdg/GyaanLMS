// pages/auth/VerifyEmailCode.jsx
// Standalone entry point for users who only have the 6-digit code from their
// verification email. Reachable from Login/Register and at /verify-email-code.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import VerificationCodeForm from '../../components/VerificationCodeForm'

const VerifyEmailCode = () => {
  const [searchParams] = useSearchParams()
  const [verified, setVerified] = useState(false)
  const email = searchParams.get('email') || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-premium p-8 border border-gray-100 dark:border-gray-700">
        {verified ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Verified!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Your email address has been verified. You can now sign in to GyaanLMS.
            </p>
            <Link to="/login" className="block w-full btn-primary py-2.5 text-center font-bold">
              Sign In Now
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              🔢
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Verification Code</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              We emailed you a 6-digit code. Enter it below to activate your account.
            </p>

            <VerificationCodeForm
              email={email}
              showEmailField
              onVerified={() => setVerified(true)}
            />

            <Link
              to="/login"
              className="inline-block mt-6 text-xs text-primary-600 hover:text-primary-500 font-bold"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailCode
