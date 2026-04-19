'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/auth-store';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, verifyMfa } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // MFA step
  const [mfaStep, setMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired && result.tempToken) {
        setTempToken(result.tempToken);
        setMfaStep(true);
        toast.success('Enter your MFA code');
      } else {
        toast.success('Welcome back!');
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          const role = result.role || useAuthStore.getState().user?.role;
          switch (role) {
            case UserRole.Admin: router.push('/admin'); break;
            case UserRole.Staff: router.push('/staff'); break;
            default: router.push('/dashboard');
          }
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Unable to sign in. Please check your credentials.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      await verifyMfa(tempToken, mfaCode);
      toast.success('MFA verified!');
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const role = useAuthStore.getState().user?.role;
        router.push(role === UserRole.Admin ? '/admin' : '/staff');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid code. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-ocean-950 relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ocean-500/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Honor Cleaning</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {mfaStep ? 'Two-Factor Auth' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {mfaStep ? 'Enter the code from your authenticator app' : 'Sign in to your account to continue'}
            </p>
          </div>

          {formError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {!mfaStep ? (
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                    placeholder="Enter password"
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
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5 mt-2">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <GoogleSignInButton
                text="signin_with"
                onSuccess={async (credential) => {
                  setFormError('');
                  setLoading(true);
                  try {
                    const result = await useAuthStore.getState().googleLogin(credential);
                    if (result.mfaRequired && result.tempToken) {
                      setTempToken(result.tempToken);
                      setMfaStep(true);
                      toast.success('Enter your MFA code');
                    } else {
                      toast.success('Welcome back!');
                      if (redirectTo) {
                        router.push(redirectTo);
                      } else {
                        const role = result.role || useAuthStore.getState().user?.role;
                        switch (role) {
                          case UserRole.Admin: router.push('/admin'); break;
                          case UserRole.Staff: router.push('/staff'); break;
                          default: router.push('/dashboard');
                        }
                      }
                    }
                  } catch (err: any) {
                    const msg = err.response?.data?.error || 'Google sign-in failed';
                    setFormError(msg);
                    toast.error(msg);
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => toast.error('Google sign-in was cancelled')}
              />
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-5">
              <p className="text-sm text-gray-600 text-center bg-ocean-50 border border-ocean-100 rounded-xl p-4">
                Open your authenticator app and enter the 6-digit code.
              </p>
              <input
                type="text"
                required
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.3em] font-mono"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
              />
              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5">
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}
        </div>

        {/* Bottom link */}
        <p className="mt-8 text-center text-sm text-brand-200/70">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-white font-semibold hover:text-brand-200 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
