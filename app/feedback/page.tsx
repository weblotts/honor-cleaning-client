'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type FeedbackFields = {
  comment: string;
  customerRole: string;
  customerLocation: string;
};

function FeedbackForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [feedbackData, setFeedbackData] = useState<{
    customerName: string;
    serviceType: string;
    customerLocation?: string;
  } | null>(null);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { register, handleSubmit, setValue } = useForm<FeedbackFields>({
    defaultValues: { comment: '', customerRole: '', customerLocation: '' },
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid feedback link. Please use the link from your email.');
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/feedback/token/${token}`)
      .then((res) => {
        setFeedbackData(res.data);
        if (res.data.customerLocation) setValue('customerLocation', res.data.customerLocation);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || 'Failed to load feedback form';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token, setValue]);

  const onSubmit = handleSubmit(async ({ comment, customerRole, customerLocation }) => {
    if (rating === 0) { setError('Please select a rating'); return; }
    if (comment.trim().length < 5) { setError('Please write at least a few words about your experience'); return; }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/feedback/token/${token}`, {
        rating,
        comment: comment.trim(),
        customerRole: customerRole.trim() || undefined,
        customerLocation: customerLocation.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to submit feedback';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">
            Your feedback means a lot to us. It helps us improve our service and lets other
            businesses know what to expect.
          </p>
        </div>
      </div>
    );
  }

  if (error && !feedbackData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Honor Cleaning</h1>
          <p className="text-sm text-emerald-600 font-medium tracking-widest uppercase mt-1">
            Professional Cleaning Services
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">How was your experience?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your{' '}
            <span className="font-medium capitalize">{feedbackData?.serviceType}</span>{' '}
            cleaning service
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Star Rating — stays as local state since it's not a text input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Tell us about your experience
              </label>
              <textarea
                id="comment"
                rows={4}
                placeholder="What did you like? How can we improve?"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                maxLength={2000}
                {...register('comment', { required: true })}
              />
            </div>

            {/* Role (optional) */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Your Role / Company{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="role"
                type="text"
                placeholder="e.g. Office Manager, TechFlow Inc."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                {...register('customerRole')}
              />
            </div>

            {/* Location (optional) */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Cambridge, MA"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                {...register('customerLocation')}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              With your permission, we may share your review on our website.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <FeedbackForm />
    </Suspense>
  );
}
