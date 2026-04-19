'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, Check, X, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function PasswordChecklist({ password }: { password: string }) {
  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-2 space-y-1">
      {rules.map((rule) => (
        <li key={rule.label} className="flex items-center gap-1.5 text-xs">
          {rule.met ? (
            <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
          )}
          <span className={rule.met ? 'text-green-700' : 'text-gray-500'}>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to reset password. The link may have expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-500 mb-8">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="btn-primary">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-display">Password Reset Complete</h1>
          <p className="text-gray-500 mb-8">Your password has been updated. You can now sign in with your new password.</p>
          <Link href="/login" className="btn-primary text-base px-8 py-3.5">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-ocean-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/10">
            <KeyRound className="h-10 w-10 text-brand-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 font-display">Create New Password</h2>
          <p className="text-brand-200/70 text-lg leading-relaxed">
            Choose a strong, unique password to keep your account secure.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 font-display">Honor Cleaning</span>
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 font-display">Reset Your Password</h2>
            <p className="text-gray-500 text-sm mb-8">Enter your new password below</p>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordChecklist password={password} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className={`input-field ${confirmPassword && password !== confirmPassword ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirm new password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isValid}
                className="btn-primary w-full text-base py-3.5"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="text-brand-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
