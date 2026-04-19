'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-ocean-950 relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ocean-500/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Honor Cleaning</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10">
          {sent ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-500 mb-2">
                If an account exists for <strong className="text-gray-700">{email}</strong>, we have sent a password reset link.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                The link will expire in 1 hour. Check your spam folder if you do not see it.
              </p>

              <div className="space-y-3">
                <Link href="/login" className="btn-primary w-full text-base py-3.5 justify-center">
                  Back to Sign In
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full text-sm text-gray-500 hover:text-brand-600 transition-colors py-2"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <div>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="input-field pl-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full text-base py-3.5"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom link */}
        <p className="mt-8 text-center text-sm text-brand-200/70">
          Remember your password?{' '}
          <Link href="/login" className="text-white font-semibold hover:text-brand-200 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
