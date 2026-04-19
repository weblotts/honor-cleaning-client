'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyableCodeProps {
  code: string;
  className?: string;
}

export default function CopyableCode({ code, className = '' }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors group ${className}`}
      title={`Click to copy ${code}`}
    >
      {code}
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
