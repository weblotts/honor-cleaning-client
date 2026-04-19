'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Quotation, QuotationStatus } from '@/types';
import { format } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import CopyableCode from '@/components/CopyableCode';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  sent: { label: 'Awaiting Response', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  accepted: { label: 'Accepted', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  declined: { label: 'Declined', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  expired: { label: 'Expired', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [declineModal, setDeclineModal] = useState<Quotation | null>(null);
  const [declining, setDeclining] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get('/quotations?limit=50');
      setQuotations(res.data.quotations);
    } catch {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(q: Quotation) {
    setAccepting(true);
    try {
      await api.patch(`/quotations/${q._id}/respond`, { accepted: true });
      toast.success('Quotation accepted!');
      setSelectedQuotation(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept quotation');
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline(reason?: string) {
    if (!declineModal || !reason) return;
    setDeclining(true);
    try {
      await api.patch(`/quotations/${declineModal._id}/respond`, { accepted: false, declineReason: reason });
      toast.success('Quotation declined.');
      setDeclineModal(null);
      setSelectedQuotation(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to decline');
    } finally {
      setDeclining(false);
    }
  }

  const pending = quotations.filter(q => q.status === QuotationStatus.Sent && new Date(q.validUntil) >= new Date());
  const resolved = quotations.filter(q =>
    [QuotationStatus.Accepted, QuotationStatus.Declined, QuotationStatus.Expired].includes(q.status as QuotationStatus) ||
    (q.status === QuotationStatus.Sent && new Date(q.validUntil) < new Date()),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Detail view
  if (selectedQuotation) {
    const q = selectedQuotation;
    const sc = STATUS_CONFIG[q.status] || STATUS_CONFIG.sent;
    const isExpired = new Date(q.validUntil) < new Date() && q.status === QuotationStatus.Sent;
    const canRespond = q.status === QuotationStatus.Sent && !isExpired;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => setSelectedQuotation(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Quotations
        </button>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900"><CopyableCode code={q.quotationNumber} /></h1>
              <p className="text-sm text-gray-500 mt-1">Created {format(new Date(q.createdAt), 'MMMM d, yyyy')}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${isExpired ? STATUS_CONFIG.expired.bg + ' ' + STATUS_CONFIG.expired.color : sc.bg + ' ' + sc.color}`}>
              {isExpired ? 'Expired' : sc.label}
            </span>
          </div>

          {isExpired && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">This quotation has expired</p>
                <p className="text-xs text-amber-600 mt-0.5">Please contact us to request a new quotation.</p>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">Description</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-3 py-2.5">Qty</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-3 py-2.5">Unit Price</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {q.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right">${(item.unitPriceCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${(item.amountCents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${(q.subtotalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">MA Sales Tax ({q.taxRate}%)</span>
              <span className="text-gray-600">${(q.taxAmountCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${(q.totalAmountCents / 100).toFixed(2)}</span>
            </div>
          </div>

          {q.notes && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6">
              <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700">{q.notes}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            <strong>Valid Until:</strong> {format(new Date(q.validUntil), 'MMMM d, yyyy')}
          </p>

          {/* Actions */}
          {canRespond && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAccept(q)}
                disabled={accepting}
                className="btn-primary flex-1 !py-3"
              >
                {accepting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Accept Quotation
              </button>
              <button
                onClick={() => setDeclineModal(q)}
                className="btn-secondary flex-1 !py-3 !text-red-600 !border-red-200 hover:!bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" /> Decline
              </button>
            </div>
          )}

          {q.status === QuotationStatus.Accepted && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold">
              <CheckCircle className="h-5 w-5" /> Accepted on {q.acceptedAt ? format(new Date(q.acceptedAt), 'MMM d, yyyy') : '—'}
            </div>
          )}

          {q.status === QuotationStatus.Declined && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-700">Declined{q.declinedAt ? ` on ${format(new Date(q.declinedAt), 'MMM d, yyyy')}` : ''}</p>
              {q.declineReason && <p className="text-sm text-red-600 mt-1">{q.declineReason}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Review and respond to quotations</p>
        </div>
        <Link href="/dashboard" className="btn-secondary !py-2 text-sm">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
        </Link>
      </div>

      {/* Pending Quotations */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Awaiting Your Response ({pending.length})
          </h2>
          <div className="grid gap-3">
            {pending.map((q) => {
              const isExpired = new Date(q.validUntil) < new Date();
              return (
                <button key={q._id} onClick={() => setSelectedQuotation(q)} className="card flex items-center justify-between text-left hover:shadow-md transition-shadow w-full">
                  <div>
                    <p className="font-semibold text-gray-900"><CopyableCode code={q.quotationNumber} /></p>
                    <p className="text-sm text-gray-500">{format(new Date(q.createdAt), 'MMM d, yyyy')} &bull; Valid until {format(new Date(q.validUntil), 'MMM d')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${(q.totalAmountCents / 100).toFixed(2)}</p>
                    <span className={`text-xs font-medium ${isExpired ? 'text-amber-600' : 'text-blue-600'}`}>
                      {isExpired ? 'Expired' : 'Review'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Quotations</h2>
          <div className="grid gap-3">
            {resolved.map((q) => {
              const isExpired = q.status === QuotationStatus.Sent && new Date(q.validUntil) < new Date();
              const sc = isExpired ? STATUS_CONFIG.expired : (STATUS_CONFIG[q.status] || STATUS_CONFIG.sent);
              return (
                <button key={q._id} onClick={() => setSelectedQuotation(q)} className="card flex items-center justify-between text-left hover:shadow-md transition-shadow w-full">
                  <div>
                    <p className="font-semibold text-gray-900"><CopyableCode code={q.quotationNumber} /></p>
                    <p className="text-sm text-gray-500">{format(new Date(q.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${(q.totalAmountCents / 100).toFixed(2)}</p>
                    <span className={`text-xs font-medium ${sc.color}`}>{isExpired ? 'Expired' : sc.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {quotations.length === 0 && (
        <div className="card text-center py-16">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No quotations yet</h3>
          <p className="text-sm text-gray-500 mt-1">Quotations from Honor Cleaning will appear here.</p>
        </div>
      )}

      {/* Decline Modal */}
      <ConfirmModal
        open={!!declineModal}
        title="Decline Quotation"
        description={declineModal ? `Are you sure you want to decline quotation ${declineModal.quotationNumber} ($${(declineModal.totalAmountCents / 100).toFixed(2)})?` : ''}
        confirmLabel="Decline Quotation"
        variant="danger"
        withReason
        reasonRequired
        reasonPlaceholder="Why are you declining? (e.g. price too high, changed plans)"
        loading={declining}
        onConfirm={handleDecline}
        onCancel={() => setDeclineModal(null)}
      />
    </div>
  );
}
