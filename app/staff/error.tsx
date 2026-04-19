'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Staff Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="text-sm text-gray-500 mt-2">
          An unexpected error occurred. Please try again or return to your jobs.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={reset}
            className="btn-secondary flex-1 !py-2.5 text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Try Again
          </button>
          <Link href="/staff" className="btn-primary flex-1 !py-2.5 text-sm text-center">
            <Briefcase className="h-4 w-4 mr-1.5" /> Back to Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
