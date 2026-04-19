'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import AuthGuard from '@/components/AuthGuard';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  BarChart3,
  ScrollText,
  ShieldAlert,
  LogOut,
  Sparkles,
  FileText,
  ClipboardList,
  Receipt,
  MessageSquare,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/jobs', label: 'Job Board', icon: CalendarDays },
  { href: '/admin/quotations', label: 'Quotations', icon: ClipboardList },
  { href: '/admin/invoices', label: 'Invoices', icon: FileText },
  { href: '/admin/receipts', label: 'Receipts', icon: Receipt },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/staff', label: 'Staff', icon: UserCog },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/incident-response', label: 'Incident Response', icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <AuthGuard allowedRoles={[UserRole.Admin]}>
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar — fixed, independently scrollable */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-400" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content — scrolls independently */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
    </AuthGuard>
  );
}
