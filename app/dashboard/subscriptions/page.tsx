'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Subscription, SubscriptionStatus } from '@/types';
import { format } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Clock,
  Pause,
  XCircle,
  DollarSign,
  RefreshCw,
  Phone,
  CalendarDays,
} from 'lucide-react';

interface UpcomingPayment {
  subscriptionId: string;
  serviceType: string;
  frequency: string;
  amountCents: number;
  nextPaymentDate: string;
  daysUntilPayment: number;
  stripeStatus: string;
  preferredDay: string;
  preferredTime: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  paused: { label: 'Paused', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' },
};

function formatCents(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [pausingId, setPausingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [subsRes, upcomingRes] = await Promise.all([
        api.get('/subscriptions/mine'),
        api.get('/subscriptions/upcoming-payments'),
      ]);
      setSubscriptions(subsRes.data);
      setUpcoming(upcomingRes.data.upcoming || []);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  async function handlePause(sub: Subscription) {
    setPausingId(sub._id);
    try {
      await api.patch(`/subscriptions/${sub._id}/pause`);
      toast.success('Subscription paused');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to pause subscription');
    } finally {
      setPausingId(null);
    }
  }

  async function handleCancel(reason?: string) {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.delete(`/subscriptions/${cancelTarget._id}`);
      toast.success('Subscription cancelled');
      setCancelTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  }

  const active = subscriptions.filter((s) => s.status === SubscriptionStatus.Active);
  const paused = subscriptions.filter((s) => s.status === SubscriptionStatus.Paused);
  const cancelled = subscriptions.filter((s) => s.status === SubscriptionStatus.Cancelled);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your recurring cleaning services</p>
        </div>
        <Link href="/dashboard" className="btn-secondary !py-2 text-sm">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
        </Link>
      </div>

      {/* Upcoming Payments */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            Upcoming Payments
          </h2>
          <div className="grid gap-3">
            {upcoming.map((payment) => (
              <div
                key={payment.subscriptionId + payment.nextPaymentDate}
                className="card flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{payment.serviceType}</p>
                  <p className="text-sm text-gray-500">
                    {FREQUENCY_LABELS[payment.frequency] || payment.frequency} &bull;{' '}
                    {payment.preferredDay} at {payment.preferredTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCents(payment.amountCents)}</p>
                  <p className="text-xs text-gray-500">
                    {payment.daysUntilPayment === 0
                      ? 'Due today'
                      : payment.daysUntilPayment === 1
                        ? 'Due tomorrow'
                        : `In ${payment.daysUntilPayment} days`}{' '}
                    &bull; {format(new Date(payment.nextPaymentDate), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Subscriptions */}
      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            Active ({active.length})
          </h2>
          <div className="grid gap-3">
            {active.map((sub) => (
              <div key={sub._id} className="card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize text-lg">{sub.serviceType}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border mt-1 ${STATUS_CONFIG.active.bg} ${STATUS_CONFIG.active.color}`}
                    >
                      {STATUS_CONFIG.active.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePause(sub)}
                      disabled={pausingId === sub._id}
                      className="btn-secondary !py-2 !px-3 text-sm"
                    >
                      {pausingId === sub._id ? (
                        <span className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setCancelTarget(sub)}
                      className="btn-danger !py-2 !px-3 text-sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">
                        {FREQUENCY_LABELS[sub.frequency] || sub.frequency}
                      </p>
                      {sub.nextScheduledDate && (
                        <p className="text-xs text-gray-500">
                          Next: {format(new Date(sub.nextScheduledDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{sub.preferredDay}</p>
                      <p className="text-xs text-gray-500">{sub.preferredTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{sub.address.street}</p>
                      <p className="text-xs text-gray-500">
                        {sub.address.city}, {sub.address.state} {sub.address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paused Subscriptions */}
      {paused.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Pause className="h-4 w-4 text-white" />
            </div>
            Paused ({paused.length})
          </h2>
          <div className="grid gap-3">
            {paused.map((sub) => (
              <div key={sub._id} className="card hover:shadow-sm transition-shadow border-amber-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize text-lg">{sub.serviceType}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border mt-1 ${STATUS_CONFIG.paused.bg} ${STATUS_CONFIG.paused.color}`}
                    >
                      {STATUS_CONFIG.paused.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setCancelTarget(sub)}
                    className="btn-danger !py-2 !px-3 text-sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
                  <div className="flex items-start gap-2 text-gray-600">
                    <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-medium text-gray-700">
                      {FREQUENCY_LABELS[sub.frequency] || sub.frequency}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{sub.preferredDay}</p>
                      <p className="text-xs text-gray-500">{sub.preferredTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{sub.address.street}</p>
                      <p className="text-xs text-gray-500">
                        {sub.address.city}, {sub.address.state} {sub.address.zip}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
                  <Phone className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Contact us to resume this subscription
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Call us at (508) 333-1838 or email to reactivate your cleaning schedule.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cancelled Subscriptions */}
      {cancelled.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-white" />
            </div>
            Cancelled ({cancelled.length})
          </h2>
          <div className="grid gap-3">
            {cancelled.map((sub) => (
              <div key={sub._id} className="card hover:shadow-sm transition-shadow opacity-60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{sub.serviceType}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border mt-1 ${STATUS_CONFIG.cancelled.bg} ${STATUS_CONFIG.cancelled.color}`}
                    >
                      {STATUS_CONFIG.cancelled.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Since {format(new Date(sub.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {FREQUENCY_LABELS[sub.frequency] || sub.frequency}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {sub.address.city}, {sub.address.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {subscriptions.length === 0 && (
        <div className="card text-center py-16">
          <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No subscriptions yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            When you set up a recurring cleaning service, it will appear here.
          </p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel Subscription"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your ${cancelTarget.serviceType} subscription? This will stop all future cleanings.`
            : ''
        }
        confirmLabel="Yes, Cancel Subscription"
        cancelLabel="Keep Subscription"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
