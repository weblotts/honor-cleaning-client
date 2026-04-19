'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   PHONE INPUT — auto-formats (617) 555-0123
   ═══════════════════════════════════════════════════════════════ */

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function unformatPhone(formatted: string): string {
  return formatted.replace(/\D/g, '').slice(0, 10);
}

interface PhoneInputProps {
  value: string;
  onChange: (raw: string) => void;
  className?: string;
  error?: boolean;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, className = '', error = false, placeholder = '(617) 555-0123' }: PhoneInputProps) {
  const display = formatPhoneDisplay(value);
  const digits = unformatPhone(value);
  const isComplete = digits.length === 10;

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium text-gray-300">+1</span>
        </div>
        <div className="w-px h-5 bg-gray-200" />
      </div>
      <input
        type="tel"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(unformatPhone(e.target.value))}
        placeholder={placeholder}
        className={`input-field pl-[5.5rem] pr-10 ${error ? 'border-red-400 ring-1 ring-red-400' : ''} ${className}`}
      />
      {isComplete && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CURRENCY INPUT — auto-formats $1,234.56, stores cents
   ═══════════════════════════════════════════════════════════════ */

interface CurrencyInputProps {
  /** Value in cents (e.g. 12350 = $123.50) */
  value: number;
  /** Called with the new value in cents */
  onChange: (cents: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  required?: boolean;
  /** Compact size for inline/table usage */
  size?: 'default' | 'sm';
  disabled?: boolean;
}

/**
 * Format cents to a display string: 12350 → "123.50"
 * We don't add commas to the editable value to keep cursor behavior simple,
 * but we show a formatted preview below when the amount is large.
 */
function centsToDisplay(cents: number): string {
  if (!cents) return '';
  return (cents / 100).toFixed(2);
}

function parseDollarsToCents(input: string): number {
  // Strip everything except digits and decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');
  // Only keep the first decimal point
  const parts = cleaned.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').slice(0, 2);
  const dollars = parseFloat(`${whole}.${frac || '0'}`);
  if (isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

function formatWithCommas(cents: number): string {
  if (!cents) return '$0.00';
  return '$' + (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CurrencyInput({
  value,
  onChange,
  className = '',
  placeholder = '0.00',
  min = 0,
  required = false,
  size = 'default',
  disabled = false,
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(() => centsToDisplay(value));

  // Sync local display when value changes externally (e.g. reset form)
  const prevCentsRef = useCallback(() => value, [value]);
  if (!focused && parseDollarsToCents(localValue) !== value) {
    // Only sync when not focused to avoid fighting the user's typing
    setLocalValue(centsToDisplay(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow empty
    if (raw === '') {
      setLocalValue('');
      onChange(0);
      return;
    }
    // Allow partial typing like "12." or "12.5"
    if (/^\d*\.?\d{0,2}$/.test(raw)) {
      setLocalValue(raw);
      const cents = parseDollarsToCents(raw);
      onChange(cents);
    }
  }

  function handleBlur() {
    setFocused(false);
    // Normalize display on blur: "5" → "5.00", "" → ""
    if (localValue && localValue !== '') {
      const cents = parseDollarsToCents(localValue);
      setLocalValue(centsToDisplay(cents));
    }
  }

  const showPreview = value >= 100000; // $1,000+ gets comma preview
  const isSmall = size === 'sm';

  return (
    <div className="relative">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none ${isSmall ? 'text-sm' : 'text-sm'}`}>
        $
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={focused ? localValue : (value ? centsToDisplay(value) : '')}
        onChange={handleChange}
        onFocus={() => { setFocused(true); setLocalValue(centsToDisplay(value)); }}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field pl-7 tabular-nums ${isSmall ? 'py-2 text-sm' : 'py-2.5'} ${className}`}
      />
      {showPreview && !focused && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          {formatWithCommas(value)}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENHANCED INPUT — icon, label, helper text, error state
   ═══════════════════════════════════════════════════════════════ */

interface EnhancedInputProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  helper?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function FormGroup({ label, icon: Icon, error, helper, optional, children }: EnhancedInputProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
        {Icon && <Icon className="h-4 w-4 text-brand-500" />}
        {label}
        {optional && <span className="font-normal text-gray-400 text-xs">(optional)</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-gray-400">{helper}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR DATE PICKER — visual month grid, no native <input>
   ═══════════════════════════════════════════════════════════════ */

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
}

export function CalendarPicker({ value, onChange, minDate }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value + 'T00:00:00');
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(min.getFullYear(), min.getMonth(), 1)) {
      setViewMonth(prev);
    }
  };

  const nextMonth = () => {
    setViewMonth(new Date(year, month + 1, 1));
  };

  const canGoPrev = new Date(year, month - 1, 1) >= new Date(min.getFullYear(), min.getMonth(), 1);

  const isSelected = useCallback((day: number) => {
    if (!value) return false;
    const d = new Date(value + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }, [value, year, month]);

  const isDisabled = useCallback((day: number) => {
    const d = new Date(year, month, day);
    return d < min;
  }, [year, month, min]);

  const isToday = useCallback((day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  }, [year, month]);

  const selectDay = (day: number) => {
    if (isDisabled(day)) return;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${year}-${m}-${d}`);
  };

  const days = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-bold text-gray-900">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const selected = isSelected(day);
          const disabled = isDisabled(day);
          const todayMark = isToday(day);

          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              disabled={disabled}
              className={`
                relative w-full aspect-square rounded-xl text-sm font-medium
                transition-all duration-200 flex items-center justify-center
                ${selected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-105'
                  : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                }
              `}
            >
              {day}
              {todayMark && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {value && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Selected</span>
          <span className="text-sm font-bold text-brand-600">
            {new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}
