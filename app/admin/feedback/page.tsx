'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { type Feedback } from '@/types';
import {
  Star,
  Eye,
  EyeOff,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Clock,
  CheckCircle,
  Globe,
} from 'lucide-react';

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Request feedback modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [requesting, setRequesting] = useState(false);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/feedback?${params}`);
      setFeedback(data.feedback);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  async function handleRequestFeedback(e: React.FormEvent) {
    e.preventDefault();
    setRequesting(true);
    try {
      await api.post('/feedback/request', { bookingNumber: bookingNumber.trim().toUpperCase() });
      toast.success('Feedback request sent!');
      setShowRequestModal(false);
      setBookingNumber('');
      loadFeedback();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to send feedback request';
      toast.error(msg);
    } finally {
      setRequesting(false);
    }
  }

  async function resendRequest(id: string) {
    setResendingId(id);
    try {
      await api.post(`/feedback/${id}/resend`);
      toast.success('Feedback request resent!');
    } catch {
      toast.error('Failed to resend feedback request');
    } finally {
      setResendingId(null);
    }
  }

  async function togglePublic(id: string) {
    setTogglingId(id);
    try {
      const { data } = await api.patch(`/feedback/${id}/toggle-public`);
      toast.success(data.message);
      setFeedback((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isPublic: data.isPublic } : f)),
      );
    } catch {
      toast.error('Failed to update visibility');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-500 text-sm mt-1">{total} feedback requests total</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Request Feedback
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'submitted', label: 'Submitted' },
          { value: 'pending', label: 'Awaiting Response' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12 text-gray-400">Loading...</div>
        ) : feedback.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No feedback found</div>
        ) : (
          feedback.map((f) => (
            <div key={f._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{f.customerName}</span>
                    {f.submittedAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                    {f.isPublic && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-2">
                    <span className="capitalize">{f.serviceType}</span> &middot; Requested{' '}
                    {new Date(f.requestedAt).toLocaleDateString()}
                  </p>

                  {f.submittedAt && (
                    <>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (f.rating || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm">&quot;{f.comment}&quot;</p>
                      {(f.customerRole || f.customerLocation) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {f.customerRole}
                          {f.customerRole && f.customerLocation && ' — '}
                          {f.customerLocation}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {f.submittedAt ? (
                  <button
                    onClick={() => togglePublic(f._id)}
                    disabled={togglingId === f._id}
                    className={`ml-4 shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      f.isPublic
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title={f.isPublic ? 'Remove from website' : 'Show on website'}
                  >
                    {f.isPublic ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => resendRequest(f._id)}
                    disabled={resendingId === f._id}
                    className="ml-4 shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    title="Resend feedback request email"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${resendingId === f._id ? 'animate-spin' : ''}`} />
                    {resendingId === f._id ? 'Sending...' : 'Resend'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Request Feedback Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Request Customer Feedback</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter the booking number for a completed service. The customer will receive an email
              with a link to leave their review.
            </p>
            <form onSubmit={handleRequestFeedback}>
              <label
                htmlFor="bookingNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Booking Number
              </label>
              <input
                id="bookingNumber"
                type="text"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="input-field mb-4"
                placeholder="e.g. BK-00042"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setBookingNumber('');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting || bookingNumber.trim().length < 3}
                  className="btn-primary disabled:opacity-50"
                >
                  {requesting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
