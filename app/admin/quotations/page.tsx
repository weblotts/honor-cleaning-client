'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Quotation, QuotationStatus, Booking, Invoice } from '@/types';
import { format } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import { CurrencyInput } from '@/components/FormFields';
import CopyableCode from '@/components/CopyableCode';
import {
  Plus,
  Send,
  RefreshCw,
  FileText,
  Search,
  Filter,
  ChevronDown,
  DollarSign,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Hash,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200' },
  sent: { label: 'Sent', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  accepted: { label: 'Accepted', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  declined: { label: 'Declined', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  expired: { label: 'Expired', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

const SERVICE_COLORS: Record<string, string> = {
  standard: 'bg-brand-100 text-brand-700',
  deep: 'bg-blue-100 text-blue-700',
  moveIn: 'bg-amber-100 text-amber-700',
  moveOut: 'bg-rose-100 text-rose-700',
  office: 'bg-violet-100 text-violet-700',
  recurring: 'bg-cyan-100 text-cyan-700',
};

interface LineItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sendModal, setSendModal] = useState<Quotation | null>(null);
  const [sending, setSending] = useState(false);
  const [invoiceCreating, setInvoiceCreating] = useState<string | null>(null);

  // Booking search in create form
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const bookingSearchRef = useRef<HTMLDivElement>(null);

  // Create form state
  const [formLineItems, setFormLineItems] = useState<LineItemInput[]>([
    { description: '', quantity: 1, unitPriceCents: 0 },
  ]);
  const [formTaxRate, setFormTaxRate] = useState(6.25);
  const [formNotes, setFormNotes] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter) params.append('status', filter);
      const [quotRes, bookRes, invRes] = await Promise.all([
        api.get(`/quotations?${params}`),
        api.get('/bookings?limit=200'),
        api.get('/invoices?limit=200'),
      ]);
      setQuotations(quotRes.data.quotations);
      setBookings(bookRes.data.bookings || []);
      setInvoices(invRes.data.invoices || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Close booking dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bookingSearchRef.current && !bookingSearchRef.current.contains(e.target as Node)) {
        setBookingDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter bookings by search query
  const bookingResults = useMemo(() => {
    if (!bookingSearch.trim()) return bookings.slice(0, 20);
    const q = bookingSearch.toLowerCase();
    return bookings.filter((b) => {
      const customer = typeof b.customerId === 'object' ? b.customerId : null;
      return (
        (b.bookingNumber || '').toLowerCase().includes(q) ||
        b.serviceType.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        b.address?.city?.toLowerCase().includes(q) ||
        b.address?.zip?.includes(q) ||
        customer?.name?.toLowerCase().includes(q) ||
        customer?.email?.toLowerCase().includes(q)
      );
    }).slice(0, 20);
  }, [bookings, bookingSearch]);

  function selectBooking(booking: Booking) {
    setSelectedBooking(booking);
    setBookingDropdownOpen(false);
    const customer = typeof booking.customerId === 'object' ? booking.customerId : null;
    setBookingSearch(
      `${booking.bookingNumber || booking._id.slice(-6).toUpperCase()} — ${booking.serviceType}${customer ? ` — ${customer.name || customer.email}` : ''}`
    );
  }

  function clearBooking() {
    setSelectedBooking(null);
    setBookingSearch('');
  }

  const subtotalCents = formLineItems.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
  const taxAmountCents = Math.round(subtotalCents * (formTaxRate / 100));
  const totalCents = subtotalCents + taxAmountCents;

  function addLineItem() {
    setFormLineItems([...formLineItems, { description: '', quantity: 1, unitPriceCents: 0 }]);
  }

  function removeLineItem(idx: number) {
    if (formLineItems.length <= 1) return;
    setFormLineItems(formLineItems.filter((_, i) => i !== idx));
  }

  function updateLineItem(idx: number, field: keyof LineItemInput, value: string | number) {
    setFormLineItems(formLineItems.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item,
    ));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBooking) {
      toast.error('Please search and select a booking');
      return;
    }
    if (formLineItems.some(i => !i.description || i.unitPriceCents <= 0)) {
      toast.error('Please fill all line item fields');
      return;
    }
    const customerId = typeof selectedBooking.customerId === 'object'
      ? selectedBooking.customerId._id
      : selectedBooking.customerId;
    setCreating(true);
    try {
      await api.post('/quotations', {
        customerId,
        bookingId: selectedBooking._id,
        lineItems: formLineItems,
        taxRate: formTaxRate,
        notes: formNotes || undefined,
        validUntil: formValidUntil,
      });
      toast.success('Quotation created');
      setShowCreate(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create quotation', { duration: 6000 });
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setSelectedBooking(null);
    setBookingSearch('');
    setFormLineItems([{ description: '', quantity: 1, unitPriceCents: 0 }]);
    setFormTaxRate(6.25);
    setFormNotes('');
    setFormValidUntil('');
  }

  async function handleSend() {
    if (!sendModal) return;
    setSending(true);
    try {
      await api.post(`/quotations/${sendModal._id}/send`);
      toast.success('Quotation sent to customer');
      setSendModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  // Map quotationId → invoice to check if invoice already exists
  const invoiceByQuotation = useMemo(() => {
    const map: Record<string, Invoice> = {};
    for (const inv of invoices) {
      const qId = typeof inv.quotationId === 'object' ? inv.quotationId._id : inv.quotationId;
      if (qId) map[qId] = inv;
    }
    return map;
  }, [invoices]);

  async function createInvoiceFromQuotation(q: Quotation) {
    const customerId = typeof q.customerId === 'object' ? q.customerId._id : q.customerId;
    const bookingId = typeof q.bookingId === 'object' ? q.bookingId._id : q.bookingId;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setInvoiceCreating(q._id);
    try {
      await api.post('/invoices', {
        customerId,
        bookingId,
        quotationId: q._id,
        lineItems: q.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPriceCents: li.unitPriceCents,
        })),
        taxRate: q.taxRate,
        notes: q.notes,
        dueDate: dueDate.toISOString(),
      });
      toast.success('Invoice created from quotation');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setInvoiceCreating(null);
    }
  }

  const filtered = quotations.filter((q) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const customer = typeof q.customerId === 'object' ? q.customerId : null;
    return (
      q.quotationNumber?.toLowerCase().includes(s) ||
      customer?.name?.toLowerCase().includes(s) ||
      customer?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Create and send custom quotations to customers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => loadData()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary !py-2.5 text-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Quotation
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" className="input-field pl-11 py-3" placeholder="Search by quote #, customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select className="input-field pl-11 pr-10 py-3 appearance-none cursor-pointer min-w-[160px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.values(QuotationStatus).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading quotations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 border border-gray-200 text-center py-16 px-6">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No quotations found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first quotation to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Quote #</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Booking</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Subtotal</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tax</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Valid Until</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((q) => {
                  const customer = typeof q.customerId === 'object' ? q.customerId : null;
                  const sc = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
                  const expired = new Date(q.validUntil) < new Date() && q.status === QuotationStatus.Sent;
                  return (
                    <tr key={q._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <CopyableCode code={q.quotationNumber} />
                        <p className="text-[11px] text-gray-400">{format(new Date(q.createdAt), 'MMM d, yyyy')}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{customer?.name || customer?.email || '—'}</td>
                      <td className="px-4 py-4">
                        {q.bookingId ? (
                          <CopyableCode code={typeof q.bookingId === 'object' ? (q.bookingId.bookingNumber || q.bookingId._id.slice(-6).toUpperCase()) : String(q.bookingId).slice(-6).toUpperCase()} className="text-xs" />
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-right">${(q.subtotalCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 text-right">${(q.taxAmountCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">${(q.totalAmountCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${expired ? STATUS_CONFIG.expired.bg + ' ' + STATUS_CONFIG.expired.color : sc.bg + ' ' + sc.color}`}>
                          {expired ? 'Expired' : sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{format(new Date(q.validUntil), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-4">
                        {q.status === QuotationStatus.Draft && (
                          <button onClick={() => setSendModal(q)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                            <Send className="h-3 w-3" /> Send
                          </button>
                        )}
                        {q.status === QuotationStatus.Accepted && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" /> Accepted
                            </span>
                            {!invoiceByQuotation[q._id] && (
                              <button
                                onClick={() => createInvoiceFromQuotation(q)}
                                disabled={invoiceCreating === q._id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                              >
                                {invoiceCreating === q._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />} Invoice
                              </button>
                            )}
                            {invoiceByQuotation[q._id] && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-600">
                                <FileText className="h-3 w-3" /> {invoiceByQuotation[q._id].invoiceNumber}
                              </span>
                            )}
                          </div>
                        )}
                        {q.status === QuotationStatus.Declined && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Declined
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create Quotation Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create Quotation</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Booking Search */}
              <div ref={bookingSearchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Find Booking <span className="text-red-400">*</span>
                </label>
                {selectedBooking ? (
                  /* Selected booking card */
                  <div className="rounded-xl border-2 border-brand-300 bg-brand-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-900 text-white text-xs font-mono font-bold">
                            <Hash className="h-3 w-3" />
                            {selectedBooking.bookingNumber || selectedBooking._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${SERVICE_COLORS[selectedBooking.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                            {selectedBooking.serviceType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                            {selectedBooking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          {typeof selectedBooking.customerId === 'object' && (
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              {selectedBooking.customerId.name || selectedBooking.customerId.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {format(new Date(selectedBooking.scheduledDate), 'MMM d, yyyy')} at {selectedBooking.scheduledTime}
                          </span>
                          {selectedBooking.address && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              {selectedBooking.address.city}, {selectedBooking.address.state} {selectedBooking.address.zip}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Amount: <span className="font-semibold text-gray-800">${(selectedBooking.amountCents / 100).toFixed(2)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearBooking}
                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Clear selection"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Search input + dropdown */
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      className="input-field pl-10 py-2.5"
                      placeholder="Search by booking #, customer name, email, service type, city..."
                      value={bookingSearch}
                      onChange={(e) => {
                        setBookingSearch(e.target.value);
                        setBookingDropdownOpen(true);
                      }}
                      onFocus={() => setBookingDropdownOpen(true)}
                    />
                    {bookingSearch && (
                      <button
                        type="button"
                        onClick={() => { setBookingSearch(''); setBookingDropdownOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Dropdown results */}
                    {bookingDropdownOpen && (
                      <div className="absolute z-10 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl ring-1 ring-black/5">
                        {bookingResults.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No bookings found{bookingSearch ? ` for "${bookingSearch}"` : ''}.
                          </div>
                        ) : (
                          bookingResults.map((b) => {
                            const customer = typeof b.customerId === 'object' ? b.customerId : null;
                            return (
                              <button
                                key={b._id}
                                type="button"
                                onClick={() => selectBooking(b)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-brand-50 focus:outline-none"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono font-bold text-gray-900">
                                    {b.bookingNumber || b._id.slice(-6).toUpperCase()}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${SERVICE_COLORS[b.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                                    {b.serviceType}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium capitalize">
                                    {b.status.replace('_', ' ')}
                                  </span>
                                  <span className="ml-auto text-xs font-semibold text-gray-700">
                                    ${(b.amountCents / 100).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {customer && (
                                    <span className="truncate max-w-[160px]">{customer.name || customer.email}</span>
                                  )}
                                  <span>{format(new Date(b.scheduledDate), 'MMM d, yyyy')}</span>
                                  {b.address && <span>{b.address.city}, {b.address.state}</span>}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  Type a booking number, customer name, email, service type, or city to search
                </p>
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="space-y-2">
                  {formLineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input type="text" className="input-field py-2 flex-1" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} required />
                      <input type="number" className="input-field py-2 w-20 text-center" placeholder="Qty" min={1} value={item.quantity} onChange={(e) => updateLineItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                      <CurrencyInput
                        value={item.unitPriceCents}
                        onChange={(cents) => updateLineItem(idx, 'unitPriceCents', cents)}
                        className="w-28"
                        placeholder="0.00"
                        size="sm"
                        required
                      />
                      <span className="text-sm font-medium text-gray-600 w-20 text-right pt-2.5">${((item.quantity * item.unitPriceCents) / 100).toFixed(2)}</span>
                      {formLineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(idx)} className="p-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addLineItem} className="mt-2 text-sm text-brand-600 font-medium hover:text-brand-700">+ Add line item</button>
              </div>

              {/* Tax + Valid Until */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
                  <input type="number" className="input-field py-2.5" value={formTaxRate} step={0.01} min={0} max={100} onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Until</label>
                  <input type="date" className="input-field py-2.5" value={formValidUntil} onChange={(e) => setFormValidUntil(e.target.value)} required />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea className="input-field py-2.5 resize-none" rows={2} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Scope of work, special conditions..." />
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">MA Sales Tax ({formTaxRate}%)</span>
                  <span className="text-gray-600">${(taxAmountCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="btn-secondary flex-1 !py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={creating || !selectedBooking} className="btn-primary flex-1 !py-2.5 text-sm">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <FileText className="h-4 w-4 mr-1.5" />}
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Confirmation */}
      <ConfirmModal
        open={!!sendModal}
        title="Send Quotation"
        description={sendModal ? `Send quotation ${sendModal.quotationNumber} ($${(sendModal.totalAmountCents / 100).toFixed(2)}) to the customer via email?` : ''}
        confirmLabel="Send Quotation"
        loading={sending}
        onConfirm={handleSend}
        onCancel={() => setSendModal(null)}
      />
    </div>
  );
}
