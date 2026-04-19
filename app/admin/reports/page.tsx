'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, CheckCircle, Users, Clock, Repeat, ArrowDownRight,
  RefreshCw, CalendarDays, Receipt, Loader2, Download, UserCheck, ArrowUpRight,
} from 'lucide-react';

const fmt = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (cents: number) => cents >= 100000 ? `$${(cents / 100000).toFixed(1)}k` : fmt(cents);
const msToHM = (ms: number) => {
  if (!ms) return '—';
  const mins = Math.round(ms / 60000);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
};

const SERVICE_LABELS: Record<string, string> = {
  standard: 'Standard', deep: 'Deep Clean', moveIn: 'Move In', moveOut: 'Move Out',
  office: 'Office', recurring: 'Recurring', medical: 'Medical', other: 'Other',
};

const PIE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const STATUS_LABELS: Record<string, string> = {
  pending_quote: 'Pending Quote', quoted: 'Quoted', approved: 'Approved', pending: 'Pending',
  confirmed: 'Confirmed', inProgress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  pending_quote: '#f97316', quoted: '#06b6d4', approved: '#10b981', pending: '#f59e0b',
  confirmed: '#3b82f6', inProgress: '#8b5cf6', completed: '#22c55e', cancelled: '#ef4444',
};

/** Date preset helpers */
function getPresetRange(preset: string) {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d':  start.setDate(end.getDate() - 7); break;
    case '30d': start.setMonth(end.getMonth() - 1); break;
    case '90d': start.setMonth(end.getMonth() - 3); break;
    case 'ytd': start.setMonth(0); start.setDate(1); break;
    case '12m': start.setFullYear(end.getFullYear() - 1); break;
  }
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/** Percentage change between two values */
function pctChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [jobsData, setJobsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState('30d');
  const [dateRange, setDateRange] = useState(getPresetRange('30d'));

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      const [revRes, jobRes] = await Promise.all([
        api.get(`/admin/reports/revenue?${params}`),
        api.get(`/admin/reports/jobs?${params}`),
      ]);
      setRevenueData(revRes.data);
      setJobsData(jobRes.data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    setDateRange(getPresetRange(preset));
  };

  const handleCustomDate = (field: 'startDate' | 'endDate', value: string) => {
    setActivePreset('custom');
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  /** CSV Export */
  const exportCsv = () => {
    if (!revenueData || !jobsData) return;
    const summary = revenueData.summary || {};
    const completion = jobsData.completionStats || {};
    const refunds = revenueData.refundStats || {};
    const subStats = jobsData.subscriptionStats || {};

    const rows = [
      ['Honor Cleaning — Report Export'],
      [`Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Metric', 'Value'],
      ['Net Revenue', fmt((summary.totalRevenue || 0) - (refunds.totalRefunded || 0))],
      ['Gross Revenue', fmt(summary.totalRevenue || 0)],
      ['Avg Invoice', fmt(summary.avgInvoice || 0)],
      ['Tips Collected', fmt(summary.totalTips || 0)],
      ['Tax Collected', fmt(summary.totalTax || 0)],
      ['Invoices Paid', summary.count || 0],
      ['Refunds', fmt(refunds.totalRefunded || 0)],
      ['Refund Count', refunds.count || 0],
      ['Jobs Completed', completion.completed || 0],
      ['Total Jobs', completion.total || 0],
      ['Avg Job Duration', msToHM(completion.avgDurationMs)],
      ['Total Customers', jobsData.customerCount || 0],
      ['Active Subscriptions', subStats.activeCount || 0],
      ['MRR', fmt(subStats.activeMrr || 0)],
      [],
      ['Daily Revenue'],
      ['Date', 'Revenue', 'Tips', 'Invoices'],
      ...(revenueData.daily || []).map((d: any) =>
        [`${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`, fmt(d.totalRevenue), fmt(d.totalTips), d.count]
      ),
      [],
      ['Revenue by Service'],
      ['Service', 'Revenue', 'Count'],
      ...(revenueData.byService || []).map((s: any) =>
        [SERVICE_LABELS[s._id] || s._id, fmt(s.revenue), s.count]
      ),
      [],
      ['Top Customers'],
      ['Name', 'Email', 'Total Spent', 'Invoices'],
      ...(revenueData.topCustomers || []).map((c: any) =>
        [c.name || '—', c.email || '', fmt(c.totalSpent), c.invoiceCount]
      ),
    ];

    const csv = rows.map(r => Array.isArray(r) ? r.join(',') : r).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${dateRange.startDate}_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = revenueData?.summary || {};
  const prevSummary = revenueData?.previousSummary || {};
  const completion = jobsData?.completionStats || {};
  const prevCompletion = jobsData?.previousCompletionStats || {};
  const subStats = jobsData?.subscriptionStats || {};
  const refunds = revenueData?.refundStats || {};

  const chartData = revenueData?.daily?.map((d: any) => ({
    date: `${d._id.month}/${d._id.day}`,
    revenue: d.totalRevenue / 100,
    tips: d.totalTips / 100,
    bookings: d.count,
  })) || [];

  const serviceRevenueData = (revenueData?.byService || []).map((s: any) => ({
    name: SERVICE_LABELS[s._id] || s._id,
    value: s.revenue,
    count: s.count,
  }));

  const statusData = (jobsData?.statusBreakdown || []).map((s: any) => ({
    name: STATUS_LABELS[s._id] || s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8',
  }));

  const serviceBookingData = (jobsData?.serviceBreakdown || []).map((s: any) => ({
    name: SERVICE_LABELS[s._id] || s._id,
    value: s.count,
  }));

  const completionRate = completion.total > 0 ? Math.round((completion.completed / completion.total) * 100) : 0;
  const netRevenue = (summary.totalRevenue || 0) - (refunds.totalRefunded || 0);
  const prevNetRevenue = (prevSummary.totalRevenue || 0);

  const presets = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
    { key: 'ytd', label: 'YTD' },
    { key: '12m', label: '12 months' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={loading || !revenueData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={loadReports} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activePreset === p.key
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            className="text-sm border-none focus:ring-0 p-0 text-gray-700 bg-transparent"
            value={dateRange.startDate}
            onChange={(e) => handleCustomDate('startDate', e.target.value)}
          />
          <span className="text-gray-300">—</span>
          <input
            type="date"
            className="text-sm border-none focus:ring-0 p-0 text-gray-700 bg-transparent"
            value={dateRange.endDate}
            onChange={(e) => handleCustomDate('endDate', e.target.value)}
          />
        </div>
      </div>

      {loading && !revenueData ? (
        <div className="space-y-6">
          {/* Skeleton KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card flex items-center gap-4 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton chart */}
          <div className="card animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-[300px] bg-gray-100 rounded-xl" />
          </div>
          {/* Skeleton pie charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-[220px] bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards — row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600"
              label="Net Revenue" value={fmt(netRevenue)} sub={`${summary.count || 0} invoices paid`}
              change={pctChange(netRevenue, prevNetRevenue)} />
            <KpiCard icon={TrendingUp} iconBg="bg-blue-100" iconColor="text-blue-600"
              label="Avg Invoice" value={fmt(summary.avgInvoice || 0)} sub={`Tips: ${fmt(summary.totalTips || 0)}`}
              change={pctChange(summary.avgInvoice || 0, prevSummary.avgInvoice || 0)} />
            <KpiCard icon={CheckCircle} iconBg="bg-brand-100" iconColor="text-brand-600"
              label="Jobs Completed" value={String(completion.completed || 0)}
              sub={`${completionRate}% completion rate`}
              change={pctChange(completion.completed || 0, prevCompletion.completed || 0)} />
            <KpiCard icon={Users} iconBg="bg-violet-100" iconColor="text-violet-600"
              label="Total Customers" value={String(jobsData?.customerCount || 0)} sub="Registered accounts" />
          </div>

          {/* KPI Cards — row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600"
              label="Avg Job Duration" value={msToHM(completion.avgDurationMs)} sub={`${completion.total || 0} total jobs`} />
            <KpiCard icon={Repeat} iconBg="bg-cyan-100" iconColor="text-cyan-600"
              label="Active Subscriptions" value={String(subStats.activeCount || 0)}
              sub={`MRR: ${fmt(subStats.activeMrr || 0)}`} />
            <KpiCard icon={ArrowDownRight} iconBg="bg-red-100" iconColor="text-red-600"
              label="Refunds" value={fmt(refunds.totalRefunded || 0)} sub={`${refunds.count || 0} refunds issued`} />
            <KpiCard icon={DollarSign} iconBg="bg-green-100" iconColor="text-green-600"
              label="Tax Collected" value={fmt(summary.totalTax || 0)} sub="MA sales tax (6.25%)" />
          </div>

          {/* Revenue Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-900">Daily Revenue</h2>
              {chartData.length > 0 && (
                <span className="text-xs text-gray-400">{chartData.length} days</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">Revenue and tips collected per day</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Tips']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="tips" fill="#0891b2" radius={[4, 4, 0, 0]} name="Tips" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No revenue data for this period" />
            )}
          </div>

          {/* Charts Row — Pie charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue by Service */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-1">Revenue by Service</h2>
              <p className="text-xs text-gray-400 mb-4">Where the money comes from</p>
              {serviceRevenueData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={serviceRevenueData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {serviceRevenueData.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {serviceRevenueData.map((s: any, i: number) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-600">{s.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{fmt(s.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No service data" />
              )}
            </div>

            {/* Booking Status */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-1">Booking Status</h2>
              <p className="text-xs text-gray-400 mb-4">Current status distribution</p>
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {statusData.map((s: any, i: number) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {statusData.map((s: any) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                          <span className="text-gray-600">{s.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No booking data" />
              )}
            </div>

            {/* Bookings by Service Type */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-1">Bookings by Service</h2>
              <p className="text-xs text-gray-400 mb-4">Service type popularity</p>
              {serviceBookingData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={serviceBookingData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {serviceBookingData.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {serviceBookingData.map((s: any, i: number) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-600">{s.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No service data" />
              )}
            </div>
          </div>

          {/* Top Customers & Staff Performance side-by-side */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Top Customers</h2>
              </div>
              {(revenueData?.topCustomers || []).length > 0 ? (
                <div className="space-y-3">
                  {revenueData.topCustomers.map((c: any, i: number) => (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-700'
                        : i === 1 ? 'bg-gray-200 text-gray-600'
                        : i === 2 ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.name || '—'}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{fmt(c.totalSpent)}</p>
                        <p className="text-xs text-gray-400">{c.invoiceCount} invoices</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No customer data for this period" />
              )}
            </div>

            {/* Staff Performance */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Staff Performance</h2>
              </div>
              {(jobsData?.staffPerformance || []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-2 font-medium">Staff</th>
                        <th className="pb-2 font-medium text-center">Jobs</th>
                        <th className="pb-2 font-medium text-center">Done</th>
                        <th className="pb-2 font-medium text-right">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {jobsData.staffPerformance.map((s: any) => {
                        const rate = s.totalJobs > 0 ? Math.round((s.completed / s.totalJobs) * 100) : 0;
                        return (
                          <tr key={s._id} className="hover:bg-gray-50/50">
                            <td className="py-2.5">
                              <p className="font-medium text-gray-900 truncate max-w-[140px]">{s.name || '—'}</p>
                            </td>
                            <td className="py-2.5 text-center text-gray-600">{s.totalJobs}</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                rate >= 80 ? 'bg-green-50 text-green-700'
                                : rate >= 50 ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                              }`}>
                                {s.completed} ({rate}%)
                              </span>
                            </td>
                            <td className="py-2.5 text-right text-gray-500 text-xs">{msToHM(s.avgDurationMs)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No staff data for this period" />
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Payments</h2>
            </div>
            {(revenueData?.recentPayments || []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-3 font-medium">Receipt</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {revenueData.recentPayments.map((p: any) => {
                      const customer = typeof p.customerId === 'object' ? p.customerId : null;
                      return (
                        <tr key={p._id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-mono text-xs text-gray-600">{p.receiptNumber}</td>
                          <td className="py-3">
                            <p className="font-medium text-gray-900">{customer?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{customer?.email || ''}</p>
                          </td>
                          <td className="py-3 font-semibold text-gray-900">{fmt(p.totalAmountCents)}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500 text-xs">
                            {new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No payments in this period" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Reusable Components ── */

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, sub, change }: {
  icon: any; iconBg: string; iconColor: string; label: string; value: string; sub: string;
  change?: number | null;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
          {change !== undefined && change !== null && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              change >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <CalendarDays className="h-8 w-8 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
