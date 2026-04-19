'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Invoice, InvoiceStatus } from '@/types';
import { format } from 'date-fns';
import StripePaymentModal from '@/components/StripePaymentModal';
import CopyableCode from '@/components/CopyableCode';
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Undo2,
  DollarSign,
  AlertTriangle,
  Landmark,
} from 'lucide-react';
import { ChequePayment, ChequeStatus } from '@/types';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200', icon: Clock },
  sent: { label: 'Awaiting Payment', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  refunded: { label: 'Refunded', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: Undo2 },
};

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectHandled = useRef(false);

  useEffect(() => { loadData(); }, []);

  // Handle redirect-based payment returns (Affirm, etc.)
  useEffect(() => {
    if (redirectHandled.current) return;
    const paymentStatus = searchParams.get('payment');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentStatus === 'success' || redirectStatus === 'succeeded') {
      redirectHandled.current = true;
      // Stripe appends payment_intent to the return URL
      const piId = searchParams.get('payment_intent');
      if (piId) {
        // Find the invoice with this payment intent and confirm it
        api.get('/invoices?limit=50').then((res) => {
          const inv = res.data.invoices.find(
            (i: Invoice) => i.stripePaymentIntentId === piId && i.status !== InvoiceStatus.Paid,
          );
          if (inv) {
            api.post(`/invoices/${inv._id}/confirm-payment`).then(() => {
              toast.success('Payment successful!');
              loadData();
            }).catch(() => {
              // Webhook will handle it
              loadData();
            });
          } else {
            // Already marked paid by webhook
            toast.success('Payment successful!');
            loadData();
          }
        });
      } else {
        toast.success('Payment successful!');
        loadData();
      }
      // Clean up URL params
      router.replace('/dashboard/invoices');
    }
  }, [searchParams, router]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get('/invoices?limit=50');
      const fresh: Invoice[] = res.data.invoices;
      setInvoices(fresh);

      // Keep selectedInvoice in sync with fresh data
      if (selectedInvoice) {
        const updated = fresh.find(i => i._id === selectedInvoice._id);
        if (updated) setSelectedInvoice(updated);
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  async function handleInitiatePayment(invoice: Invoice) {
    // Prevent paying an already-paid invoice
    if (invoice.status === InvoiceStatus.Paid) {
      toast.error('This invoice has already been paid');
      return;
    }

    setPaying(true);
    try {
      const { data } = await api.post(`/invoices/${invoice._id}/pay`);

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPayModal(invoice);
      } else {
        // Stripe not configured — mark as paid directly
        await api.post(`/invoices/${invoice._id}/confirm-payment`);

        // Update local state immediately
        const paidInvoice = { ...invoice, status: InvoiceStatus.Paid, paidAt: new Date().toISOString() } as Invoice;
        setSelectedInvoice(paidInvoice);
        setInvoices(prev => prev.map(i => i._id === invoice._id ? paidInvoice : i));

        toast.success('Payment recorded successfully!');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  }

  async function handlePaymentSuccess() {
    if (!payModal) return;

    // Immediately update local state so the Pay button disappears
    const paidInvoice = { ...payModal, status: InvoiceStatus.Paid, paidAt: new Date().toISOString() } as Invoice;
    setSelectedInvoice(paidInvoice);
    setInvoices(prev => prev.map(i => i._id === payModal._id ? paidInvoice : i));

    // Confirm payment on our backend (webhook will also handle this)
    try {
      await api.post(`/invoices/${payModal._id}/confirm-payment`);
    } catch {
      // Webhook will mark it paid if this fails
    }
    toast.success('Payment successful!');
    setPayModal(null);
    setClientSecret(null);
    loadData();
  }

  const unpaid = invoices.filter(i => i.status === InvoiceStatus.Sent && !(i.dueDate && new Date(i.dueDate) < new Date()));
  const overdue = invoices.filter(i => i.status === InvoiceStatus.Sent && i.dueDate && new Date(i.dueDate) < new Date());
  const paid = invoices.filter(i => i.status === InvoiceStatus.Paid);
  const other = invoices.filter(i => i.status === InvoiceStatus.Refunded || i.status === InvoiceStatus.Draft);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Invoice detail view
  if (selectedInvoice) {
    const inv = selectedInvoice;
    const isPaid = inv.status === InvoiceStatus.Paid;
    const isOverdue = inv.status === InvoiceStatus.Sent && inv.dueDate && new Date(inv.dueDate) < new Date();
    const sc = isOverdue ? STATUS_CONFIG.overdue : (STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft);
    const StatusIcon = sc.icon;
    const fmt = (cents: number) => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => setSelectedInvoice(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </button>

        <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isPaid ? 'border-brand-200' : 'border-gray-200'}`}>

          {/* ── Header: receipt-style when paid, standard when unpaid ── */}
          {isPaid ? (
            <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-emerald-500 px-6 sm:px-8 py-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-4">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Payment Confirmed</span>
                  </div>
                  <p className="text-4xl sm:text-5xl font-bold tracking-tight">{fmt(inv.totalAmountCents)}</p>
                  <p className="text-brand-200 text-sm mt-2">
                    Paid {inv.paidAt ? format(new Date(inv.paidAt), 'MMMM d, yyyy · h:mm a') : ''}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 ml-auto">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <CopyableCode code={inv.invoiceNumber} className="text-brand-100 text-xs" />
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900"><CopyableCode code={inv.invoiceNumber} /></h1>
                  <p className="text-sm text-gray-500 mt-1">Created {format(new Date(inv.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${sc.bg} ${sc.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {sc.label}
                </span>
              </div>

              {isOverdue && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">This invoice is overdue</p>
                    <p className="text-xs text-red-600 mt-0.5">Payment was due {format(new Date(inv.dueDate), 'MMMM d, yyyy')}. Please contact us to arrange payment.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Body ── */}
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">

            {/* Invoice ref (shown only on paid receipt view) */}
            {isPaid && (
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <CopyableCode code={inv.invoiceNumber} className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600" />
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Created {format(new Date(inv.createdAt), 'MMM d, yyyy')}</span>
              </div>
            )}

            {/* Line Items */}
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
                  {inv.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 capitalize">{item.description}</p>
                        <p className="text-xs text-gray-400 sm:hidden mt-0.5">{item.quantity} x {fmt(item.unitPriceCents)}</p>
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
            <div className={`rounded-xl p-5 space-y-2.5 ${isPaid ? 'bg-gray-50 border border-gray-100' : ''}`}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700 font-medium">{fmt(inv.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MA Sales Tax ({inv.taxRate}%)</span>
                <span className="text-gray-600">{fmt(inv.taxAmountCents)}</span>
              </div>
              {inv.tipAmountCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tip</span>
                  <span className="text-gray-600">{fmt(inv.tipAmountCents)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-1">
                <span className="text-base font-bold text-gray-900">{isPaid ? 'Total Paid' : 'Total'}</span>
                <span className={`text-xl font-bold ${isPaid ? 'text-brand-700' : 'text-gray-900'}`}>{fmt(inv.totalAmountCents)}</span>
              </div>
            </div>

            {inv.notes && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700">{inv.notes}</p>
              </div>
            )}

            {/* Payment confirmed badge (paid) */}
            {isPaid && (
              <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-brand-200 flex items-center justify-center">
                    {(inv.paymentMethod || 'stripe') === 'cheque'
                      ? <Landmark className="h-4 w-4 text-brand-600" />
                      : <CreditCard className="h-4 w-4 text-brand-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Payment received {(inv.paymentMethod || 'stripe') === 'cheque' ? '(cheque)' : ''}
                    </p>
                    <p className="text-xs text-gray-500">{inv.paidAt ? format(new Date(inv.paidAt), 'MMMM d, yyyy') : ''}</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-brand-500" />
              </div>
            )}

            {/* Cheque payment status panel (unpaid cheque invoices) */}
            {!isPaid && (inv.paymentMethod || 'stripe') === 'cheque' && (() => {
              const cheque = inv.chequePaymentId && typeof inv.chequePaymentId === 'object'
                ? inv.chequePaymentId as ChequePayment : null;
              return (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-amber-600" />
                    <p className="font-semibold text-gray-900 text-sm">Payment by Cheque</p>
                  </div>
                  {cheque ? (
                    <>
                      {/* Cheque status timeline */}
                      <div className="flex items-center gap-1 text-xs">
                        {(['received', 'deposited', 'cleared'] as const).map((step, i) => {
                          const isCurrent = cheque.status === step;
                          const isPast = ['received', 'deposited', 'cleared'].indexOf(cheque.status) >= i && cheque.status !== ChequeStatus.Bounced;
                          return (
                            <div key={step} className="flex items-center gap-1">
                              {i > 0 && <div className={`w-6 h-0.5 ${isPast ? 'bg-brand-400' : 'bg-gray-200'}`} />}
                              <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                                isCurrent ? 'bg-brand-100 text-brand-700' : isPast ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'
                              }`}>{step}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Cheque #{cheque.chequeNumber} &middot; {cheque.bankName}</p>
                        {cheque.status === ChequeStatus.Deposited && (
                          <p className="text-amber-700">Deposited — awaiting clearance (3–5 business days)</p>
                        )}
                      </div>
                      {cheque.status === ChequeStatus.Bounced && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                          <p className="text-sm font-semibold text-red-700">Cheque Returned</p>
                          {cheque.bounceReason && <p className="text-xs text-red-600 mt-0.5">{cheque.bounceReason}</p>}
                          <p className="text-xs text-red-600 mt-1">Please contact us at (508) 333-1838 to arrange payment.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Please make your cheque payable to:</p>
                      <div className="rounded-lg bg-white border border-amber-200 p-3 font-mono text-sm">
                        <p className="font-bold">Honor Cleaning Co.</p>
                        <p>738 Main St</p>
                        <p>Waltham, MA 02451</p>
                      </div>
                      <p className="text-xs text-gray-500">Include invoice <strong>{inv.invoiceNumber}</strong> in the memo line. We will notify you when the cheque is received and processed.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Due date (unpaid) */}
            {!isPaid && inv.dueDate && (
              <p className="text-sm text-gray-500">
                <strong>Due Date:</strong> {format(new Date(inv.dueDate), 'MMMM d, yyyy')}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {inv.status === InvoiceStatus.Sent && !isOverdue && (inv.paymentMethod || 'stripe') !== 'cheque' && (
                <button onClick={() => handleInitiatePayment(inv)} disabled={paying} className="btn-primary flex-1 !py-3">
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <><CreditCard className="h-4 w-4 mr-2" /> Pay {fmt(inv.totalAmountCents)}</>
                  )}
                </button>
              )}
              {inv.pdfUrl && (
                <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary flex-1 !py-3 text-center">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stripe Payment Modal */}
        <StripePaymentModal
          open={!!payModal && !!clientSecret}
          clientSecret={clientSecret}
          amountCents={payModal?.totalAmountCents || 0}
          label={payModal?.invoiceNumber || ''}
          lineItems={payModal?.lineItems}
          onSuccess={handlePaymentSuccess}
          onCancel={() => { setPayModal(null); setClientSecret(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">View and pay your invoices</p>
        </div>
        <Link href="/dashboard" className="btn-secondary !py-2 text-sm">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
        </Link>
      </div>

      {/* Unpaid Invoices */}
      {unpaid.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            Awaiting Payment ({unpaid.length})
          </h2>
          <div className="grid gap-3">
            {unpaid.map((inv) => (
              <button key={inv._id} onClick={() => setSelectedInvoice(inv)} className="card flex items-center justify-between text-left hover:shadow-sm transition-shadow w-full">
                <div>
                  <p className="font-semibold text-gray-900"><CopyableCode code={inv.invoiceNumber} /></p>
                  <p className="text-sm text-gray-500">{format(new Date(inv.createdAt), 'MMM d, yyyy')} &bull; Due {inv.dueDate ? format(new Date(inv.dueDate), 'MMM d') : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${(inv.totalAmountCents / 100).toFixed(2)}</p>
                  {(inv.paymentMethod || 'stripe') === 'cheque' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium"><Landmark className="h-3 w-3" /> Cheque</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Pay now</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Overdue Invoices */}
      {overdue.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            Overdue ({overdue.length})
          </h2>
          <div className="grid gap-3">
            {overdue.map((inv) => (
              <button key={inv._id} onClick={() => setSelectedInvoice(inv)} className="card flex items-center justify-between text-left hover:shadow-sm transition-shadow w-full border-red-200">
                <div>
                  <p className="font-semibold text-gray-900"><CopyableCode code={inv.invoiceNumber} /></p>
                  <p className="text-sm text-gray-500">{format(new Date(inv.createdAt), 'MMM d, yyyy')} &bull; Was due {inv.dueDate ? format(new Date(inv.dueDate), 'MMM d') : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${(inv.totalAmountCents / 100).toFixed(2)}</p>
                  <span className="text-xs text-red-600 font-medium">Overdue</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Paid Invoices */}
      {paid.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            Paid ({paid.length})
          </h2>
          <div className="grid gap-3">
            {paid.map((inv) => (
              <button key={inv._id} onClick={() => setSelectedInvoice(inv)} className="card flex items-center justify-between text-left hover:shadow-sm transition-shadow w-full">
                <div>
                  <p className="font-semibold text-gray-900"><CopyableCode code={inv.invoiceNumber} /></p>
                  <p className="text-sm text-gray-500">{format(new Date(inv.createdAt), 'MMM d, yyyy')} {inv.paidAt ? `\u2022 Paid ${format(new Date(inv.paidAt), 'MMM d')}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${(inv.totalAmountCents / 100).toFixed(2)}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="h-3 w-3" /> Paid</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Other */}
      {other.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Other</h2>
          <div className="grid gap-3">
            {other.map((inv) => {
              const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
              return (
                <button key={inv._id} onClick={() => setSelectedInvoice(inv)} className="card flex items-center justify-between text-left hover:shadow-sm transition-shadow w-full">
                  <div>
                    <p className="font-semibold text-gray-900"><CopyableCode code={inv.invoiceNumber} /></p>
                    <p className="text-sm text-gray-500">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${(inv.totalAmountCents / 100).toFixed(2)}</p>
                    <span className={`text-xs font-medium ${sc.color}`}>{sc.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {invoices.length === 0 && (
        <div className="card text-center py-16">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No invoices yet</h3>
          <p className="text-sm text-gray-500 mt-1">Invoices will appear here after your cleaning is completed.</p>
        </div>
      )}

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        open={!!payModal && !!clientSecret}
        clientSecret={clientSecret}
        amountCents={payModal?.totalAmountCents || 0}
        label={payModal?.invoiceNumber || ''}
        lineItems={payModal?.lineItems}
        onSuccess={handlePaymentSuccess}
        onCancel={() => { setPayModal(null); setClientSecret(null); }}
      />
    </div>
  );
}
