'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/auth-store';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle, CheckCircle, Star, Lock } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import whiteLogo from '@/assets/HonorCleaners-WhiteLogo.png';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

type LoginFields = { email: string; password: string };
type MfaFields = { mfaCode: string };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, verifyMfa } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const { register, handleSubmit } = useForm<LoginFields>();
  const { register: mfaRegister, handleSubmit: mfaHandleSubmit } = useForm<MfaFields>();

  const redirectAfterLogin = (role?: string) => {
    if (redirectTo) { router.push(redirectTo); return; }
    switch (role) {
      case UserRole.Admin: router.push('/admin'); break;
      case UserRole.Staff: router.push('/staff'); break;
      default: router.push('/dashboard');
    }
  };

  const handleLogin = handleSubmit(async ({ email, password }) => {
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
        redirectAfterLogin(result.role || useAuthStore.getState().user?.role);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Unable to sign in. Please check your credentials.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  });

  const handleMfa = mfaHandleSubmit(async ({ mfaCode }) => {
    setFormError('');
    setLoading(true);
    try {
      await verifyMfa(tempToken, mfaCode.replace(/\D/g, ''));
      toast.success('MFA verified!');
      const role = useAuthStore.getState().user?.role;
      router.push(role === UserRole.Admin ? '/admin' : '/staff');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid code. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col bg-brand-950 px-14 py-12 relative overflow-hidden select-none">

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.045]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-block">
          <Image
            src={whiteLogo}
            alt="Honor Cleaning Co."
            height={34}
            style={{ width: 'auto', height: '34px' }}
          />
        </Link>

        {/* Copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.18em] mb-5">
            Welcome back
          </p>
          <h2 className="text-[2.4rem] xl:text-[2.75rem] font-extrabold text-white leading-[1.1] font-display">
            Your clean space<br />is one sign-in away.
          </h2>
          <p className="mt-4 text-brand-200/50 text-sm leading-relaxed max-w-[22rem]">
            Manage bookings, track service history, and schedule your next clean — all in one place.
          </p>

          {/* Proof card */}
          <div className="mt-12 bg-brand-800/50 border border-brand-700/60 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">Booking Confirmed</p>
                  <p className="text-brand-400/70 text-xs mt-1">Deep Clean · Tomorrow 9:00 AM</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold shrink-0">
                Active
              </span>
            </div>
            <div className="h-px bg-brand-700/50 my-4" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-brand-300/60 text-xs italic truncate">
                &ldquo;Spotless every visit — absolutely recommend!&rdquo;
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { value: '500+', label: 'Cleanings done' },
              { value: '4.9★', label: 'Avg. rating' },
              { value: '100%', label: 'Guarantee' },
            ].map((s) => (
              <div key={s.label} className="bg-brand-800/40 border border-brand-700/40 rounded-xl px-3 py-3 text-center">
                <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                <p className="text-brand-400/50 text-[11px] mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-brand-400/40">Serving Massachusetts with pride</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">

        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center px-6 py-5 bg-brand-950">
          <Link href="/">
            <Image src={whiteLogo} alt="Honor Cleaning Co." height={26} style={{ width: 'auto', height: '26px' }} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-14 sm:px-10">
          <div className="w-full max-w-[420px]">

            {/* Heading (outside card) */}
            {!mfaStep && (
              <div className="mb-7 text-center lg:text-left">
                <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  No account yet?{' '}
                  <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                    Create one free
                  </Link>
                </p>
              </div>
            )}

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-9">

              {mfaStep && (
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-7 w-7 text-brand-600" />
                  </div>
                  <h1 className="text-xl font-extrabold text-gray-900 font-display">Two-factor auth</h1>
                  <p className="text-gray-500 text-sm mt-1.5">Enter the 6-digit code from your authenticator app</p>
                </div>
              )}

              {formError && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {!mfaStep ? (
                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      {...register('email', { required: true })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pr-11"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...register('password', { required: true })}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-[15px] mt-1"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
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
                          redirectAfterLogin(result.role || useAuthStore.getState().user?.role);
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
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 text-center">
                    Open your authenticator app and enter the code shown for Honor Cleaning.
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="input-field text-center text-3xl tracking-[0.4em] font-mono py-5"
                    placeholder="000000"
                    autoFocus
                    {...mfaRegister('mfaCode', { required: true })}
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-[15px]">
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors text-center py-1"
                    onClick={() => { setMfaStep(false); setFormError(''); }}
                  >
                    ← Back to sign in
                  </button>
                </form>
              )}
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              By signing in, you agree to our{' '}
              <Link href="/privacy-policy" className="text-brand-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
