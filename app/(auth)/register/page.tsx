'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, Check, X, AlertCircle, Mail, User } from 'lucide-react';
import { PhoneInput } from '@/components/FormFields';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuthStore } from '@/lib/auth-store';
import { UserRole } from '@/types';

interface FieldErrors {
  [key: string]: string;
}

function parseApiError(err: any): { message: string; fieldErrors: FieldErrors } {
  const data = err?.response?.data;
  if (!data) return { message: 'Something went wrong. Please try again.', fieldErrors: {} };

  const fieldErrors: FieldErrors = {};

  if (data.details && Array.isArray(data.details)) {
    for (const detail of data.details) {
      fieldErrors[detail.field] = detail.message;
    }
    return {
      message: 'Please fix the errors below.',
      fieldErrors,
    };
  }

  return { message: data.error || 'Registration failed. Please try again.', fieldErrors: {} };
}

function PasswordChecklist({ password }: { password: string }) {
  const rules = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
    ],
    [password],
  );

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
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
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError('');

    const errors: FieldErrors = {};

    if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!form.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(form.password)) {
      errors.password = 'Password must contain a lowercase letter';
    } else if (!/\d/.test(form.password)) {
      errors.password = 'Password must contain a number';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        marketingConsent: form.marketingConsent,
      });
      toast.success('Account created successfully!');
      router.push(redirectTo || '/dashboard');
    } catch (err: any) {
      const { message, fieldErrors: serverErrors } = parseApiError(err);
      setFieldErrors(serverErrors);
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `input-field ${fieldErrors[field] ? 'border-red-400 ring-1 ring-red-400 focus:border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-ocean-950 relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ocean-500/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-lg">
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
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1.5">Get started with your free account</p>
          </div>

          {formError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className={`${inputClass('name')} pl-11`}
                    value={form.name}
                    placeholder="John Doe"
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      clearFieldError('name');
                    }}
                  />
                </div>
                <FieldError message={fieldErrors.name} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className={`${inputClass('email')} pl-11`}
                    value={form.email}
                    placeholder="john@example.com"
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      clearFieldError('email');
                    }}
                  />
                </div>
                <FieldError message={fieldErrors.email} />
              </div>
            </div>

            {/* Phone — full width */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <PhoneInput
                value={form.phone}
                onChange={(raw) => {
                  setForm({ ...form, phone: raw });
                  clearFieldError('phone');
                }}
                error={!!fieldErrors.phone}
              />
              <FieldError message={fieldErrors.phone} />
            </div>

            {/* Row 2: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`${inputClass('password')} pr-10`}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      clearFieldError('password');
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
                <PasswordChecklist password={form.password} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    className={`${inputClass('confirmPassword')} pr-10`}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      clearFieldError('confirmPassword');
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={fieldErrors.confirmPassword} />
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.marketingConsent}
                onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })}
              />
              <span>
                I agree to receive promotional emails and SMS from Honor Cleaning. You can
                unsubscribe at any time.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <GoogleSignInButton
              text="signup_with"
              onSuccess={async (credential) => {
                setFormError('');
                setLoading(true);
                try {
                  const result = await useAuthStore.getState().googleLogin(credential);
                  toast.success('Account created with Google!');
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

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing up, you agree to our{' '}
            <Link href="/privacy-policy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Bottom link */}
        <p className="mt-8 text-center text-sm text-brand-200/70">
          Already have an account?{' '}
          <Link href="/login" className="text-white font-semibold hover:text-brand-200 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
