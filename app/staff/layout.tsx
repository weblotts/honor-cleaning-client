'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import AuthGuard from '@/components/AuthGuard';
import { Sparkles, LogOut } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <AuthGuard allowedRoles={[UserRole.Staff]}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/staff" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-600" />
              <span className="font-bold text-gray-900">Staff Portal</span>
            </Link>
            <button
              onClick={() => logout()}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
