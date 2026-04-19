'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, DollarSign, CheckCircle, Users } from 'lucide-react';

interface DashboardStats {
  revenue: { totalRevenue: number; count: number };
  jobs: { total: number; completed: number };
  customerCount: number;
  staffCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [revRes, jobRes, custRes, staffRes] = await Promise.all([
          api.get('/admin/reports/revenue'),
          api.get('/admin/reports/jobs'),
          api.get('/customers?limit=1'),
          api.get('/staff'),
        ]);
        setStats({
          revenue: revRes.data.summary,
          jobs: jobRes.data.completionStats,
          customerCount: custRes.data.total,
          staffCount: staffRes.data.length,
        });
      } catch {
        // Stats may not load in dev
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: 'Revenue (30d)',
      value: stats ? `$${((stats.revenue.totalRevenue || 0) / 100).toLocaleString()}` : '--',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Bookings (30d)',
      value: stats?.revenue.count ?? '--',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Jobs Completed',
      value: stats?.jobs.completed ?? '--',
      icon: CheckCircle,
      color: 'text-brand-600 bg-brand-100',
    },
    {
      label: 'Total Customers',
      value: stats?.customerCount ?? '--',
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="/admin/jobs" className="btn-secondary py-2 px-4">View Job Board</a>
          <a href="/admin/customers" className="btn-secondary py-2 px-4">Manage Customers</a>
          <a href="/admin/staff" className="btn-secondary py-2 px-4">Manage Staff</a>
          <a href="/admin/reports" className="btn-secondary py-2 px-4">View Reports</a>
        </div>
      </div>
    </div>
  );
}
