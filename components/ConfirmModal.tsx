'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  /** When true, shows a textarea and passes its value to onConfirm */
  withReason?: boolean;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go Back',
  variant = 'default',
  withReason = false,
  reasonPlaceholder = 'Enter a reason...',
  reasonRequired = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset reason when modal opens
  useEffect(() => {
    if (open) {
      setReason('');
      // Focus textarea after paint
      if (withReason) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [open, withReason]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';
  const canSubmit = !loading && (!withReason || !reasonRequired || reason.trim().length > 0);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-2">
          <div
            className={clsx(
              'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full',
              isDanger ? 'bg-red-100' : 'bg-brand-100',
            )}
          >
            <AlertTriangle className={clsx('h-5 w-5', isDanger ? 'text-red-600' : 'text-brand-600')} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>

          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reason textarea */}
        {withReason && (
          <div className="px-6 pt-3">
            <textarea
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="input-field resize-none text-sm"
            />
            {reasonRequired && (
              <p className="mt-1 text-xs text-gray-400">A reason is required to proceed.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1 !py-2.5 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={!canSubmit}
            className={clsx(
              'flex-1 !py-2.5 text-sm',
              isDanger ? 'btn-danger' : 'btn-primary',
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
