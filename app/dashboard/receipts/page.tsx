'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Receipt } from '@/types';
import CopyableCode from '@/components/CopyableCode';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Receipt as ReceiptIcon,
  Search,
  Calendar,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Hash,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

function fmt(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Payment method display helpers
const PAYMENT_ICONS: Record<string, string> = {
  card: 'Credit Card',
  affirm: 'Affirm',
  klarna: 'Klarna',
  us_bank_account: 'Bank Transfer',
  cashapp: 'Cash App',
  link: 'Stripe Link',
};

function paymentLabel(method: string): string {
  return PAYMENT_ICONS[method] || method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function CustomerReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get('/receipts?limit=50');
      const fresh: Receipt[] = res.data.receipts;
      setReceipts(fresh);

      // Keep selected receipt in sync
      if (selectedReceipt) {
        const updated = fresh.find(r => r._id === selectedReceipt._id);
        if (updated) setSelectedReceipt(updated);
      }
    } catch {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }

  // Group receipts by month
  const { filtered, grouped, totalSpent, avgSpent } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? receipts.filter(r => {
          const invoice = typeof r.invoiceId === 'object' ? r.invoiceId : null;
          return (
            r.receiptNumber.toLowerCase().includes(q) ||
            (invoice?.invoiceNumber || '').toLowerCase().includes(q) ||
            fmt(r.totalAmountCents).includes(q) ||
            r.paymentMethod.toLowerCase().includes(q) ||
            r.lineItems.some(li => li.description.toLowerCase().includes(q))
          );
        })
      : receipts;

    const grouped: Record<string, Receipt[]> = {};
    for (const r of filtered) {
      const key = format(new Date(r.paidAt), 'MMMM yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmountCents, 0);
    const avgSpent = receipts.length > 0 ? Math.round(totalSpent / receipts.length) : 0;

    return { filtered, grouped, totalSpent, avgSpent };
  }, [receipts, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-gray-500">Loading receipts...</p>
      </div>
    );
  }

  // ─── Detail view ───────────────────────────────────────────────
  if (selectedReceipt) {
    const r = selectedReceipt;
    const invoice = typeof r.invoiceId === 'object' ? r.invoiceId : null;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => setSelectedReceipt(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Receipts
        </button>

        <div className="bg-white rounded-2xl border border-brand-200 overflow-hidden shadow-sm">
          {/* Header — receipt-style gradient */}
          <div className="bg-brand-600 px-6 sm:px-8 py-8 text-white relative overflow-hidden">

            <div className="relative flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-4">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Payment Confirmed</span>
                </div>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight">{fmt(r.totalAmountCents)}</p>
                <p className="text-brand-200 text-sm mt-2">
                  {format(new Date(r.paidAt), 'MMMM d, yyyy · h:mm a')}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 ml-auto">
                  <ReceiptIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-brand-100 text-xs font-medium">{r.receiptNumber}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">
            {/* Receipt reference + document trail */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {r.bookingId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 font-medium">
                  <Hash className="h-3 w-3 text-gray-400" />
                  Booking {(typeof r.bookingId === 'object' ? r.bookingId._id : r.bookingId).slice(-6).toUpperCase()}
                </span>
              )}
              {r.bookingId && (r.quotationId || invoice) && <ChevronRight className="h-3 w-3 text-gray-300" />}
              {r.quotationId && (
                <CopyableCode code={typeof r.quotationId === 'object' ? r.quotationId.quotationNumber : 'Quotation'} className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600" />
              )}
              {r.quotationId && invoice && <ChevronRight className="h-3 w-3 text-gray-300" />}
              {invoice && (
                <CopyableCode code={invoice.invoiceNumber} className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600" />
              )}
              {(r.bookingId || r.quotationId || invoice) && <ChevronRight className="h-3 w-3 text-gray-300" />}
              <CopyableCode code={r.receiptNumber} className="px-2.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-700" />
            </div>

            {/* Line items */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Service</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Qty</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Rate</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {r.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 capitalize">{item.description}</p>
                        <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                          {item.quantity} x {fmt(item.unitPriceCents)}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-gray-500 text-center hidden sm:table-cell">{item.quantity}</td>
                      <td className="px-3 py-3.5 text-sm text-gray-500 text-right hidden sm:table-cell">{fmt(item.unitPriceCents)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 text-right">{fmt(item.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700 font-medium">{fmt(r.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MA Sales Tax ({r.taxRate}%)</span>
                <span className="text-gray-600">{fmt(r.taxAmountCents)}</span>
              </div>
              {r.tipAmountCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tip</span>
                  <span className="text-gray-600">{fmt(r.tipAmountCents)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-1">
                <span className="text-base font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-bold text-brand-700">{fmt(r.totalAmountCents)}</span>
              </div>
            </div>

            {/* Payment method card */}
            <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-brand-200 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{paymentLabel(r.paymentMethod)}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(r.paidAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-brand-500" />
            </div>

            {/* Actions */}
            {r.pdfUrl && (
              <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full !py-3 text-center">
                <Download className="h-4 w-4 mr-2" /> Download Receipt PDF
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── List view ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Payment confirmations for your cleanings</p>
        </div>
        <Link href="/dashboard" className="btn-secondary !py-2 text-sm shrink-0 self-start">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
        </Link>
      </div>

      {/* Stats row */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Total Spent</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmt(totalSpent)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Payments</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{receipts.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Avg. Payment</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmt(avgSpent)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Last Payment</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {receipts.length > 0 ? format(new Date(receipts[0].paidAt), 'MMM d') : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Search bar */}
      {receipts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, invoice #, service, amount, or payment method..."
            className="input-field pl-11 py-3 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {receipts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 mx-auto mb-5">
            <ReceiptIcon className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">No receipts yet</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Receipts are automatically generated after you pay an invoice. They&apos;ll appear here for your records.
          </p>
          <Link href="/dashboard/invoices" className="btn-primary !py-2.5 text-sm mt-6 inline-flex">
            <FileText className="h-4 w-4 mr-1.5" /> View Invoices
          </Link>
        </div>
      )}

      {/* No search results */}
      {search && filtered.length === 0 && receipts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-12 px-6">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No receipts match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch('')} className="text-sm text-brand-600 font-medium mt-2 hover:text-brand-700">
            Clear search
          </button>
        </div>
      )}

      {/* Grouped receipt list */}
      {Object.entries(grouped).map(([monthLabel, monthReceipts]) => {
        const monthTotal = monthReceipts.reduce((sum, r) => sum + r.totalAmountCents, 0);
        return (
          <section key={monthLabel}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                {monthLabel}
              </h2>
              <span className="text-xs font-semibold text-gray-400">{fmt(monthTotal)}</span>
            </div>
            <div className="space-y-2">
              {monthReceipts.map((r) => {
                const invoice = typeof r.invoiceId === 'object' ? r.invoiceId : null;
                const serviceDesc = r.lineItems.length > 0 ? r.lineItems[0].description : '';
                return (
                  <button
                    key={r._id}
                    onClick={() => setSelectedReceipt(r)}
                    className="group w-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 text-left hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                      <CheckCircle className="h-5 w-5 text-brand-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{r.receiptNumber}</p>
                        {invoice && (
                          <span className="hidden sm:inline-flex text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                            {invoice.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {format(new Date(r.paidAt), 'MMM d, yyyy · h:mm a')}
                        {serviceDesc ? ` · ${serviceDesc}` : ''}
                      </p>
                    </div>

                    {/* Amount + method */}
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-gray-900">{fmt(r.totalAmountCents)}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{paymentLabel(r.paymentMethod)}</p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
