'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ServiceType, SubscriptionFrequency } from '@/types';
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  Repeat,
  SprayCan,
  Clock,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  Star,
  FileText,
  Navigation,
  SunMedium,
  Sunset,
  CalendarClock,
  Percent,
  Bath,
  Ruler,
  Minus,
  Plus,
  Briefcase,
  Monitor,
  Layers,
  Store,
  Stethoscope,
  Warehouse,
  HardHat,
  DoorOpen,
  Coffee,
  Users,
  AlertCircle,
  Pencil,
  Home,
  BedDouble,
  type LucideIcon,
} from 'lucide-react';
import { CalendarPicker, FormGroup } from '@/components/FormFields';

/* ── Compact counter card for facility details ── */
function CounterCard({
  label, icon: Icon, value, min, max, step: inc, hint, onChange,
}: {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const active = value > min;
  return (
    <div className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
      active
        ? 'border-brand-200 bg-brand-50/30 shadow-sm'
        : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
    }`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          active ? 'bg-brand-100' : 'bg-gray-100'
        }`}>
          <Icon className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
          {hint && <p className="text-[10px] text-gray-400 leading-tight">{hint}</p>}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - inc))}
          disabled={value <= min}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-20 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all active:scale-95"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className={`w-14 text-center text-xl font-bold tabular-nums bg-transparent border-0 focus:outline-none focus:ring-0 p-0 ${
            active ? 'text-brand-700' : 'text-gray-400'
          } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + inc))}
          disabled={value >= max}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-20 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Isolated text inputs — only the local component re-renders on keystroke ── */

function LocalInput({
  externalValue,
  onCommit,
  transform,
  className,
  ...props
}: {
  externalValue: string;
  onCommit: (v: string) => void;
  transform?: (v: string) => string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'>) {
  const [value, setValue] = useState(externalValue);

  useEffect(() => { setValue(externalValue); }, [externalValue]);

  return (
    <input
      {...props}
      className={className}
      value={value}
      onChange={(e) => {
        const v = transform ? transform(e.target.value) : e.target.value;
        setValue(v);
      }}
      onBlur={() => onCommit(value)}
    />
  );
}

function LocalNumberInput({
  externalValue,
  onCommit,
  className,
  ...props
}: {
  externalValue: number | undefined;
  onCommit: (v: number | undefined) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'>) {
  const [value, setValue] = useState(externalValue != null ? String(externalValue) : '');

  useEffect(() => { setValue(externalValue != null ? String(externalValue) : ''); }, [externalValue]);

  return (
    <input
      {...props}
      className={className}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const n = parseInt(value);
        onCommit(isNaN(n) ? undefined : n);
      }}
    />
  );
}

function LocalTextarea({
  externalValue,
  onCommit,
  maxLength,
  className,
  ...props
}: {
  externalValue: string;
  onCommit: (v: string) => void;
  maxLength?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur' | 'maxLength'>) {
  const [value, setValue] = useState(externalValue);

  useEffect(() => { setValue(externalValue); }, [externalValue]);

  return (
    <>
      <textarea
        {...props}
        className={className}
        value={value}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onCommit(value)}
      />
      {maxLength != null && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${value.length > maxLength * 0.8 ? 'text-red-500' : 'text-gray-400'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </>
  );
}

/* ── Quick-size presets per facility type ── */
const SIZE_PRESETS: Record<string, { label: string; desc: string; sqft: number; values: Record<string, number> }[]> = {
  house: [
    { label: 'Small', desc: '1–2 bed', sqft: 800, values: { bedrooms: 1, bathrooms: 1 } },
    { label: 'Medium', desc: '3–4 bed', sqft: 1800, values: { bedrooms: 3, bathrooms: 2 } },
    { label: 'Large', desc: '5+ bed', sqft: 3500, values: { bedrooms: 5, bathrooms: 3 } },
  ],
  apartment: [
    { label: 'Studio', desc: 'Studio / 1-bed', sqft: 500, values: { bedrooms: 1, bathrooms: 1 } },
    { label: 'Medium', desc: '2-bed unit', sqft: 1000, values: { bedrooms: 2, bathrooms: 1 } },
    { label: 'Large', desc: '3-bed unit', sqft: 1600, values: { bedrooms: 3, bathrooms: 2 } },
  ],
  office: [
    { label: 'Small', desc: 'Startup / Suite', sqft: 1500, values: { floors: 1, workstations: 10, restrooms: 1, privateOffices: 1, conferenceRooms: 1, kitchenettes: 1 } },
    { label: 'Medium', desc: 'Mid-size company', sqft: 5000, values: { floors: 1, workstations: 30, restrooms: 3, privateOffices: 4, conferenceRooms: 2, kitchenettes: 1 } },
    { label: 'Large', desc: 'Corporate floor+', sqft: 15000, values: { floors: 3, workstations: 80, restrooms: 6, privateOffices: 10, conferenceRooms: 4, kitchenettes: 2 } },
  ],
  retail: [
    { label: 'Small', desc: 'Boutique / Kiosk', sqft: 800, values: { floors: 1, workstations: 2, restrooms: 1, kitchenettes: 0 } },
    { label: 'Medium', desc: 'Storefront', sqft: 3000, values: { floors: 1, workstations: 5, restrooms: 2, kitchenettes: 1 } },
    { label: 'Large', desc: 'Department / Showroom', sqft: 10000, values: { floors: 2, workstations: 10, restrooms: 4, kitchenettes: 1 } },
  ],
  medical: [
    { label: 'Small', desc: 'Solo practice', sqft: 1200, values: { floors: 1, restrooms: 1, conferenceRooms: 2, kitchenettes: 1 } },
    { label: 'Medium', desc: 'Group practice', sqft: 4000, values: { floors: 1, restrooms: 3, conferenceRooms: 6, kitchenettes: 2 } },
    { label: 'Large', desc: 'Multi-specialty clinic', sqft: 12000, values: { floors: 2, restrooms: 6, conferenceRooms: 15, kitchenettes: 3 } },
  ],
  industrial: [
    { label: 'Small', desc: 'Workshop / Unit', sqft: 5000, values: { floors: 1, workstations: 2, restrooms: 1 } },
    { label: 'Medium', desc: 'Warehouse', sqft: 20000, values: { floors: 1, workstations: 4, restrooms: 3 } },
    { label: 'Large', desc: 'Distribution center', sqft: 50000, values: { floors: 2, workstations: 8, restrooms: 6 } },
  ],
};

const STEPS = ['Service', 'Details', 'When & Where', 'Review'];

const RESIDENTIAL_TYPES = [
  { value: 'house', label: 'House / Home', desc: 'Single-family homes, townhouses', icon: Home, color: 'bg-emerald-600' },
  { value: 'apartment', label: 'Apartment / Condo', desc: 'Studios, units, condos, lofts', icon: Building2, color: 'bg-teal-600' },
];

const COMMERCIAL_TYPES = [
  { value: 'office', label: 'Office', desc: 'Corporate, coworking, shared office', icon: Briefcase, color: 'bg-brand-600' },
  { value: 'retail', label: 'Retail / Storefront', desc: 'Shops, boutiques, showrooms', icon: Store, color: 'bg-ocean-600' },
  { value: 'medical', label: 'Medical / Clinic', desc: 'Healthcare, dental, wellness', icon: Stethoscope, color: 'bg-warm-500' },
  { value: 'industrial', label: 'Industrial / Warehouse', desc: 'Warehouses, factories, depots', icon: Warehouse, color: 'bg-violet-600' },
];

const FACILITY_TYPES = [...RESIDENTIAL_TYPES, ...COMMERCIAL_TYPES];

const RESIDENTIAL_SERVICE_LEVELS = [
  { value: 'standard', label: 'Standard Clean', desc: 'Regular home maintenance', icon: Sparkles, color: 'bg-emerald-600' },
  { value: 'deep', label: 'Deep Clean', desc: 'Top-to-bottom intensive clean', icon: SprayCan, color: 'bg-teal-600', popular: true },
  { value: 'moveIn', label: 'Move-In Clean', desc: 'Fresh start for your new home', icon: DoorOpen, color: 'bg-warm-500' },
  { value: 'moveOut', label: 'Move-Out Clean', desc: 'Leave it spotless for the next tenant', icon: Layers, color: 'bg-violet-600' },
];

const COMMERCIAL_SERVICE_LEVELS = [
  { value: 'standard', label: 'Standard', desc: 'Regular maintenance clean', icon: Briefcase, color: 'bg-brand-600' },
  { value: 'deep', label: 'Deep Clean', desc: 'Intensive top-to-bottom scrub', icon: SprayCan, color: 'bg-ocean-600', popular: true },
  { value: 'postConstruction', label: 'Post-Construction', desc: 'Debris removal & polish', icon: HardHat, color: 'bg-warm-500' },
];

const SERVICE_LEVELS = COMMERCIAL_SERVICE_LEVELS;

const FREQUENCY_OPTIONS = [
  {
    value: SubscriptionFrequency.Weekly,
    label: 'Weekly',
    desc: 'Every week, same day',
    savings: 'Up to 20%',
  },
  {
    value: SubscriptionFrequency.Biweekly,
    label: 'Bi-weekly',
    desc: 'Every other week',
    savings: 'Up to 15%',
  },
  {
    value: SubscriptionFrequency.Monthly,
    label: 'Monthly',
    desc: 'Once a month',
    savings: 'Up to 10%',
  },
];

const PREFERRED_DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const TIME_SLOTS = [
  { value: '06:00', label: '6 AM', period: 'morning' },
  { value: '07:00', label: '7 AM', period: 'morning' },
  { value: '08:00', label: '8 AM', period: 'morning' },
  { value: '09:00', label: '9 AM', period: 'morning' },
  { value: '10:00', label: '10 AM', period: 'morning' },
  { value: '11:00', label: '11 AM', period: 'morning' },
  { value: '12:00', label: '12 PM', period: 'afternoon' },
  { value: '13:00', label: '1 PM', period: 'afternoon' },
  { value: '14:00', label: '2 PM', period: 'afternoon' },
  { value: '15:00', label: '3 PM', period: 'afternoon' },
  { value: '16:00', label: '4 PM', period: 'afternoon' },
  { value: '17:00', label: '5 PM', period: 'evening' },
  { value: '18:00', label: '6 PM', period: 'evening' },
  { value: '19:00', label: '7 PM', period: 'evening' },
  { value: '20:00', label: '8 PM', period: 'evening' },
];

const BOOKING_STORAGE_KEY = 'bookingDraft';

function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(step: number, form: any) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify({ step, form }));
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(BOOKING_STORAGE_KEY);
}

/* ── Time slot button (shared between one-off and recurring) ── */
function TimeSlotGrid({ scheduledTime, onChange, accentClass = 'brand' }: {
  scheduledTime: string;
  onChange: (time: string) => void;
  accentClass?: 'brand' | 'violet';
}) {
  const activeClass = accentClass === 'violet'
    ? 'bg-violet-600 text-white scale-[1.03]'
    : 'bg-brand-600 text-white scale-[1.03]';
  const hoverClass = accentClass === 'violet'
    ? 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-700 border border-gray-200 hover:border-violet-200'
    : 'bg-white text-gray-600 hover:bg-brand-50 hover:text-brand-700 border border-gray-200 hover:border-brand-200';

  return (
    <div className="space-y-3">
      {[
        { period: 'morning', icon: SunMedium, label: 'Morning', iconColor: 'text-warm-500' },
        { period: 'afternoon', icon: Sunset, label: 'Afternoon', iconColor: 'text-ocean-500' },
        { period: 'evening', icon: Clock, label: 'Evening', iconColor: 'text-violet-500' },
      ].map(({ period, icon: PIcon, label, iconColor }) => {
        const slots = TIME_SLOTS.filter(s => s.period === period);
        return (
          <div key={period}>
            <div className="flex items-center gap-2 mb-2">
              <PIcon className={`h-3.5 w-3.5 ${iconColor}`} />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => onChange(slot.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    scheduledTime === slot.value ? activeClass : hoverClass
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const draft = loadDraft();
  const formRef = useRef<HTMLDivElement>(null);

  const [step, setStepRaw] = useState(draft?.step || 0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const [form, setFormRaw] = useState({
    facilityType: '' as 'house' | 'apartment' | 'office' | 'retail' | 'medical' | 'industrial' | '',
    serviceLevel: '' as 'standard' | 'deep' | 'moveIn' | 'moveOut' | 'postConstruction' | '',
    isRecurring: false,
    scheduledDate: '',
    scheduledTime: '18:00',
    address: { street: '', city: '', state: 'MA', zip: '' },
    notes: '',
    marketingConsent: false,
    propertyDetails: {
      // Residential
      bedrooms: 2,
      bathrooms: 1,
      // Commercial
      floors: 1,
      workstations: 10,
      restrooms: 2,
      squareFootage: undefined as number | undefined,
      privateOffices: 0,
      conferenceRooms: 0,
      kitchenettes: 0,
      condition: 'normal' as 'normal' | 'heavy' | 'extreme',
    },
    frequency: '' as SubscriptionFrequency,
    preferredDay: '',
    startDate: '',
    ...draft?.form,
  });

  type FormState = typeof form;

  const setStep = (s: number | ((prev: number) => number)) => {
    setStepRaw((prev: number) => {
      const next = typeof s === 'function' ? s(prev) : s;
      setDirection(next > prev ? 'forward' : 'back');
      saveDraft(next, form);
      return next;
    });
  };

  const setForm = (f: FormState | ((prev: FormState) => FormState)) => {
    setFormRaw((prev: FormState) => {
      const next = typeof f === 'function' ? f(prev) : f;
      saveDraft(step, next);
      return next;
    });
  };

  // Scroll to top of form when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const isRecurring = form.isRecurring;

  const facilityIsResidential = form.facilityType === 'house' || form.facilityType === 'apartment';

  const resolvedServiceType = (): ServiceType => {
    if (facilityIsResidential) {
      switch (form.serviceLevel) {
        case 'standard': return ServiceType.Standard;
        case 'deep': return ServiceType.Deep;
        case 'moveIn': return ServiceType.MoveIn;
        case 'moveOut': return ServiceType.MoveOut;
        default: return ServiceType.Standard;
      }
    }
    switch (form.facilityType) {
      case 'office': return ServiceType.Office;
      case 'retail': return ServiceType.Retail;
      case 'medical': return ServiceType.Medical;
      case 'industrial': return ServiceType.Industrial;
      default: return ServiceType.Office;
    }
  };

  const activeServiceLevels = facilityIsResidential ? RESIDENTIAL_SERVICE_LEVELS : COMMERCIAL_SERVICE_LEVELS;

  const selectedFacility = FACILITY_TYPES.find((f) => f.value === form.facilityType);
  const selectedLevel = SERVICE_LEVELS.find((l) => l.value === form.serviceLevel);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to complete your booking');
      router.push(`/login?redirect=/booking`);
      return;
    }

    setLoading(true);
    try {
      const propertyDetails = facilityIsResidential
        ? {
            bedrooms: form.propertyDetails.bedrooms,
            bathrooms: form.propertyDetails.bathrooms,
            squareFootage: form.propertyDetails.squareFootage,
            condition: form.propertyDetails.condition,
          }
        : {
            floors: form.propertyDetails.floors,
            workstations: form.propertyDetails.workstations || undefined,
            restrooms: form.propertyDetails.restrooms,
            squareFootage: form.propertyDetails.squareFootage,
            condition: form.propertyDetails.condition,
          };

      await api.post('/bookings', {
        serviceType: resolvedServiceType(),
        scheduledDate: isRecurring ? form.startDate : form.scheduledDate,
        scheduledTime: form.scheduledTime,
        address: form.address,
        propertyDetails,
        notes: form.notes,
        marketingConsent: form.marketingConsent,
      });
      toast.success('Request received! We\'ll send your custom quote within 24 hours.');
      clearDraft();
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.facilityType && !!form.serviceLevel;
      case 1: return facilityIsResidential
        ? form.propertyDetails.bedrooms >= 1
        : form.propertyDetails.floors >= 1;
      case 2: {
        const hasAddress = !!form.address.street && !!form.address.city && !!form.address.zip;
        if (isRecurring) {
          return !!form.frequency && !!form.preferredDay && !!form.scheduledTime && !!form.startDate && hasAddress;
        }
        return !!form.scheduledDate && !!form.scheduledTime && hasAddress;
      }
      case 3: return true;
      default: return false;
    }
  };

  const selectedFrequency = FREQUENCY_OPTIONS.find((f) => f.value === form.frequency);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const slot = TIME_SLOTS.find(t => t.value === timeStr);
    return slot?.label || timeStr;
  };

  // Step completion percentage for progress bar
  const stepProgress = () => {
    return ((step) / (STEPS.length - 1)) * 100;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6" ref={formRef}>

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Free · No obligation · Custom quote in 24hrs
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-display">
              Get Your{' '}
              <span className="text-brand-600">Free Quote</span>
            </h1>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Tell us about your facility and we&apos;ll send a custom cleaning proposal
            </p>
          </div>

          {/* ── Stepper ── */}
          <div className="mb-8 sm:mb-10">
            {/* Mobile: compact progress bar */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-brand-600">Step {step + 1} of {STEPS.length}</span>
                <span className="text-sm font-medium text-gray-500">{STEPS[step]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
                  style={{ width: `${stepProgress()}%` }}
                />
              </div>
            </div>

            {/* Desktop: full stepper */}
            <div className="hidden sm:flex items-center justify-between max-w-md mx-auto">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => { if (i < step) setStep(i); }}
                      disabled={i > step}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        i < step
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 cursor-pointer hover:bg-brand-600'
                          : i === step
                            ? 'bg-brand-600 text-white scale-110'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                    </button>
                    <span className={`mt-2 text-xs font-medium transition-colors ${
                      i <= step ? 'text-brand-600' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 mt-[-0.25rem]">
                      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-brand-500 transition-all duration-500 ${
                            i < step ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Main Form Panel ── */}
            <div className="lg:col-span-2">
              <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 transition-all duration-300 ${
                direction === 'forward' ? 'animate-slide-up' : 'animate-fade-in'
              }`} key={step}>

                {/* Step 0: Service Selection */}
                {step === 0 && (
                  <div className="space-y-8">
                    {/* Residential Types */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">What needs cleaning?</h2>
                      <p className="text-sm text-gray-500 mb-4">Select your space type</p>

                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Home className="h-3 w-3" /> Home & Residential
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {RESIDENTIAL_TYPES.map((ft) => (
                          <button
                            key={ft.value}
                            onClick={() => setForm({ ...form, facilityType: ft.value as typeof form.facilityType, serviceLevel: '' })}
                            className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 group ${
                              form.facilityType === ft.value
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl ${ft.color} flex items-center justify-center group-hover:scale-105 transition-transform mb-3`}>
                              <ft.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-bold text-gray-900">{ft.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ft.desc}</p>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Briefcase className="h-3 w-3" /> Commercial & Business
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {COMMERCIAL_TYPES.map((ft) => (
                          <button
                            key={ft.value}
                            onClick={() => setForm({ ...form, facilityType: ft.value as typeof form.facilityType, serviceLevel: '' })}
                            className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 group ${
                              form.facilityType === ft.value
                                ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl ${ft.color} flex items-center justify-center group-hover:scale-105 transition-transform mb-3`}>
                              <ft.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-bold text-gray-900">{ft.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ft.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Service Level */}
                    {form.facilityType && (
                      <div className="animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">What type of clean?</h3>
                        <p className="text-sm text-gray-500 mb-4">Choose the level of service</p>
                        <div className={`grid gap-3 ${facilityIsResidential ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                          {activeServiceLevels.map((lvl) => (
                            <button
                              key={lvl.value}
                              onClick={() => setForm({ ...form, serviceLevel: lvl.value as typeof form.serviceLevel })}
                              className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 group ${
                                form.serviceLevel === lvl.value
                                  ? facilityIsResidential
                                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                                    : 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                              }`}
                            >
                              {lvl.popular && (
                                <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-warm-100 text-warm-700 px-2 py-0.5 rounded-full">POPULAR</span>
                              )}
                              <div className={`w-10 h-10 rounded-xl ${lvl.color} flex items-center justify-center group-hover:scale-105 transition-transform mb-2`}>
                                <lvl.icon className="h-5 w-5 text-white" />
                              </div>
                              <p className="font-bold text-gray-900 text-sm">{lvl.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{lvl.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Frequency */}
                    {form.serviceLevel && (
                      <div className="animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">How often?</h3>
                        <p className="text-sm text-gray-500 mb-4">One-time service or set up a maintenance contract</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setForm({ ...form, isRecurring: false, frequency: '' as SubscriptionFrequency, preferredDay: '', startDate: '' })}
                            className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                              !form.isRecurring
                                ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <Calendar className="h-6 w-6 text-brand-500 mb-2" />
                            <p className="font-bold text-gray-900">One-Time</p>
                            <p className="text-xs text-gray-500 mt-0.5">Single service visit</p>
                          </button>
                          <button
                            onClick={() => setForm({ ...form, isRecurring: true })}
                            className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                              form.isRecurring
                                ? 'border-violet-500 bg-violet-50/50 shadow-md shadow-violet-500/10'
                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <Repeat className="h-6 w-6 text-violet-500 mb-2" />
                            <p className="font-bold text-gray-900">Recurring</p>
                            <p className="text-xs text-gray-500 mt-0.5">Save up to 20%</p>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Facility Details */}
                {step === 1 && (() => {
                  const presets = form.facilityType ? SIZE_PRESETS[form.facilityType] || [] : [];
                  const facilityLabels: Record<string, { title: string; subtitle: string }> = {
                    house: { title: 'Tell Us About Your Home', subtitle: 'Help us plan the right team and supplies for your space.' },
                    apartment: { title: 'Tell Us About Your Apartment', subtitle: 'Help us plan the right team and supplies for your unit.' },
                    office: { title: 'Tell Us About Your Office', subtitle: 'Help us understand your workspace so we can tailor an accurate cleaning plan.' },
                    retail: { title: 'Tell Us About Your Store', subtitle: 'Describe your retail space so we can plan the right crew and equipment.' },
                    medical: { title: 'Tell Us About Your Practice', subtitle: 'We need these details to ensure proper sanitization protocols and compliance.' },
                    industrial: { title: 'Tell Us About Your Facility', subtitle: 'Describe your space so we can bring the right heavy-duty equipment.' },
                  };
                  const labels = facilityLabels[form.facilityType] || facilityLabels.office;

                  const applyPreset = (preset: typeof presets[0]) => {
                    setForm({
                      ...form,
                      propertyDetails: {
                        ...form.propertyDetails,
                        ...preset.values,
                        squareFootage: preset.sqft,
                      },
                    });
                  };

                  return (
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {selectedFacility && (
                        <div className={`w-10 h-10 rounded-xl ${selectedFacility.color} flex items-center justify-center`}>
                          <selectedFacility.icon className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{labels.title}</h2>
                        <p className="text-sm text-gray-500">{labels.subtitle}</p>
                      </div>
                    </div>

                    <div className="space-y-7 mt-6">
                      {/* Quick-start presets */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Start — Select a Size</p>
                        <div className="grid grid-cols-3 gap-3">
                          {presets.map((preset) => {
                            const isMatch = form.propertyDetails.squareFootage === preset.sqft;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className={`rounded-2xl border-2 p-4 text-center transition-all duration-200 group hover:-translate-y-0.5 ${
                                  isMatch
                                    ? 'border-brand-500 bg-brand-50/60 shadow-md shadow-brand-500/10'
                                    : 'border-gray-100 hover:border-brand-200 hover:shadow-sm bg-white'
                                }`}
                              >
                                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 transition-colors ${
                                  isMatch ? 'bg-brand-500 shadow-sm' : 'bg-gray-100 group-hover:bg-brand-50'
                                }`}>
                                  <Ruler className={`h-5 w-5 ${isMatch ? 'text-white' : 'text-gray-400 group-hover:text-brand-500'}`} />
                                </div>
                                <p className={`font-bold text-sm ${isMatch ? 'text-brand-700' : 'text-gray-900'}`}>{preset.label}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{preset.desc}</p>
                                <p className={`text-xs font-semibold mt-1.5 ${isMatch ? 'text-brand-600' : 'text-gray-500'}`}>~{preset.sqft.toLocaleString()} sq ft</p>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-gray-400 text-center mt-2">Pick a preset to auto-fill, then fine-tune below</p>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">or customize</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Counter grid */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Space Layout</p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* ── Residential counters ── */}
                          {facilityIsResidential && (
                            <CounterCard
                              label="Bedrooms"
                              icon={BedDouble}
                              value={form.propertyDetails.bedrooms}
                              min={1}
                              max={20}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, bedrooms: v } })}
                            />
                          )}
                          {facilityIsResidential && (
                            <CounterCard
                              label="Bathrooms"
                              icon={Bath}
                              value={form.propertyDetails.bathrooms}
                              min={1}
                              max={15}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, bathrooms: v } })}
                            />
                          )}
                          {/* ── Commercial counters ── */}
                          {!facilityIsResidential && (
                            <CounterCard
                              label="Floors"
                              icon={Layers}
                              value={form.propertyDetails.floors}
                              min={1}
                              max={50}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, floors: v } })}
                            />
                          )}
                          {!facilityIsResidential && (
                            <CounterCard
                              label="Restrooms"
                              icon={Bath}
                              value={form.propertyDetails.restrooms}
                              min={0}
                              max={50}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, restrooms: v } })}
                            />
                          )}
                          {form.facilityType === 'office' && (
                            <CounterCard
                              label="Workstations"
                              icon={Monitor}
                              value={form.propertyDetails.workstations}
                              min={0}
                              max={500}
                              step={5}
                              hint="Increments by 5"
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, workstations: v } })}
                            />
                          )}
                          {form.facilityType === 'office' && (
                            <CounterCard
                              label="Private Offices"
                              icon={DoorOpen}
                              value={form.propertyDetails.privateOffices}
                              min={0}
                              max={100}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, privateOffices: v } })}
                            />
                          )}
                          {form.facilityType === 'office' && (
                            <CounterCard
                              label="Conference Rooms"
                              icon={Building2}
                              value={form.propertyDetails.conferenceRooms}
                              min={0}
                              max={50}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, conferenceRooms: v } })}
                            />
                          )}
                          {(form.facilityType === 'office' || form.facilityType === 'retail') && (
                            <CounterCard
                              label={form.facilityType === 'retail' ? 'Back Rooms' : 'Break Rooms'}
                              icon={Coffee}
                              value={form.propertyDetails.kitchenettes}
                              min={0}
                              max={20}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, kitchenettes: v } })}
                            />
                          )}
                          {form.facilityType === 'medical' && (
                            <CounterCard
                              label="Exam Rooms"
                              icon={Stethoscope}
                              value={form.propertyDetails.conferenceRooms}
                              min={0}
                              max={50}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, conferenceRooms: v } })}
                            />
                          )}
                          {form.facilityType === 'medical' && (
                            <CounterCard
                              label="Waiting Areas"
                              icon={Users}
                              value={form.propertyDetails.kitchenettes}
                              min={0}
                              max={10}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, kitchenettes: v } })}
                            />
                          )}
                          {form.facilityType === 'retail' && (
                            <CounterCard
                              label="Display Sections"
                              icon={Store}
                              value={form.propertyDetails.workstations}
                              min={0}
                              max={100}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, workstations: v } })}
                            />
                          )}
                          {form.facilityType === 'industrial' && (
                            <CounterCard
                              label="Loading Docks"
                              icon={Warehouse}
                              value={form.propertyDetails.workstations}
                              min={0}
                              max={50}
                              step={1}
                              onChange={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, workstations: v } })}
                            />
                          )}
                        </div>
                      </div>

                      {/* Square footage */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Total Area</p>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/30 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Ruler className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700">Square Footage</span>
                          </div>
                          <LocalNumberInput
                            type="number"
                            inputMode="numeric"
                            className="input-field text-lg font-bold text-center tracking-wide"
                            externalValue={form.propertyDetails.squareFootage}
                            onCommit={(v) => setForm({ ...form, propertyDetails: { ...form.propertyDetails, squareFootage: v } })}
                            placeholder="Enter sq ft"
                            min={100}
                            max={200000}
                          />
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(form.facilityType === 'industrial'
                              ? [5000, 10000, 20000, 50000, 100000]
                              : form.facilityType === 'retail'
                              ? [500, 1000, 2000, 5000, 10000]
                              : facilityIsResidential
                              ? [500, 800, 1200, 1800, 2500]
                              : [1000, 2500, 5000, 10000, 20000]
                            ).map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setForm({ ...form, propertyDetails: { ...form.propertyDetails, squareFootage: val } })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  form.propertyDetails.squareFootage === val
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'
                                }`}
                              >
                                {val >= 1000 ? `${(val / 1000)}k` : val}
                              </button>
                            ))}
                            <span className="text-[10px] text-gray-400 self-center ml-1">sq ft</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">
                            {form.facilityType === 'industrial'
                              ? 'Include warehouse floor area and any mezzanine levels.'
                              : 'Don\'t worry if approximate — we\'ll verify during our assessment.'}
                          </p>
                        </div>
                      </div>

                      {/* Condition */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Condition</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {([
                            {
                              value: 'normal' as const,
                              icon: CheckCircle,
                              label: 'Well-Kept',
                              desc: form.facilityType === 'medical' ? 'Regular sanitization in place'
                                : form.facilityType === 'industrial' ? 'Maintained on a schedule'
                                : facilityIsResidential ? 'Tidied regularly'
                                : 'Cleaned regularly',
                              activeBorder: 'border-brand-500',
                              activeBg: 'bg-brand-50/60',
                              iconBg: 'bg-brand-100',
                              iconColor: 'text-brand-600',
                              barColor: 'bg-brand-400',
                            },
                            {
                              value: 'heavy' as const,
                              icon: AlertCircle,
                              label: 'Needs Attention',
                              desc: form.facilityType === 'medical' ? 'Overdue for deep sanitization'
                                : form.facilityType === 'industrial' ? 'Buildup of dust & grime'
                                : 'A while since last clean',
                              activeBorder: 'border-amber-500',
                              activeBg: 'bg-amber-50/60',
                              iconBg: 'bg-amber-100',
                              iconColor: 'text-amber-600',
                              barColor: 'bg-amber-400',
                            },
                            {
                              value: 'extreme' as const,
                              icon: HardHat,
                              label: 'Heavy Restoration',
                              desc: form.facilityType === 'medical' ? 'Post-renovation or new build'
                                : form.facilityType === 'industrial' ? 'Post-construction or severely neglected'
                                : 'Post-build or long-neglected',
                              activeBorder: 'border-red-500',
                              activeBg: 'bg-red-50/60',
                              iconBg: 'bg-red-100',
                              iconColor: 'text-red-600',
                              barColor: 'bg-red-400',
                            },
                          ]).map((opt) => {
                            const selected = form.propertyDetails.condition === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, propertyDetails: { ...form.propertyDetails, condition: opt.value } })}
                                className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                                  selected
                                    ? `${opt.activeBorder} ${opt.activeBg} shadow-md`
                                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                  selected ? opt.iconBg : 'bg-gray-100'
                                }`}>
                                  <opt.icon className={`h-4.5 w-4.5 ${selected ? opt.iconColor : 'text-gray-400'}`} />
                                </div>
                                <p className={`font-bold text-sm ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-300 ${selected ? opt.barColor : 'bg-gray-200'}`}
                                    style={{ width: opt.value === 'normal' ? '33%' : opt.value === 'heavy' ? '66%' : '100%' }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Contextual tip */}
                      <div className={`rounded-2xl p-4 flex items-start gap-3 ${
                        form.facilityType === 'medical'
                          ? 'bg-warm-50 border border-warm-100'
                          : facilityIsResidential
                          ? 'bg-emerald-50 border border-emerald-100'
                          : 'bg-ocean-50 border border-ocean-100'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          form.facilityType === 'medical' ? 'bg-warm-100'
                          : facilityIsResidential ? 'bg-emerald-100'
                          : 'bg-ocean-100'
                        }`}>
                          <Sparkles className={`h-4 w-4 ${
                            form.facilityType === 'medical' ? 'text-warm-600'
                            : facilityIsResidential ? 'text-emerald-600'
                            : 'text-ocean-600'
                          }`} />
                        </div>
                        <div>
                          <p className={`text-xs font-semibold mb-0.5 ${
                            form.facilityType === 'medical' ? 'text-warm-800'
                            : facilityIsResidential ? 'text-emerald-800'
                            : 'text-ocean-800'
                          }`}>
                            {form.facilityType === 'house' && 'Home Cleaning Tailored to You'}
                            {form.facilityType === 'apartment' && 'Apartment Cleaning Done Right'}
                            {form.facilityType === 'office' && 'Tailored Office Plans'}
                            {form.facilityType === 'retail' && 'Retail-Ready Every Day'}
                            {form.facilityType === 'medical' && 'Healthcare Compliance'}
                            {form.facilityType === 'industrial' && 'Industrial-Grade Equipment'}
                          </p>
                          <p className={`text-xs leading-relaxed ${
                            form.facilityType === 'medical' ? 'text-warm-700/80'
                            : facilityIsResidential ? 'text-emerald-700/80'
                            : 'text-ocean-700/80'
                          }`}>
                            {form.facilityType === 'house' && 'We bring all eco-friendly supplies and equipment. Every room gets attention — from kitchen surfaces to baseboards.'}
                            {form.facilityType === 'apartment' && 'Our team works efficiently in apartment layouts, covering every corner including appliances and common-area surfaces.'}
                            {form.facilityType === 'office' && 'We customize your checklist based on your layout — open floors, private offices, and shared spaces each get tailored attention.'}
                            {form.facilityType === 'retail' && 'Our retail service includes floor care, glass polishing, display dusting, and high-traffic entrance maintenance.'}
                            {form.facilityType === 'medical' && 'We use EPA-approved sanitization protocols and provide compliance documentation for your records.'}
                            {form.facilityType === 'industrial' && 'Our industrial team brings heavy-duty floor scrubbers, pressure washers, and debris removal equipment.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })()}

                {/* Step 2: When & Where (combined schedule + address) */}
                {step === 2 && (
                  <div className="space-y-10">
                    {/* ── Schedule Section ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-brand-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {isRecurring ? 'Set Your Schedule' : 'Pick a Date & Time'}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-5 ml-9">
                        {isRecurring
                          ? 'Tell us how often and when you\'d like us to come'
                          : 'Choose when you would like our team to arrive'}
                      </p>

                      {/* One-off scheduling */}
                      {!isRecurring && (
                        <div className="space-y-6">
                          <FormGroup label="Select a Date" icon={Calendar}>
                            <CalendarPicker
                              value={form.scheduledDate}
                              onChange={(date) => setForm({ ...form, scheduledDate: date })}
                              minDate={new Date().toISOString().split('T')[0]}
                            />
                          </FormGroup>

                          <FormGroup label="Preferred Time" icon={Clock}>
                            <TimeSlotGrid
                              scheduledTime={form.scheduledTime}
                              onChange={(time) => setForm({ ...form, scheduledTime: time })}
                            />
                          </FormGroup>

                          <div className="flex items-center gap-3 text-xs bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                            <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                            <span className="text-brand-700">Our team will arrive within a 30-minute window. After-hours service at no extra charge.</span>
                          </div>
                        </div>
                      )}

                      {/* Recurring scheduling */}
                      {isRecurring && (
                        <div className="space-y-6">
                          <FormGroup label="How Often?" icon={Repeat}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {FREQUENCY_OPTIONS.map((freq) => (
                                <button
                                  key={freq.value}
                                  onClick={() => setForm({ ...form, frequency: freq.value })}
                                  className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                                    form.frequency === freq.value
                                      ? 'border-violet-500 bg-violet-50/50 shadow-md shadow-violet-500/10'
                                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                  }`}
                                >
                                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${
                                    form.frequency === freq.value
                                      ? 'bg-violet-100 text-violet-700'
                                      : 'bg-green-50 text-green-600'
                                  }`}>
                                    <Percent className="h-3 w-3" />
                                    Save {freq.savings}
                                  </div>
                                  <p className="font-bold text-gray-900 text-sm">{freq.label}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{freq.desc}</p>
                                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    form.frequency === freq.value
                                      ? 'border-violet-500 bg-violet-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {form.frequency === freq.value && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </FormGroup>

                          <FormGroup label="Preferred Day" icon={CalendarClock}>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                              {PREFERRED_DAYS.map((day) => (
                                <button
                                  key={day.value}
                                  onClick={() => setForm({ ...form, preferredDay: day.value })}
                                  className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    form.preferredDay === day.value
                                      ? 'bg-violet-600 text-white scale-[1.03]'
                                      : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-700 border border-gray-200 hover:border-violet-200'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                          </FormGroup>

                          <FormGroup label="Preferred Time" icon={Clock}>
                            <TimeSlotGrid
                              scheduledTime={form.scheduledTime}
                              onChange={(time) => setForm({ ...form, scheduledTime: time })}
                              accentClass="violet"
                            />
                          </FormGroup>

                          <FormGroup label="First Cleaning Date" icon={Calendar}>
                            <CalendarPicker
                              value={form.startDate}
                              onChange={(date) => setForm({ ...form, startDate: date })}
                              minDate={(() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 2);
                                return d.toISOString().split('T')[0];
                              })()}
                            />
                          </FormGroup>

                          <div className="flex items-center gap-3 text-xs bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                            <Repeat className="h-4 w-4 text-violet-500 shrink-0" />
                            <span className="text-violet-700">
                              No lock-in contracts. Manage or cancel anytime from your dashboard.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Divider ── */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* ── Address Section ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-ocean-100 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-ocean-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Facility Address</h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-5 ml-9">Where should we send our cleaning team?</p>

                      <div className="space-y-4">
                        <FormGroup label="Street Address" icon={MapPin}>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Navigation className="h-4 w-4 text-gray-400" />
                            </div>
                            <LocalInput
                              type="text"
                              required
                              className="input-field pl-11"
                              externalValue={form.address.street}
                              onCommit={(v) => setForm({ ...form, address: { ...form.address, street: v } })}
                              placeholder="123 Main Street, Suite 400"
                            />
                          </div>
                        </FormGroup>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          <div className="sm:col-span-3">
                            <FormGroup label="City">
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                </div>
                                <LocalInput
                                  type="text"
                                  required
                                  className="input-field pl-11"
                                  externalValue={form.address.city}
                                  onCommit={(v) => setForm({ ...form, address: { ...form.address, city: v } })}
                                  placeholder="Boston"
                                />
                              </div>
                            </FormGroup>
                          </div>
                          <div className="sm:col-span-2">
                            <FormGroup label="Zip Code">
                              <LocalInput
                                type="text"
                                required
                                inputMode="numeric"
                                className="input-field text-center tracking-wider font-mono"
                                externalValue={form.address.zip}
                                onCommit={(v) => setForm({ ...form, address: { ...form.address, zip: v } })}
                                transform={(v) => v.replace(/\D/g, '').slice(0, 5)}
                                placeholder="02101"
                                maxLength={5}
                              />
                            </FormGroup>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
                          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Massachusetts</p>
                            <p className="text-xs text-gray-500">We currently serve MA only</p>
                          </div>
                        </div>

                        <FormGroup label="Special Instructions" icon={FileText} optional>
                          <LocalTextarea
                            className="input-field min-h-[80px]"
                            rows={2}
                            externalValue={form.notes}
                            onCommit={(v) => setForm({ ...form, notes: v })}
                            placeholder="Access codes, parking info, areas to focus on..."
                            maxLength={500}
                          />
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Confirm */}
                {step === 3 && selectedFacility && selectedLevel && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {isRecurring ? 'Review Your Plan' : 'Review Your Booking'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Make sure everything looks good before confirming</p>

                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                      {/* Service header */}
                      <div className={`${selectedFacility.color} p-4 sm:p-5 flex items-center gap-3 sm:gap-4`}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <selectedFacility.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="text-white min-w-0 flex-1">
                          <p className="font-bold text-base sm:text-lg">
                            {selectedFacility.label} — {selectedLevel.label}
                          </p>
                          <p className="text-sm text-white/70">
                            {isRecurring && selectedFrequency
                              ? `${selectedFrequency.label} maintenance contract`
                              : 'One-time service'}
                          </p>
                        </div>
                        <button
                          onClick={() => setStep(0)}
                          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors shrink-0"
                          title="Edit service"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="divide-y divide-gray-50">
                        {/* Schedule */}
                        <div className="p-4 sm:p-5 flex items-start gap-3 group">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            {isRecurring && selectedFrequency ? (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{selectedFrequency.label}</p>
                                <p className="text-xs text-gray-500">
                                  Every {form.frequency === SubscriptionFrequency.Weekly ? '' : form.frequency === SubscriptionFrequency.Biweekly ? 'other ' : ''}{form.preferredDay.charAt(0).toUpperCase() + form.preferredDay.slice(1)}{form.frequency === SubscriptionFrequency.Monthly ? ' (monthly)' : ''} at {formatTime(form.scheduledTime)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">First cleaning: {formatDate(form.startDate)}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(form.scheduledDate)}</p>
                                <p className="text-xs text-gray-500">at {formatTime(form.scheduledTime)}</p>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => setStep(2)}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Facility details */}
                        <div className="p-4 sm:p-5 flex items-start gap-3 group">
                          <Building2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            {facilityIsResidential ? (
                              <>
                                <p className="text-sm font-semibold text-gray-900">
                                  {form.propertyDetails.bedrooms} bed · {form.propertyDetails.bathrooms} bath
                                  {form.propertyDetails.squareFootage ? ` · ~${form.propertyDetails.squareFootage.toLocaleString()} sq ft` : ''}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{form.propertyDetails.condition} condition</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-900">
                                  {form.propertyDetails.floors} floor{form.propertyDetails.floors > 1 ? 's' : ''} · {form.propertyDetails.workstations} workstations · {form.propertyDetails.restrooms} restroom{form.propertyDetails.restrooms !== 1 ? 's' : ''}
                                  {form.propertyDetails.squareFootage ? ` · ~${form.propertyDetails.squareFootage.toLocaleString()} sq ft` : ''}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {form.propertyDetails.privateOffices > 0 && `${form.propertyDetails.privateOffices} private offices · `}
                                  {form.propertyDetails.conferenceRooms > 0 && `${form.propertyDetails.conferenceRooms} conference rooms · `}
                                  {form.propertyDetails.kitchenettes > 0 && `${form.propertyDetails.kitchenettes} break rooms · `}
                                  <span className="capitalize">{form.propertyDetails.condition} condition</span>
                                </p>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => setStep(1)}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Address */}
                        <div className="p-4 sm:p-5 flex items-start gap-3 group">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{form.address.street}</p>
                            <p className="text-xs text-gray-500">{form.address.city}, MA {form.address.zip}</p>
                          </div>
                          <button
                            onClick={() => setStep(2)}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Notes */}
                        {form.notes && (
                          <div className="p-4 sm:p-5 flex items-start gap-3 group">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">Notes</p>
                              <p className="text-xs text-gray-500">{form.notes}</p>
                            </div>
                            <button
                              onClick={() => setStep(2)}
                              className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quote info */}
                      <div className="border-t border-gray-100 p-4 sm:p-5 bg-brand-50/30">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-brand-500" />
                          <span className="font-semibold text-gray-700 text-sm sm:text-base">Free Custom Quote</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          No payment required. We&apos;ll assess your facility and send a personalized cleaning proposal within 24 hours.
                        </p>
                      </div>
                    </div>

                    {/* Marketing consent */}
                    <label className="flex items-start gap-3 mt-6 text-sm text-gray-500 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        checked={form.marketingConsent}
                        onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })}
                      />
                      <span className="group-hover:text-gray-600 transition-colors">
                        I&apos;d like to receive promotions and facility maintenance tips via email/SMS. You can unsubscribe at any time.
                      </span>
                    </label>

                    {!isAuthenticated && (
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-warm-50 border border-warm-200 px-4 py-3 text-sm text-warm-800">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>
                          You&apos;ll need to{' '}
                          <Link href="/login?redirect=/booking" className="font-semibold underline">sign in</Link>{' '}
                          or{' '}
                          <Link href="/register?redirect=/booking" className="font-semibold underline">create an account</Link>{' '}
                          to complete your booking.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Navigation ── */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100">
                  {step > 0 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="btn-primary px-8 w-full sm:w-auto"
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors duration-200 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Request
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              {/* Live summary card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-28">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand-500" /> Quote Summary
                </h3>
                {selectedFacility && selectedLevel ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${selectedFacility.color} flex items-center justify-center`}>
                          <selectedFacility.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{selectedFacility.label}</span>
                      </div>
                      <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{selectedLevel.label}</span>
                    </div>
                    {isRecurring && selectedFrequency && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency</span>
                        <span className="font-medium text-gray-700">{selectedFrequency.label}</span>
                      </div>
                    )}
                    {form.propertyDetails.squareFootage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span className="font-medium text-gray-700">~{form.propertyDetails.squareFootage.toLocaleString()} sq ft</span>
                      </div>
                    )}
                    {facilityIsResidential ? (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Layout</span>
                        <span className="font-medium text-gray-700">{form.propertyDetails.bedrooms} bed · {form.propertyDetails.bathrooms} bath</span>
                      </div>
                    ) : form.propertyDetails.floors >= 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Layout</span>
                        <span className="font-medium text-gray-700">{form.propertyDetails.floors}F · {form.propertyDetails.restrooms}BR</span>
                      </div>
                    )}
                    {!isRecurring && form.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-700">{formatDateShort(form.scheduledDate)}</span>
                      </div>
                    )}
                    {isRecurring && form.startDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Starts</span>
                        <span className="font-medium text-gray-700">{formatDateShort(form.startDate)}</span>
                      </div>
                    )}
                    {form.scheduledTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time</span>
                        <span className="font-medium text-gray-700">{formatTime(form.scheduledTime)}</span>
                      </div>
                    )}
                    {form.address.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium text-gray-700">{form.address.city}, MA</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Cost</span>
                        <span className="font-bold text-brand-600">Free quote</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">No payment required · Custom proposal within 24 hrs</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Select a facility type to see your summary</p>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1 lg:gap-3">
                  {[
                    { icon: Shield, text: 'Licensed & Insured', color: 'text-brand-500' },
                    { icon: Star, text: '4.9/5 from 200+ businesses', color: 'text-warm-500' },
                    { icon: Clock, text: 'Quote within 24 hours', color: 'text-ocean-500' },
                    { icon: CheckCircle, text: 'No payment to get started', color: 'text-violet-500' },
                  ].map((badge) => (
                    <div key={badge.text} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <badge.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${badge.color} shrink-0`} />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
