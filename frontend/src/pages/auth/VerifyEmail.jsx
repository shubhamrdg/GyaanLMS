import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import VerificationCodeForm from '../../components/VerificationCodeForm';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const performVerification = async () => {
      try {
        const { data } = await api.post(`/auth/verify-email/${token}`);
        if (isMounted) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
        }
      }
    };

    if (token) {
      performVerification();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-premium p-8 border border-gray-100 dark:border-gray-700 text-center">
        {status === 'verifying' && (
          <div className="py-8">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait a moment while we verify your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Verified!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="block w-full btn-primary py-2.5 text-center font-bold"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-red-600 dark:text-red-400 text-sm mb-6">{message}</p>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mb-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Verify with the 6-digit code instead
              </p>
              <VerificationCodeForm
                showEmailField
                onVerified={() => {
                  setStatus('success');
                  setMessage('Email verified successfully! You can now log in.');
                }}
              />
            </div>

            <Link
              to="/login"
              className="text-xs text-primary-600 hover:text-primary-500 font-bold"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
