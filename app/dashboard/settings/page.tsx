'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Key, Shield, LogOut, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // COMPLIANCE: MA data protection – customers can request immediate data deletion
  async function requestDeletion() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone. ' +
        'All your data will be permanently removed within 30 days.',
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/customers/${user?.id}`);
      toast.success('Account scheduled for deletion');
      await logout();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Deletion request failed');
    } finally {
      setDeleting(false);
    }
  }

  async function handleLogoutAll() {
    const confirmed = confirm(
      'This will log you out from all devices, including this one. Continue?',
    );
    if (!confirmed) return;

    setLoggingOutAll(true);
    try {
      await api.post('/auth/logout-all');
      toast.success('Logged out from all devices');
      await logout();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to log out from all devices');
    } finally {
      setLoggingOutAll(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600 text-sm">{user?.email}</p>
      </div>

      {/* Security */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Security</h2>

        <Link href="/dashboard/settings/change-password" className="card flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>

        <Link href="/dashboard/settings/mfa" className="card flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>

        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Log Out All Devices</p>
              <p className="text-sm text-gray-500">Sign out from every device where you are logged in</p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            disabled={loggingOutAll}
            className="btn-secondary text-sm"
          >
            {loggingOutAll ? 'Logging out...' : 'Log Out All'}
          </button>
        </div>
      </div>

      {/* Data Deletion */}
      <div className="card border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-red-800">Delete My Account</h2>
            <p className="text-sm text-gray-600 mt-1">
              This will permanently delete your account and all associated data, including booking
              history and invoices. This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Under Massachusetts data protection law, you have the right to request deletion
              of your personal data. We will process your request within 30 days.
            </p>
            <button
              onClick={requestDeletion}
              disabled={deleting}
              className="btn-danger mt-4 text-sm"
            >
              {deleting ? 'Processing...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
