'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Receipt,
  ArrowLeft,
} from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
);

interface StripePaymentModalProps {
  open: boolean;
  clientSecret: string | null;
  amountCents: number;
  label: string;
  lineItems?: { description: string; quantity: number; amountCents: number }[];
  onSuccess: () => void;
  onCancel: () => void;
}

type PaymentStep = 'review' | 'pay' | 'success';

function ReviewStep({
  amountCents,
  label,
  lineItems,
  onContinue,
}: {
  amountCents: number;
  label: string;
  lineItems?: { description: string; quantity: number; amountCents: number }[];
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Amount hero */}
      <div className="text-center pt-2 pb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 mb-4">
          <Receipt className="h-7 w-7 text-brand-600" />
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-bold text-gray-900 mt-1">
          ${(amountCents / 100).toFixed(2)}
        </p>
      </div>

      {/* Line items */}
      {lineItems && lineItems.length > 0 && (
        <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 mb-6">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-gray-800 truncate">{item.description}</span>
                {item.quantity > 1 && (
                  <span className="shrink-0 text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                    x{item.quantity}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 shrink-0 ml-4">
                ${(item.amountCents / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={onContinue}
          className="btn-primary w-full !py-3.5 !text-base !rounded-xl"
        >
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="h-4.5 w-4.5" />
            Continue to Payment
          </span>
        </button>

        <p className="text-center text-xs text-gray-400">
          You&apos;ll enter your payment details next
        </p>
      </div>
    </div>
  );
}

function PayStep({
  amountCents,
  label,
  onSuccess,
  onBack,
}: {
  amountCents: number;
  label: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/invoices?payment=success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.');
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-sm font-bold text-gray-900">
            ${(amountCents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="flex-1">
        {!ready && (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="flex gap-3">
              <div className="h-12 bg-gray-100 rounded-xl flex-1" />
              <div className="h-12 bg-gray-100 rounded-xl flex-1" />
            </div>
          </div>
        )}
        <div className={ready ? '' : 'sr-only'}>
          <PaymentElement
            options={{ layout: 'tabs' }}
            onReady={() => setReady(true)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 mt-4">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Payment failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pay button */}
      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={!stripe || !ready || loading}
          className="btn-primary w-full !py-3.5 !text-base !rounded-xl disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Pay ${(amountCents / 100).toFixed(2)}
            </span>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 pt-1">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            256-bit encryption
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <CreditCard className="h-3.5 w-3.5" />
            Powered by Stripe
          </span>
        </div>
      </div>
    </form>
  );
}

function SuccessStep({
  amountCents,
  label,
  onDone,
}: {
  amountCents: number;
  label: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      {/* Animated check */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center animate-bounce-gentle">
          <CheckCircle2 className="h-10 w-10 text-brand-600" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-warm-400 animate-pulse-soft" />
      </div>

      <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
      <p className="text-gray-500 mt-1.5 text-sm">
        ${(amountCents / 100).toFixed(2)} paid for {label}
      </p>

      <div className="w-full mt-8 p-4 rounded-xl bg-brand-50/50 border border-brand-100">
        <p className="text-sm text-brand-800">
          A receipt has been sent to your email.
        </p>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="btn-primary w-full !py-3 !rounded-xl mt-6"
      >
        Done
      </button>
    </div>
  );
}

export default function StripePaymentModal({
  open,
  clientSecret,
  amountCents,
  label,
  lineItems,
  onSuccess,
  onCancel,
}: StripePaymentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<PaymentStep>('review');
  const [closing, setClosing] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (open) {
      setStep('review');
      setClosing(false);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key — disabled during processing success
  useEffect(() => {
    if (!open || step === 'success') return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, step]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onCancel, 200);
  }, [onCancel]);

  const handlePaymentSuccess = useCallback(() => {
    setStep('success');
  }, []);

  const handleDone = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  if (!open || !clientSecret) return null;

  // Step indicator dots
  const steps: PaymentStep[] = ['review', 'pay', 'success'];
  const currentIdx = steps.indexOf(step);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={(e) => {
        if (e.target === overlayRef.current && step !== 'success') handleClose();
      }}
    >
      <div
        className={`w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-[92vh] flex flex-col transition-transform duration-200 ${closing ? 'translate-y-4 sm:scale-95' : 'animate-slide-up'}`}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 sm:pt-5 pb-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {step === 'review' && 'Review Order'}
            {step === 'pay' && 'Payment Details'}
            {step === 'success' && 'All Done!'}
          </h3>
          {step !== 'success' && (
            <button
              onClick={handleClose}
              className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 px-6 pt-4 pb-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= currentIdx
                  ? 'bg-brand-500 w-8'
                  : 'bg-gray-200 w-5'
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'review' && (
            <ReviewStep
              amountCents={amountCents}
              label={label}
              lineItems={lineItems}
              onContinue={() => setStep('pay')}
            />
          )}

          {step === 'pay' && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669',
                    borderRadius: '10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                  },
                  rules: {
                    '.Tab': {
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      boxShadow: 'none',
                    },
                    '.Tab--selected': {
                      borderColor: '#059669',
                      boxShadow: '0 0 0 1px #059669',
                    },
                    '.Input': {
                      borderRadius: '10px',
                      padding: '12px',
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                    },
                    '.Input:focus': {
                      borderColor: '#059669',
                      boxShadow: '0 0 0 1px #059669',
                    },
                    '.Label': {
                      fontWeight: '500',
                      fontSize: '13px',
                    },
                  },
                },
              }}
            >
              <PayStep
                amountCents={amountCents}
                label={label}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep('review')}
              />
            </Elements>
          )}

          {step === 'success' && (
            <SuccessStep
              amountCents={amountCents}
              label={label}
              onDone={handleDone}
            />
          )}
        </div>
      </div>
    </div>
  );
}
