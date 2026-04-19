'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Shield, Copy, CheckCircle, Loader2 } from 'lucide-react';

type Step = 'intro' | 'scan' | 'verify';

export default function MfaSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSetup() {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('scan');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;

    setVerifying(true);
    try {
      await api.post('/auth/mfa/enable', { code });
      toast.success('MFA enabled!');
      router.push('/dashboard/settings');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Step 1: Intro */}
      {step === 'intro' && (
        <div className="card text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Shield className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Set Up Two-Factor Authentication
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Add an extra layer of security to your account. You will need an authenticator app
              such as Google Authenticator, Authy, or 1Password.
            </p>
          </div>
          <button onClick={handleSetup} disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </span>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      )}

      {/* Step 2: Scan QR Code */}
      {step === 'scan' && (
        <div className="card space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
            <p className="text-sm text-gray-500 mt-1">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center rounded-lg bg-white p-4 border border-gray-100">
            {qrCode && (
              <Image
                src={qrCode}
                alt="MFA QR Code"
                width={200}
                height={200}
                unoptimized
              />
            )}
          </div>

          {/* Manual entry secret */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              Or enter this key manually in your app:
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 border border-gray-200">
              <code className="flex-1 text-sm font-mono text-gray-800 break-all select-all">
                {secret}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy secret"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button onClick={() => setStep('verify')} className="btn-primary w-full">
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Verify Code */}
      {step === 'verify' && (
        <div className="card space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Setup</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-[0.3em] font-mono"
                placeholder="000000"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6 || verifying}
              className="btn-primary w-full"
            >
              {verifying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Enable MFA'
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setStep('scan')}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to QR code
          </button>
        </div>
      )}
    </div>
  );
}
