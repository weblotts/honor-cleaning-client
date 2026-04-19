'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Receipt } from '@/types';
import CopyableCode from '@/components/CopyableCode';
import { format } from 'date-fns';
import {
  RefreshCw,
  FileText,
  Search,
  Receipt as ReceiptIcon,
} from 'lucide-react';

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/receipts?limit=50');
      setReceipts(res.data.receipts);
    } catch {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = receipts.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const customer = typeof r.customerId === 'object' ? r.customerId : null;
    return (
      r.receiptNumber?.toLowerCase().includes(q) ||
      customer?.name?.toLowerCase().includes(q) ||
      customer?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Payment receipts auto-generated when invoices are paid</p>
        </div>
        <button onClick={() => loadData()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" className="input-field pl-11 py-3" placeholder="Search by receipt #, customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading receipts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 border border-gray-200 text-center py-16 px-6">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No receipts yet</h3>
          <p className="text-sm text-gray-500 mt-1">Receipts are created automatically when invoices are paid.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Receipt #</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Invoice</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Booking</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Paid On</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const customer = typeof r.customerId === 'object' ? r.customerId : null;
                  const invoice = typeof r.invoiceId === 'object' ? r.invoiceId : null;
                  const booking = typeof r.bookingId === 'object' ? r.bookingId : null;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <CopyableCode code={r.receiptNumber} />
                        <p className="text-[11px] text-gray-400">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{customer?.name || customer?.email || '—'}</td>
                      <td className="px-4 py-4">
                        {invoice?.invoiceNumber ? <CopyableCode code={invoice.invoiceNumber} className="text-xs" /> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        {r.bookingId && typeof r.bookingId === 'object' && r.bookingId.bookingNumber ? (
                          <CopyableCode code={r.bookingId.bookingNumber} className="text-xs" />
                        ) : r.bookingId ? (
                          <span className="text-xs font-mono text-gray-500">
                            #{(typeof r.bookingId === 'object' ? r.bookingId._id : r.bookingId).slice(-6).toUpperCase()}
                          </span>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">${(r.totalAmountCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{format(new Date(r.paidAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600 capitalize">{r.paymentMethod}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
