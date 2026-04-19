'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Booking, BookingStatus, Invoice, InvoiceStatus, Quotation, QuotationStatus } from '@/types';
import { format } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import { CurrencyInput } from '@/components/FormFields';
import CopyableCode from '@/components/CopyableCode';
import {
  MapPin,
  User,
  Clock,
  CalendarDays,
  Filter,
  UserPlus,
  DollarSign,
  Search,
  Sparkles,
  Building2,
  Repeat,
  Store,
  Stethoscope,
  Warehouse,
  HardHat,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  RefreshCw,
  LayoutGrid,
  List,
  Send,
  FileText,
  ArrowRightLeft,
  ClipboardList,
  X,
  Plus,
  Receipt,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: typeof CheckCircle }> = {
  pending_quote: { label: 'Pending Quote', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500', icon: Clock },
  quoted: { label: 'Quoted', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', dot: 'bg-cyan-500', icon: FileText },
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', icon: CheckCircle },
  inProgress: { label: 'In Progress', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', icon: AlertCircle },
};

const SERVICE_ICONS: Record<string, typeof Building2> = {
  office: Building2,
  retail: Store,
  medical: Stethoscope,
  industrial: Warehouse,
  postConstruction: HardHat,
  recurring: Repeat,
};

const SERVICE_COLORS: Record<string, string> = {
  office: 'from-brand-500 to-brand-600',
  retail: 'from-ocean-500 to-ocean-600',
  medical: 'from-warm-500 to-warm-600',
  industrial: 'from-violet-500 to-violet-600',
  postConstruction: 'from-amber-500 to-amber-600',
  recurring: 'from-violet-500 to-violet-600',
};

const ASSIGNABLE_STATUSES: string[] = [
  BookingStatus.PendingQuote,
  BookingStatus.Quoted,
  BookingStatus.Approved,
  BookingStatus.Pending,
];

// ── Line item helper for quick-create modals ──
interface QLineItem { description: string; quantity: number; unitPriceCents: number; }
const defaultLineItem = (): QLineItem => ({ description: '', quantity: 1, unitPriceCents: 0 });

export default function JobBoard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [view, setView] = useState<'card' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jobBoardView') as 'card' | 'list') || 'card';
    }
    return 'card';
  });

  // Status change modal
  const [statusModal, setStatusModal] = useState<{ bookingId: string; newStatus: string } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Invoice send modal
  const [invoiceModal, setInvoiceModal] = useState<{ invoiceId: string; bookingId: string } | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // ── Quick-create Quotation modal ──
  const [quotationModal, setQuotationModal] = useState<Booking | null>(null);
  const [qLineItems, setQLineItems] = useState<QLineItem[]>([defaultLineItem()]);
  const [qTaxRate, setQTaxRate] = useState(6.25);
  const [qNotes, setQNotes] = useState('');
  const [qValidUntil, setQValidUntil] = useState('');
  const [qCreating, setQCreating] = useState(false);

  const switchView = (v: 'card' | 'list') => {
    setView(v);
    localStorage.setItem('jobBoardView', v);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter) params.append('status', filter);
      const [bookRes, staffRes, invRes, quotRes] = await Promise.all([
        api.get(`/bookings?${params}`),
        api.get('/staff'),
        api.get('/invoices?limit=100'),
        api.get('/quotations?limit=100'),
      ]);
      setBookings(bookRes.data.bookings);
      setStaff(staffRes.data);
      setInvoices(invRes.data.invoices);
      setQuotations(quotRes.data.quotations);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Lookup maps
  const invoiceByBooking = useMemo(() => {
    const map: Record<string, Invoice> = {};
    for (const inv of invoices) {
      const bId = typeof inv.bookingId === 'object' ? inv.bookingId._id : inv.bookingId;
      if (bId) map[bId] = inv;
    }
    return map;
  }, [invoices]);

  const quotationByBooking = useMemo(() => {
    const map: Record<string, Quotation> = {};
    for (const q of quotations) {
      const bId = typeof q.bookingId === 'object' ? q.bookingId._id : q.bookingId;
      if (bId) map[bId] = q;
    }
    return map;
  }, [quotations]);

  async function assignStaff(bookingId: string, staffId: string) {
    setAssigning(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/assign`, { staffId });
      toast.success('Staff assigned successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Assignment failed');
    } finally {
      setAssigning(null);
    }
  }

  async function handleStatusChange() {
    if (!statusModal) return;
    setStatusLoading(true);
    try {
      await api.patch(`/bookings/${statusModal.bookingId}/status`, { status: statusModal.newStatus });
      toast.success(`Status updated to ${STATUS_CONFIG[statusModal.newStatus]?.label || statusModal.newStatus}`);
      setStatusModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Status update failed');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSendInvoice() {
    if (!invoiceModal) return;
    setInvoiceLoading(true);
    try {
      await api.post(`/invoices/${invoiceModal.invoiceId}/send`);
      toast.success('Invoice sent to customer');
      setInvoiceModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send invoice');
    } finally {
      setInvoiceLoading(false);
    }
  }

  // ── Quick-create Quotation ──
  function openQuotationModal(booking: Booking) {
    setQuotationModal(booking);
    setQLineItems([{ description: `${booking.serviceType} cleaning service`, quantity: 1, unitPriceCents: booking.amountCents }]);
    setQTaxRate(6.25);
    setQNotes('');
    // Default valid 14 days
    const d = new Date(); d.setDate(d.getDate() + 14);
    setQValidUntil(d.toISOString().split('T')[0]);
  }

  async function handleCreateQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!quotationModal) return;
    if (qLineItems.some(i => !i.description || i.unitPriceCents <= 0)) {
      toast.error('Please fill all line items'); return;
    }
    const customerId = typeof quotationModal.customerId === 'object' ? quotationModal.customerId._id : quotationModal.customerId;
    setQCreating(true);
    try {
      await api.post('/quotations', {
        customerId,
        bookingId: quotationModal._id,
        lineItems: qLineItems,
        taxRate: qTaxRate,
        notes: qNotes || undefined,
        validUntil: qValidUntil,
      });
      toast.success('Quotation created');
      setQuotationModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create quotation');
    } finally {
      setQCreating(false);
    }
  }

  const filtered = useMemo(() => {
    let result = [...bookings].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const customer = typeof b.customerId === 'object' ? b.customerId : null;
        return (
          (b.bookingNumber || '').toLowerCase().includes(q) ||
          b.serviceType.toLowerCase().includes(q) ||
          b.address.city.toLowerCase().includes(q) ||
          b.address.zip.includes(q) ||
          customer?.name?.toLowerCase().includes(q) ||
          customer?.email?.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [bookings, search]);

  const statCounts = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'inProgress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }), [bookings]);

  function canAssign(booking: Booking) {
    const assignedStaff = typeof booking.staffId === 'object' ? booking.staffId : null;
    return !assignedStaff && ASSIGNABLE_STATUSES.includes(booking.status);
  }

  // ── Render helpers ──

  function renderStatusSelect(booking: Booking) {
    return (
      <div className="relative">
        <ArrowRightLeft className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <select
          className="pl-9 pr-8 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer appearance-none hover:border-brand-300 focus:ring-2 focus:ring-brand-500/40 transition-all"
          value=""
          onChange={(e) => {
            if (e.target.value) setStatusModal({ bookingId: booking._id, newStatus: e.target.value });
          }}
        >
          <option value="" disabled>Status</option>
          {Object.values(BookingStatus).map((s) => (
            s !== booking.status ? <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option> : null
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  function renderDocActions(booking: Booking) {
    const quotation = quotationByBooking[booking._id];
    const invoice = invoiceByBooking[booking._id];
    const actions: React.ReactNode[] = [];

    // Quotation: show "Create Quotation" if none exists for this booking
    if (!quotation) {
      actions.push(
        <button
          key="create-qt"
          onClick={() => openQuotationModal(booking)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
        >
          <ClipboardList className="h-3 w-3" /> Quote
        </button>
      );
    } else {
      // Show quotation status
      const qStatus = quotation.status;
      if (qStatus === QuotationStatus.Draft) {
        actions.push(
          <span key="qt-draft" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[10px] font-semibold text-gray-500">
            <ClipboardList className="h-3 w-3" /> {quotation.quotationNumber} Draft
          </span>
        );
      } else if (qStatus === QuotationStatus.Sent) {
        actions.push(
          <span key="qt-sent" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-600">
            <ClipboardList className="h-3 w-3" /> {quotation.quotationNumber} Sent
          </span>
        );
      } else if (qStatus === QuotationStatus.Accepted) {
        actions.push(
          <span key="qt-accepted" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200 text-[10px] font-semibold text-green-600">
            <CheckCircle className="h-3 w-3" /> {quotation.quotationNumber}
          </span>
        );
      } else if (qStatus === QuotationStatus.Declined) {
        actions.push(
          <span key="qt-declined" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-[10px] font-semibold text-red-500">
            <ClipboardList className="h-3 w-3" /> Declined
          </span>
        );
      }
    }

    // Invoice actions
    if (invoice) {
      if (invoice.status === InvoiceStatus.Draft) {
        actions.push(
          <button
            key="send-inv"
            onClick={() => setInvoiceModal({ invoiceId: invoice._id, bookingId: booking._id })}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <Send className="h-3 w-3" /> Send Invoice
          </button>
        );
      } else if (invoice.status === InvoiceStatus.Sent) {
        actions.push(
          <span key="inv-sent" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
            <FileText className="h-3 w-3" /> Invoice Sent
          </span>
        );
      } else if (invoice.status === InvoiceStatus.Paid) {
        actions.push(
          <span key="inv-paid" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200 text-[10px] font-semibold text-green-700">
            <Receipt className="h-3 w-3" /> Paid
          </span>
        );
      } else if (invoice.status === InvoiceStatus.Refunded) {
        actions.push(
          <span key="inv-refund" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[10px] font-semibold text-gray-500">
            Refunded
          </span>
        );
      }
    }

    return actions.length > 0 ? <>{actions}</> : null;
  }

  // ── Quotation modal totals ──
  const qSubtotal = qLineItems.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
  const qTax = Math.round(qSubtotal * (qTaxRate / 100));
  const qTotal = qSubtotal + qTax;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bookings, assign staff, and track progress</p>
        </div>
        <button
          onClick={() => loadData()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', val: statCounts.total, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
          { label: 'Pending', val: statCounts.pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Confirmed', val: statCounts.confirmed, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'In Progress', val: statCounts.inProgress, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
          { label: 'Completed', val: statCounts.completed, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilter(s.label === 'Total' ? '' : s.label.toLowerCase().replace(' ', ''))}
            className={`rounded-2xl ${s.bg} border ${s.border} p-4 text-center hover:shadow-md transition-all duration-200 ${
              (filter === '' && s.label === 'Total') || filter === s.label.toLowerCase().replace(' ', '') ? 'ring-2 ring-brand-500/40 shadow-sm' : ''
            }`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" className="input-field pl-11 py-3" placeholder="Search by booking #, customer, city, or service type..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select className="input-field pl-11 pr-10 py-3 appearance-none cursor-pointer min-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.values(BookingStatus).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => switchView('card')} className={`px-4 py-3 transition-colors ${view === 'card' ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => switchView('list')} className={`px-4 py-3 transition-colors border-l border-gray-200 ${view === 'list' ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 border border-gray-200 text-center py-16 px-6">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1">{filter ? 'Try changing the status filter or clearing your search.' : 'No bookings have been created yet.'}</p>
        </div>
      ) : view === 'card' ? (
        /* ── Card View ── */
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((booking) => {
            const customer = typeof booking.customerId === 'object' ? booking.customerId : null;
            const assignedStaff = typeof booking.staffId === 'object' ? booking.staffId : null;
            const statusConf = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
            const ServiceIcon = SERVICE_ICONS[booking.serviceType] || Building2;
            const serviceColor = SERVICE_COLORS[booking.serviceType] || 'from-gray-500 to-gray-600';

            return (
              <div key={booking._id} className="group rounded-3xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${serviceColor} flex items-center justify-center shadow-sm`}>
                      <ServiceIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize text-sm">{booking.serviceType} Cleaning</h3>
                      <CopyableCode code={booking.bookingNumber || booking._id.slice(-6).toUpperCase()} className="text-xs text-gray-400" />
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusConf.bg} ${statusConf.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                    {statusConf.label}
                  </span>
                </div>

                <div className="px-6 py-3 space-y-2.5">
                  {customer && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <User className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700 truncate">{customer.name || customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{format(new Date(booking.scheduledDate), 'EEE, MMM d')} at {booking.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 truncate">{booking.address.street}, {booking.address.city}, MA {booking.address.zip}</span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-brand-500" />
                      <span className="text-lg font-bold text-gray-900">{(booking.amountCents / 100).toFixed(2)}</span>
                    </div>
                    {canAssign(booking) ? (
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select className="pl-10 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer appearance-none hover:border-brand-300 focus:ring-2 focus:ring-brand-500/40 transition-all" defaultValue="" disabled={assigning === booking._id} onChange={(e) => { if (e.target.value) assignStaff(booking._id, e.target.value); }}>
                          <option value="" disabled>Assign Staff</option>
                          {staff.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                    ) : assignedStaff ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-white text-xs font-bold">
                          {(assignedStaff.name || assignedStaff.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{assignedStaff.name || assignedStaff.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">&mdash;</span>
                    )}
                  </div>
                  {/* Actions: Status + Doc chain */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderStatusSelect(booking)}
                    {renderDocActions(booking)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Service</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Schedule</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Staff</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Documents</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((booking) => {
                  const customer = typeof booking.customerId === 'object' ? booking.customerId : null;
                  const assignedStaff = typeof booking.staffId === 'object' ? booking.staffId : null;
                  const statusConf = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const ServiceIcon = SERVICE_ICONS[booking.serviceType] || Building2;
                  const serviceColor = SERVICE_COLORS[booking.serviceType] || 'from-gray-500 to-gray-600';

                  return (
                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${serviceColor} flex items-center justify-center`}>
                            <ServiceIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 capitalize">{booking.serviceType}</p>
                            <CopyableCode code={booking.bookingNumber || booking._id.slice(-6).toUpperCase()} className="text-[11px] text-gray-400" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 truncate max-w-[150px]">{customer?.name || customer?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{format(new Date(booking.scheduledDate), 'MMM d')}</p>
                        <p className="text-xs text-gray-400">{booking.scheduledTime}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConf.bg} ${statusConf.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">${(booking.amountCents / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        {canAssign(booking) ? (
                          <select className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium cursor-pointer appearance-none hover:border-brand-300 transition-colors" defaultValue="" disabled={assigning === booking._id} onChange={(e) => { if (e.target.value) assignStaff(booking._id, e.target.value); }}>
                            <option value="" disabled>Assign</option>
                            {staff.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
                          </select>
                        ) : assignedStaff ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {(assignedStaff.name || '?')[0].toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600">{assignedStaff.name || assignedStaff.email}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">{renderDocActions(booking)}</div>
                      </td>
                      <td className="px-4 py-4">
                        {renderStatusSelect(booking)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
      )}

      {/* ── Status Change Modal ── */}
      <ConfirmModal open={!!statusModal} title="Change Booking Status" description={statusModal ? `Change status to "${STATUS_CONFIG[statusModal.newStatus]?.label || statusModal.newStatus}"?` : ''} confirmLabel="Update Status" loading={statusLoading} onConfirm={handleStatusChange} onCancel={() => setStatusModal(null)} />

      {/* ── Send Invoice Modal ── */}
      <ConfirmModal open={!!invoiceModal} title="Send Invoice" description="Email the invoice to the customer?" confirmLabel="Send Invoice" loading={invoiceLoading} onConfirm={handleSendInvoice} onCancel={() => setInvoiceModal(null)} />

      {/* ── Quick-Create Quotation Modal ── */}
      {quotationModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Quotation</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Booking {quotationModal.bookingNumber || quotationModal._id.slice(-6).toUpperCase()} &bull; {quotationModal.serviceType} &bull;{' '}
                  {typeof quotationModal.customerId === 'object' ? (quotationModal.customerId.name || quotationModal.customerId.email) : ''}
                </p>
              </div>
              <button onClick={() => setQuotationModal(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 space-y-4">
              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                {qLineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start mb-2">
                    <input type="text" className="input-field py-2 flex-1 text-sm" placeholder="Description" value={item.description} onChange={(e) => { const n = [...qLineItems]; n[idx] = { ...n[idx], description: e.target.value }; setQLineItems(n); }} required />
                    <input type="number" className="input-field py-2 w-16 text-center text-sm" min={1} value={item.quantity} onChange={(e) => { const n = [...qLineItems]; n[idx] = { ...n[idx], quantity: parseInt(e.target.value) || 1 }; setQLineItems(n); }} />
                    <CurrencyInput
                      value={item.unitPriceCents}
                      onChange={(cents) => { const n = [...qLineItems]; n[idx] = { ...n[idx], unitPriceCents: cents }; setQLineItems(n); }}
                      className="w-24"
                      placeholder="0.00"
                      size="sm"
                      required
                    />
                    {qLineItems.length > 1 && (
                      <button type="button" onClick={() => setQLineItems(qLineItems.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setQLineItems([...qLineItems, defaultLineItem()])} className="text-xs text-brand-600 font-medium hover:text-brand-700">+ Add line item</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input type="number" className="input-field py-2 text-sm" value={qTaxRate} step={0.01} min={0} max={100} onChange={(e) => setQTaxRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="date" className="input-field py-2 text-sm" value={qValidUntil} onChange={(e) => setQValidUntil(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea className="input-field py-2 text-sm resize-none" rows={2} value={qNotes} onChange={(e) => setQNotes(e.target.value)} placeholder="Scope of work, conditions..." />
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${(qSubtotal / 100).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax ({qTaxRate}%)</span><span>${(qTax / 100).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5"><span>Total</span><span>${(qTotal / 100).toFixed(2)}</span></div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setQuotationModal(null)} className="btn-secondary flex-1 !py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={qCreating} className="btn-primary flex-1 !py-2.5 text-sm">
                  {qCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <ClipboardList className="h-4 w-4 mr-1.5" />}
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
