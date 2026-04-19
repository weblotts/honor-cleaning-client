'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Invoice, InvoiceStatus, Quotation } from '@/types';
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
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Loader2,
  Undo2,
  Hash,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200' },
  sent: { label: 'Sent', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  refunded: { label: 'Refunded', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

interface LineItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sendModal, setSendModal] = useState<Invoice | null>(null);
  const [sending, setSending] = useState(false);
  const [refundModal, setRefundModal] = useState<Invoice | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState<Invoice | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Quotation search in create form
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationDropdownOpen, setQuotationDropdownOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const quotationSearchRef = useRef<HTMLDivElement>(null);

  // Create form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formLineItems, setFormLineItems] = useState<LineItemInput[]>([
    { description: '', quantity: 1, unitPriceCents: 0 },
  ]);
  const [formTaxRate, setFormTaxRate] = useState(6.25);
  const [formNotes, setFormNotes] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'stripe' | 'cheque'>('stripe');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter) params.append('status', filter);
      const [invRes, custRes, quotRes] = await Promise.all([
        api.get(`/invoices?${params}`),
        api.get('/customers?limit=200'),
        api.get('/quotations?limit=200'),
      ]);
      setInvoices(invRes.data.invoices);
      setCustomers(custRes.data.customers || custRes.data);
      setQuotations(quotRes.data.quotations || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Close quotation dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (quotationSearchRef.current && !quotationSearchRef.current.contains(e.target as Node)) {
        setQuotationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter quotations by search query
  const quotationResults = useMemo(() => {
    if (!quotationSearch.trim()) return quotations.slice(0, 20);
    const q = quotationSearch.toLowerCase();
    return quotations.filter((qt) => {
      const customer = typeof qt.customerId === 'object' ? qt.customerId : null;
      return (
        qt.quotationNumber?.toLowerCase().includes(q) ||
        customer?.name?.toLowerCase().includes(q) ||
        customer?.email?.toLowerCase().includes(q)
      );
    }).slice(0, 20);
  }, [quotations, quotationSearch]);

  function selectQuotation(qt: Quotation) {
    setSelectedQuotation(qt);
    setQuotationDropdownOpen(false);
    const customer = typeof qt.customerId === 'object' ? qt.customerId : null;
    setQuotationSearch(
      `${qt.quotationNumber}${customer ? ` — ${customer.name || customer.email}` : ''}`
    );
    // Auto-fill form fields from quotation
    const custId = typeof qt.customerId === 'object' ? qt.customerId._id : qt.customerId;
    setFormCustomerId(custId);
    setFormLineItems(
      qt.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
      }))
    );
    setFormTaxRate(qt.taxRate);
    if (qt.notes) setFormNotes(qt.notes);
    // Default due date: 30 days from now
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setFormDueDate(due.toISOString().split('T')[0]);
  }

  function clearQuotation() {
    setSelectedQuotation(null);
    setQuotationSearch('');
  }

  // Calculate totals
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
    if (!formCustomerId || formLineItems.some(i => !i.description || i.unitPriceCents <= 0)) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      const body: any = {
        customerId: formCustomerId,
        lineItems: formLineItems,
        taxRate: formTaxRate,
        notes: formNotes || undefined,
        dueDate: formDueDate,
        paymentMethod: formPaymentMethod,
      };
      if (selectedQuotation) {
        body.quotationId = selectedQuotation._id;
        const bookingId = typeof selectedQuotation.bookingId === 'object'
          ? selectedQuotation.bookingId._id
          : selectedQuotation.bookingId;
        if (bookingId) body.bookingId = bookingId;
      }
      await api.post('/invoices', body);
      toast.success('Invoice created');
      setShowCreate(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setFormCustomerId('');
    setFormLineItems([{ description: '', quantity: 1, unitPriceCents: 0 }]);
    setFormTaxRate(6.25);
    setFormNotes('');
    setFormDueDate('');
    setFormPaymentMethod('stripe');
    setSelectedQuotation(null);
    setQuotationSearch('');
  }

  async function handleSend() {
    if (!sendModal) return;
    setSending(true);
    try {
      await api.post(`/invoices/${sendModal._id}/send`);
      toast.success('Invoice sent to customer');
      setSendModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  async function handleRefund() {
    if (!refundModal) return;
    setRefunding(true);
    try {
      await api.post(`/invoices/${refundModal._id}/refund`);
      toast.success('Refund processed');
      setRefundModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Refund failed');
    } finally {
      setRefunding(false);
    }
  }

  async function handleMarkPaid() {
    if (!markPaidModal) return;
    setMarkingPaid(true);
    try {
      await api.post(`/invoices/${markPaidModal._id}/confirm-payment`);
      toast.success('Invoice marked as paid — receipt generated');
      setMarkPaidModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(false);
    }
  }

  // Accepted quotations that don't have invoices yet
  const acceptedWithoutInvoice = useMemo(() => {
    const invoicedQuotationIds = new Set(
      invoices
        .map((inv) => typeof inv.quotationId === 'object' ? inv.quotationId._id : inv.quotationId)
        .filter(Boolean)
    );
    return quotations.filter(
      (q) => q.status === 'accepted' && !invoicedQuotationIds.has(q._id)
    );
  }, [quotations, invoices]);

  function openCreateFromQuotation(qt: Quotation) {
    selectQuotation(qt);
    setShowCreate(true);
  }

  const filtered = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const customer = typeof inv.customerId === 'object' ? inv.customerId : null;
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      customer?.name?.toLowerCase().includes(q) ||
      customer?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Create, send, and manage customer invoices</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => loadData()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary !py-2.5 text-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Invoice
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" className="input-field pl-11 py-3" placeholder="Search by invoice #, customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select className="input-field pl-11 pr-10 py-3 appearance-none cursor-pointer min-w-[160px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.values(InvoiceStatus).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Accepted quotations awaiting invoice */}
      {!loading && acceptedWithoutInvoice.length > 0 && (
        <div className="rounded-2xl border border-green-200 bg-green-50/60 p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Accepted Quotations — Ready to Invoice
          </h3>
          <div className="flex flex-wrap gap-2">
            {acceptedWithoutInvoice.map((qt) => {
              const customer = typeof qt.customerId === 'object' ? qt.customerId : null;
              return (
                <button
                  key={qt._id}
                  onClick={() => openCreateFromQuotation(qt)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-green-200 text-sm hover:border-brand-300 hover:bg-brand-50 transition-colors shadow-sm"
                >
                  <span className="font-mono font-bold text-gray-900 text-xs">{qt.quotationNumber}</span>
                  {customer && <span className="text-gray-500 text-xs">{customer.name || customer.email}</span>}
                  <span className="font-semibold text-gray-700 text-xs">${(qt.totalAmountCents / 100).toFixed(2)}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-semibold">
                    <FileText className="h-3 w-3" /> Create Invoice
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading invoices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 border border-gray-200 text-center py-16 px-6">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No invoices found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first invoice to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Invoice #</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Subtotal</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tax</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Payment</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Due Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((inv) => {
                  const customer = typeof inv.customerId === 'object' ? inv.customerId : null;
                  const isOverdue = inv.status === InvoiceStatus.Sent && inv.dueDate && new Date(inv.dueDate) < new Date();
                  const sc = isOverdue ? STATUS_CONFIG.overdue : (STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft);
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <CopyableCode code={inv.invoiceNumber} />
                        <p className="text-[11px] text-gray-400">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{customer?.name || customer?.email || '—'}</td>
                      <td className="px-4 py-4">
                        {inv.quotationId && typeof inv.quotationId === 'object' ? (
                          <CopyableCode code={inv.quotationId.quotationNumber} className="text-xs" />
                        ) : inv.bookingId ? (
                          <CopyableCode code={typeof inv.bookingId === 'object' ? (inv.bookingId.bookingNumber || inv.bookingId._id.slice(-6).toUpperCase()) : String(inv.bookingId).slice(-6).toUpperCase()} className="text-xs" />
                        ) : (
                          <span className="text-xs text-gray-400">Manual</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-right">${(inv.subtotalCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 text-right">${(inv.taxAmountCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">${(inv.totalAmountCents / 100).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.bg} ${sc.color}`}>
                          {isOverdue ? 'Overdue' : sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (inv.paymentMethod || 'stripe') === 'cheque'
                            ? 'bg-amber-50 border border-amber-200 text-amber-700'
                            : 'bg-violet-50 border border-violet-200 text-violet-700'
                        }`}>
                          <DollarSign className="h-3 w-3" />
                          {(inv.paymentMethod || 'stripe') === 'cheque' ? 'Cheque' : 'Stripe'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{inv.dueDate ? format(new Date(inv.dueDate), 'MMM d, yyyy') : '—'}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {inv.status === InvoiceStatus.Draft && (
                            <button onClick={() => setSendModal(inv)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                              <Send className="h-3 w-3" /> Send
                            </button>
                          )}
                          {inv.status === InvoiceStatus.Sent && (
                            <button onClick={() => setMarkPaidModal(inv)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
                              <CheckCircle className="h-3 w-3" /> Mark Paid
                            </button>
                          )}
                          {inv.status === InvoiceStatus.Paid && (
                            <button onClick={() => setRefundModal(inv)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                              <Undo2 className="h-3 w-3" /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create Invoice Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create Invoice</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Quotation Search (optional) */}
              <div ref={quotationSearchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From Quotation <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {selectedQuotation ? (
                  <div className="rounded-xl border-2 border-brand-300 bg-brand-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-900 text-white text-xs font-mono font-bold">
                            <Hash className="h-3 w-3" />
                            {selectedQuotation.quotationNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
                            selectedQuotation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            selectedQuotation.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedQuotation.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          {typeof selectedQuotation.customerId === 'object' && (
                            <span>{selectedQuotation.customerId.name || selectedQuotation.customerId.email}</span>
                          )}
                          <span className="font-semibold text-gray-800">
                            ${(selectedQuotation.totalAmountCents / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearQuotation}
                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Clear selection"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      className="input-field pl-10 py-2.5"
                      placeholder="Paste or search quotation number (e.g. QT-00001), customer name..."
                      value={quotationSearch}
                      onChange={(e) => {
                        setQuotationSearch(e.target.value);
                        setQuotationDropdownOpen(true);
                      }}
                      onFocus={() => setQuotationDropdownOpen(true)}
                    />
                    {quotationSearch && (
                      <button
                        type="button"
                        onClick={() => { setQuotationSearch(''); setQuotationDropdownOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {quotationDropdownOpen && (
                      <div className="absolute z-10 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl ring-1 ring-black/5">
                        {quotationResults.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No quotations found{quotationSearch ? ` for "${quotationSearch}"` : ''}.
                          </div>
                        ) : (
                          quotationResults.map((qt) => {
                            const customer = typeof qt.customerId === 'object' ? qt.customerId : null;
                            return (
                              <button
                                key={qt._id}
                                type="button"
                                onClick={() => selectQuotation(qt)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-brand-50 focus:outline-none"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono font-bold text-gray-900">
                                    {qt.quotationNumber}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                    qt.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    qt.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                    qt.status === 'declined' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {qt.status}
                                  </span>
                                  <span className="ml-auto text-xs font-semibold text-gray-700">
                                    ${(qt.totalAmountCents / 100).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  {customer && (
                                    <span className="truncate max-w-[200px]">{customer.name || customer.email}</span>
                                  )}
                                  <span>Valid until {format(new Date(qt.validUntil), 'MMM d, yyyy')}</span>
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
                  Paste a quotation number to auto-fill customer, line items, and tax rate
                </p>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer</label>
                <select
                  className="input-field py-2.5"
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  required
                  disabled={!!selectedQuotation}
                >
                  <option value="">Select customer...</option>
                  {customers.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name || c.email}</option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="space-y-2">
                  {formLineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        className="input-field py-2 flex-1"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        className="input-field py-2 w-20 text-center"
                        placeholder="Qty"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <CurrencyInput
                        value={item.unitPriceCents}
                        onChange={(cents) => updateLineItem(idx, 'unitPriceCents', cents)}
                        className="w-28"
                        placeholder="0.00"
                        size="sm"
                        required
                      />
                      <span className="text-sm font-medium text-gray-600 w-20 text-right pt-2.5">
                        ${((item.quantity * item.unitPriceCents) / 100).toFixed(2)}
                      </span>
                      {formLineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(idx)} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addLineItem} className="mt-2 text-sm text-brand-600 font-medium hover:text-brand-700">
                  + Add line item
                </button>
              </div>

              {/* Tax + Due Date + Payment Method row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="input-field py-2.5"
                    value={formTaxRate}
                    step={0.01}
                    min={0}
                    max={100}
                    onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    className="input-field py-2.5"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                  <select
                    className="input-field py-2.5"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as 'stripe' | 'cheque')}
                  >
                    <option value="stripe">Stripe (Online)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea className="input-field py-2.5 resize-none" rows={2} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Payment terms, thank you message..." />
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
                <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="btn-secondary flex-1 !py-2.5 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 !py-2.5 text-sm">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <FileText className="h-4 w-4 mr-1.5" />}
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Confirmation */}
      <ConfirmModal
        open={!!sendModal}
        title="Send Invoice"
        description={sendModal ? `Send invoice ${sendModal.invoiceNumber} ($${(sendModal.totalAmountCents / 100).toFixed(2)}) to the customer via email?` : ''}
        confirmLabel="Send Invoice"
        loading={sending}
        onConfirm={handleSend}
        onCancel={() => setSendModal(null)}
      />

      {/* Mark Paid Confirmation */}
      <ConfirmModal
        open={!!markPaidModal}
        title="Mark Invoice as Paid"
        description={markPaidModal ? `Mark invoice ${markPaidModal.invoiceNumber} ($${(markPaidModal.totalAmountCents / 100).toFixed(2)}) as paid? A receipt will be generated and sent to the customer.` : ''}
        confirmLabel="Mark as Paid"
        loading={markingPaid}
        onConfirm={handleMarkPaid}
        onCancel={() => setMarkPaidModal(null)}
      />

      {/* Refund Confirmation */}
      <ConfirmModal
        open={!!refundModal}
        title="Refund Invoice"
        description={refundModal ? `Process a refund of $${(refundModal.totalAmountCents / 100).toFixed(2)} for invoice ${refundModal.invoiceNumber}? This action cannot be undone.` : ''}
        confirmLabel="Process Refund"
        variant="danger"
        loading={refunding}
        onConfirm={handleRefund}
        onCancel={() => setRefundModal(null)}
      />
    </div>
  );
}
