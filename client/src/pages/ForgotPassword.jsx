import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Copy, Key } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { message, tempPassword }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setResult(data);
      if (data.tempPassword) {
        toast.success('Temporary password generated!');
      } else {
        toast.success('Request processed');
      }
    } catch (error) {
      // Still show success UI to avoid revealing if email exists
      setResult({ message: 'If the email is registered, a temporary password has been generated.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (result) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-found-100 dark:bg-found-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-found-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {result.tempPassword ? 'Temporary Password Generated' : 'Request Processed'}
          </h1>

          {result.tempPassword ? (
            <>
              <p className="text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                A temporary password has been generated for <span className="font-medium text-surface-700 dark:text-surface-300">{email}</span>. 
                Use it to login, then change your password in Settings.
              </p>

              {/* Temp password display */}
              <div className="card p-5 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold">Your Temporary Password</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800 p-3 rounded-xl">
                  <code className="flex-1 text-lg font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                    {result.tempPassword}
                  </code>
                  <button
                    onClick={() => copyToClipboard(result.tempPassword)}
                    className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-surface-500" />
                  </button>
                </div>
                <p className="text-xs text-surface-400 mt-2">
                  ⚠️ Please change this password immediately after logging in.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link to="/login" className="btn btn-primary w-full">
                  Go to Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-surface-500 dark:text-surface-400 mb-6 leading-relaxed">
                If <span className="font-medium text-surface-700 dark:text-surface-300">{email}</span> is registered with FindIt, 
                a password reset has been processed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setResult(null); setEmail(''); }}
                  className="btn btn-secondary w-full"
                >
                  Try Another Email
                </button>
                <Link to="/login" className="btn btn-ghost w-full">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className="text-surface-500 dark:text-surface-400">
            Enter your email and we'll generate a temporary password
          </p>
        </div>

        <div className="card p-8 animate-slide-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@university.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-500 font-semibold hover:text-primary-600 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
