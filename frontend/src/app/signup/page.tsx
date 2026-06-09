'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Building, AlertCircle, ArrowLeft, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface RegisterResponse {
  success: boolean;
  token: string;
  role: 'superadmin' | 'tenant_owner';
  user: {
    id: string;
    name: string;
    email: string;
  };
  business?: any;
}

export default function Signup() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<RegisterResponse>('/auth/register', {
        business_name: businessName,
        email,
        password,
      });
      
      localStorage.setItem('pulse_review_token', res.token);
      localStorage.setItem('pulse_review_role', res.role);
      localStorage.setItem('pulse_review_user', JSON.stringify(res.user));
      
      if (res.business) {
        localStorage.setItem('pulse_review_business', JSON.stringify(res.business));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex font-sans antialiased text-foreground bg-background">
      {/* Left side: Big image block */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Custom Background Image showing phone scanning QR code */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/scan-qr-background.png")' }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg text-white">
          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-[#FBBF24] border border-amber-500/30 px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase">
            <Star className="h-4 w-4 fill-current" /> Fast Onboarding
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: '#ffffff' }}>
            Claim Your Dedicated Business Review Portal Today
          </h2>
          <p className="text-lg" style={{ color: '#e2e8f0' }}>
            Start collecting customer emails and phone numbers, routing positive feedback directly to Google My Business, and filtering bad reviews to build trust.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © {new Date().getFullYear()} Review Pulse. All rights reserved.
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Link href="/">
                <img src="/logo.svg" alt="Review Pulse Logo" className="h-10 w-auto" />
              </Link>
              <Link href="/" className="lg:hidden text-sm font-semibold text-slate-500 hover:text-black transition-colors flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 pt-4">
              Create your account
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Set up your business profile and review routing rules in under 2 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-bold uppercase tracking-wider text-slate-500">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="businessName"
                  type="text"
                  required
                  placeholder="e.g. Cafe Central"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-premium rounded-lg w-full py-3 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all border border-slate-200"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="manager@mybusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium rounded-lg w-full py-3 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all border border-slate-200"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wider text-slate-500">
                Choose Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="•••••••• (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium rounded-lg w-full py-3 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all border border-slate-200"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium-primary rounded-lg flex w-full items-center justify-center py-3.5 text-sm font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                'Create Business Account'
              )}
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-white px-3 text-slate-400">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Google authentication is not configured for this demo.");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
