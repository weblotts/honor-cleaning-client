'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Booking, BookingStatus, Invoice, InvoiceStatus, Subscription } from '@/types';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  RefreshCw,
  Settings,
  Plus,
  XCircle,
  CheckCircle,
  CircleDollarSign,
  Hourglass,
  CreditCard,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<Booking | null>(null);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bookRes, invRes, subRes] = await Promise.all([
        api.get('/bookings?limit=10'),
        api.get('/invoices?limit=10'),
        api.get('/subscriptions/mine'),
      ]);
      setBookings(bookRes.data.bookings);
      setInvoices(invRes.data.invoices);
      setSubscriptions(subRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancel(reason?: string) {
    if (!cancelTarget || !reason) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${cancelTarget._id}/cancel`, { reason });
      toast.success('Booking cancelled successfully.');
      setCancelTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  async function approveQuote(id: string) {
    try {
      await api.patch(`/bookings/${id}/quote/respond`, { approved: true });
      toast.success('Quote approved! Your cleaning is confirmed.');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve quote.');
    }
  }

  async function confirmDecline(reason?: string) {
    if (!declineTarget || !reason) return;
    setDeclining(true);
    try {
      await api.patch(`/bookings/${declineTarget._id}/quote/respond`, { approved: false, declineReason: reason });
      toast.success('Quote declined successfully.');
      setDeclineTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to decline quote.');
    } finally {
      setDeclining(false);
    }
  }

  const pendingQuotes = bookings.filter((b) =>
    [BookingStatus.PendingQuote, BookingStatus.Quoted].includes(b.status as BookingStatus),
  );
  const upcoming = bookings.filter((b) =>
    [BookingStatus.Approved, BookingStatus.Pending, BookingStatus.Confirmed].includes(b.status as BookingStatus),
  );
  const past = bookings.filter((b) =>
    [BookingStatus.Completed, BookingStatus.Cancelled].includes(b.status as BookingStatus),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard header */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-ocean-600 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
            <p className="text-brand-100/70 mt-1">Manage your bookings, subscriptions, and account</p>
          </div>
          <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-5 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
            <Plus className="h-4 w-4" /> New Booking
          </Link>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Quotes to Review',
            count: pendingQuotes.filter(b => b.status === BookingStatus.Quoted).length,
            total: pendingQuotes.length,
            href: '#quotes',
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            textColor: 'text-violet-700',
            icon: CircleDollarSign,
          },
          {
            label: 'Upcoming Cleans',
            count: upcoming.length,
            href: '#upcoming',
            color: 'from-brand-500 to-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-200',
            textColor: 'text-brand-700',
            icon: Calendar,
          },
          {
            label: 'Unpaid Invoices',
            count: invoices.filter(i => i.status === InvoiceStatus.Sent).length,
            href: '/dashboard/invoices',
            color: 'from-warm-500 to-warm-600',
            bg: 'bg-warm-50',
            border: 'border-warm-200',
            textColor: 'text-warm-700',
            icon: CreditCard,
            isLink: true,
          },
          {
            label: 'Active Plans',
            count: subscriptions.filter(s => s.status === 'active').length,
            href: '#subscriptions',
            color: 'from-ocean-500 to-ocean-600',
            bg: 'bg-ocean-50',
            border: 'border-ocean-200',
            textColor: 'text-ocean-700',
            icon: RefreshCw,
          },
        ].map((stat) => {
          const Inner = (
            <div className={`rounded-2xl ${stat.bg} border ${stat.border} p-4 transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                {stat.count > 0 && (
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${stat.color} text-white text-xs font-bold flex items-center justify-center`}>
                    {stat.count}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
          return stat.isLink ? (
            <Link key={stat.label} href={stat.href}>{Inner}</Link>
          ) : (
            <div key={stat.label}>{Inner}</div>
          );
        })}
      </div>

      {/* ── Quick Access: Invoices, Quotations & Receipts ── */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/invoices"
          className="card flex items-center justify-between group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Invoices</p>
              <p className="text-sm text-gray-500">
                {invoices.filter(i => i.status === InvoiceStatus.Sent).length > 0
                  ? `${invoices.filter(i => i.status === InvoiceStatus.Sent).length} awaiting payment`
                  : 'View & pay'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
        </Link>
        <Link
          href="/dashboard/quotations"
          className="card flex items-center justify-between group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Quotations</p>
              <p className="text-sm text-gray-500">Review & respond</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-ocean-600 transition-colors" />
        </Link>
        <Link
          href="/dashboard/receipts"
          className="card flex items-center justify-between group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Receipts</p>
              <p className="text-sm text-gray-500">Payment confirmations</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
        </Link>
      </section>

      {/* Pending Quotes */}
      {pendingQuotes.length > 0 && (
        <section id="quotes">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <CircleDollarSign className="h-4 w-4 text-white" />
            </div>
            Pending Quotes
          </h2>
          <div className="grid gap-4">
            {pendingQuotes.map((b) => (
              <div key={b._id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{b.serviceType} Cleaning</p>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(b.scheduledDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {b.scheduledTime}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                    b.status === BookingStatus.Quoted
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {b.status === BookingStatus.Quoted ? 'Quote Ready' : 'Awaiting Quote'}
                  </span>
                </div>

                {b.status === BookingStatus.PendingQuote && (
                  <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-4 flex items-start gap-3">
                    <Hourglass className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Awaiting your custom quote</p>
                      <p className="text-xs text-yellow-600 mt-0.5">We&apos;re reviewing your property details. You&apos;ll receive a personalized quote soon.</p>
                    </div>
                  </div>
                )}

                {b.status === BookingStatus.Quoted && b.quotedAmountCents && (
                  <div className="rounded-xl bg-brand-50 border border-brand-100 p-5">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quoted total</span>
                        <span className="font-bold text-gray-900 text-lg">${(b.quotedAmountCents / 100).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-brand-200 pt-2 flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">Total</span>
                        <span className="font-bold text-gray-900">${(b.quotedAmountCents / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    {b.quoteNotes && (
                      <p className="text-xs text-gray-500 mb-4 italic">&quot;{b.quoteNotes}&quot;</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveQuote(b._id)}
                        className="btn-primary flex-1 !py-2.5 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" /> Approve Quote
                      </button>
                      <button
                        onClick={() => setDeclineTarget(b)}
                        className="btn-secondary flex-1 !py-2.5 text-sm !text-red-600 !border-red-200 hover:!bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Bookings */}
      <section id="upcoming">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          Upcoming Bookings
        </h2>
        {upcoming.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            No upcoming bookings.{' '}
            <Link href="/booking" className="text-brand-600 underline">
              Book one now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((b) => (
              <div key={b._id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{b.serviceType} Cleaning</p>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(b.scheduledDate), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {b.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {b.address.city}, MA
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      b.status === BookingStatus.Confirmed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {b.status}
                  </span>
                  <button
                    onClick={() => setCancelTarget(b)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <section id="subscriptions">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            Active Subscriptions
          </h2>
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="card flex justify-between items-center">
                <div>
                  <p className="font-semibold capitalize">
                    {sub.frequency} {sub.serviceType} Cleaning
                  </p>
                  <p className="text-sm text-gray-500">
                    {sub.preferredDay}s at {sub.preferredTime} — {sub.address.city}, MA
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Bookings & Invoices */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Past Bookings
        </h2>
        {past.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">No past bookings yet.</div>
        ) : (
          <div className="grid gap-3">
            {past.map((b) => (
              <div key={b._id} className="card flex justify-between items-center">
                <div>
                  <p className="font-medium capitalize">{b.serviceType} Cleaning</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(b.scheduledDate), 'MMM d, yyyy')} — ${((b.quotedAmountCents || b.amountCents) / 100).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    b.status === BookingStatus.Completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Account Settings Link */}
      <section className="card">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-brand-600 font-medium hover:underline">
          <Settings className="h-5 w-5" /> Account Settings & Data Deletion
        </Link>
      </section>

      {/* Decline Quote Modal */}
      <ConfirmModal
        open={!!declineTarget}
        title="Decline Quote"
        description={
          declineTarget
            ? `Are you sure you want to decline the $${((declineTarget.quotedAmountCents || 0) / 100).toFixed(2)} quote for your ${declineTarget.serviceType} cleaning?`
            : undefined
        }
        confirmLabel="Decline Quote"
        cancelLabel="Go Back"
        variant="danger"
        withReason
        reasonRequired
        reasonPlaceholder="Why are you declining? (e.g. price too high, no longer needed)"
        loading={declining}
        onConfirm={confirmDecline}
        onCancel={() => setDeclineTarget(null)}
      />

      {/* Cancel Booking Modal */}
      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel Booking"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your ${cancelTarget.serviceType} cleaning on ${format(new Date(cancelTarget.scheduledDate), 'MMMM d, yyyy')} at ${cancelTarget.scheduledTime}?`
            : undefined
        }
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        variant="danger"
        withReason
        reasonRequired
        reasonPlaceholder="Why are you cancelling? (e.g. schedule change, no longer needed)"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
