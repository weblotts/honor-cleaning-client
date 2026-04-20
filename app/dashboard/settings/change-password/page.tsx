'use client';

import { useState } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, Check, X, Lock } from 'lucide-react';

type ChangePasswordFields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Isolated: only re-renders when newPassword changes
function RequirementsChecklist() {
  const newPassword = useWatch<ChangePasswordFields>({ name: 'newPassword' }) ?? '';

  if (!newPassword) return null;

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /\d/.test(newPassword) },
  ];

  return (
    <ul className="mt-3 space-y-1">
      {requirements.map((req) => (
        <li
          key={req.label}
          className={`flex items-center gap-2 text-sm ${req.met ? 'text-green-600' : 'text-gray-400'}`}
        >
          {req.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {req.label}
        </li>
      ))}
    </ul>
  );
}

// Isolated: only re-renders when newPassword or confirmPassword changes
function PasswordMatchIndicator() {
  const newPassword = useWatch<ChangePasswordFields>({ name: 'newPassword' }) ?? '';
  const confirmPassword = useWatch<ChangePasswordFields>({ name: 'confirmPassword' }) ?? '';

  if (!confirmPassword) return null;

  const match = newPassword === confirmPassword;
  return match ? (
    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
      <Check className="h-3.5 w-3.5" /> Passwords match
    </p>
  ) : (
    <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
  );
}

// Isolated: controls submit button disabled state
function SubmitButton({ submitting }: { submitting: boolean }) {
  const currentPassword = useWatch<ChangePasswordFields>({ name: 'currentPassword' }) ?? '';
  const newPassword = useWatch<ChangePasswordFields>({ name: 'newPassword' }) ?? '';
  const confirmPassword = useWatch<ChangePasswordFields>({ name: 'confirmPassword' }) ?? '';

  const allRequirementsMet =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && allRequirementsMet && passwordsMatch && !submitting;

  return (
    <button type="submit" disabled={!canSubmit} className="btn-primary w-full">
      {submitting ? 'Changing Password...' : 'Change Password'}
    </button>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<ChangePasswordFields>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { register, handleSubmit, getValues } = methods;

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setSubmitting(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      router.push('/dashboard/settings');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your account password. You will be signed out of other sessions.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="card space-y-5">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                className="input pl-10 pr-10"
                placeholder="Enter current password"
                {...register('currentPassword', { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                className="input pl-10 pr-10"
                placeholder="Enter new password"
                {...register('newPassword', {
                  required: true,
                  validate: {
                    minLen: (v) => v.length >= 8,
                    upper: (v) => /[A-Z]/.test(v),
                    lower: (v) => /[a-z]/.test(v),
                    digit: (v) => /\d/.test(v),
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Isolated: only re-renders on newPassword change */}
            <RequirementsChecklist />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="input pl-10 pr-10"
                placeholder="Re-enter new password"
                {...register('confirmPassword', {
                  required: true,
                  validate: (v, formValues) => v === formValues.newPassword,
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Isolated: only re-renders on confirmPassword/newPassword change */}
            <PasswordMatchIndicator />
          </div>

          {/* Isolated: only re-renders when any password field changes */}
          <SubmitButton submitting={submitting} />
        </form>
      </FormProvider>
    </div>
  );
}
