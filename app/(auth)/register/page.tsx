'use client';

import { useState, Suspense } from 'react';
import { useForm, useWatch, FormProvider, Controller } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Check, X, AlertCircle, Mail, User, Star,
} from 'lucide-react';
import { PhoneInput } from '@/components/FormFields';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuthStore } from '@/lib/auth-store';
import { UserRole } from '@/types';
import whiteLogo from '@/assets/HonorCleaners-WhiteLogo.png';

interface FieldErrors { [key: string]: string }

type RegisterFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  marketingConsent: boolean;
};

function parseApiError(err: any): { message: string; fieldErrors: FieldErrors } {
  const data = err?.response?.data;
  if (!data) return { message: 'Something went wrong. Please try again.', fieldErrors: {} };
  const fieldErrors: FieldErrors = {};
  if (data.details && Array.isArray(data.details)) {
    for (const detail of data.details) fieldErrors[detail.field] = detail.message;
    return { message: 'Please fix the errors below.', fieldErrors };
  }
  return { message: data.error || 'Registration failed. Please try again.', fieldErrors: {} };
}

function PasswordChecklist() {
  const password = (useWatch<RegisterFields, 'password'>({ name: 'password' }) ?? '') as string;
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
          {rule.met
            ? <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            : <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
          }
          <span className={rule.met ? 'text-emerald-700' : 'text-gray-400'}>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');

  const methods = useForm<RegisterFields>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '', marketingConsent: false },
  });
  const { register, handleSubmit, control, setError, formState: { errors } } = methods;

  const redirectAfterRegister = (role?: string) => {
    if (redirectTo) { router.push(redirectTo); return; }
    switch (role) {
      case UserRole.Admin: router.push('/admin'); break;
      case UserRole.Staff: router.push('/staff'); break;
      default: router.push('/dashboard');
    }
  };

  const onSubmit = handleSubmit(async ({ name, email, password, phone, marketingConsent }) => {
    setFormError('');
    setLoading(true);
    try {
      await registerUser({ name: name.trim(), email, password, phone: phone || undefined, marketingConsent });
      toast.success('Account created successfully!');
      router.push(redirectTo || '/dashboard');
    } catch (err: any) {
      const { message, fieldErrors: serverErrors } = parseApiError(err);
      Object.entries(serverErrors).forEach(([field, msg]) => {
        setError(field as keyof RegisterFields, { type: 'server', message: msg });
      });
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  const inputClass = (field: keyof RegisterFields) =>
    `input-field ${errors[field] ? 'border-red-300 ring-1 ring-red-300 focus:border-red-400 focus:ring-red-400' : ''}`;

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[36%] flex-col bg-brand-950 px-14 py-12 relative overflow-hidden select-none">

        {/* Dot grid */}
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
            Get started
          </p>
          <h2 className="text-[2.4rem] xl:text-[2.75rem] font-extrabold text-white leading-[1.1] font-display">
            A cleaner space<br />starts here.
          </h2>
          <p className="mt-4 text-brand-200/50 text-sm leading-relaxed max-w-[22rem]">
            Join hundreds of homes and businesses across Massachusetts that trust Honor Cleaning.
          </p>

          {/* Testimonial card */}
          <div className="mt-12 bg-brand-800/50 border border-brand-700/60 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-brand-100/70 text-sm leading-relaxed italic">
              &ldquo;Honor Cleaning has been a game-changer for our office. Professional, thorough, and always on time.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600/60 border border-brand-500/40 flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                S
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">Sarah M.</p>
                <p className="text-brand-400/50 text-xs mt-1">Office Manager, Waltham MA</p>
              </div>
            </div>
          </div>

          {/* Stats */}
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

        <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10 overflow-y-auto">
          <div className="w-full max-w-[540px]">

            {/* Heading */}
            <div className="mb-7 text-center lg:text-left">
              <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">
                Create your account
              </h1>
              <p className="text-gray-500 text-sm mt-1.5">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-9">

              {formError && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="space-y-5" noValidate>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className={`${inputClass('name')} pl-11`}
                          placeholder="John Doe"
                          autoComplete="name"
                          autoFocus
                          {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'At least 2 characters' },
                          })}
                        />
                      </div>
                      <FieldError message={errors.name?.message} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          className={`${inputClass('email')} pl-11`}
                          placeholder="john@example.com"
                          autoComplete="email"
                          {...register('email', {
                            required: 'Email is required',
                            validate: (v) => v.includes('@') || 'Enter a valid email',
                          })}
                        />
                      </div>
                      <FieldError message={errors.email?.message} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                      <span className="text-gray-400 text-xs font-normal">— optional</span>
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput value={field.value} onChange={field.onChange} error={!!errors.phone} />
                      )}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>

                  {/* Password + Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`${inputClass('password')} pr-11`}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          {...register('password', {
                            required: 'Password is required',
                            validate: {
                              minLen: (v) => v.length >= 8 || 'At least 8 characters',
                              upper: (v) => /[A-Z]/.test(v) || 'One uppercase letter required',
                              lower: (v) => /[a-z]/.test(v) || 'One lowercase letter required',
                              digit: (v) => /\d/.test(v) || 'One number required',
                            },
                          })}
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
                      <FieldError message={errors.password?.message} />
                      <PasswordChecklist />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          className={`${inputClass('confirmPassword')} pr-11`}
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (v, vals) => v === vals.password || 'Passwords do not match',
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowConfirm(!showConfirm)}
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FieldError message={errors.confirmPassword?.message} />
                    </div>
                  </div>

                  {/* Marketing consent */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                        {...register('marketingConsent')}
                      />
                    </div>
                    <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors">
                      Send me promotions, tips, and updates from Honor Cleaning. Unsubscribe anytime.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-[15px]"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <GoogleSignInButton
                    text="signup_with"
                    onSuccess={async (credential) => {
                      setFormError('');
                      setLoading(true);
                      try {
                        const result = await useAuthStore.getState().googleLogin(credential);
                        toast.success('Account created with Google!');
                        redirectAfterRegister(result.role || useAuthStore.getState().user?.role);
                      } catch (err: any) {
                        const msg = err.response?.data?.error || 'Google sign-up failed';
                        setFormError(msg);
                        toast.error(msg);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => toast.error('Google sign-up was cancelled')}
                  />
                </form>
              </FormProvider>
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              By signing up, you agree to our{' '}
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
