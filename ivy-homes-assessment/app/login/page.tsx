'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import FloatingOrbsCanvas from '@/components/3d/FloatingOrbsCanvas';
import { ShieldCheck, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, session } = useAuth();
  
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('f5a9dd5f8a');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('f5a9dd5f8a');
  };

  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
        <Navbar />
        <FloatingOrbsCanvas />
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="max-w-md w-full bg-white/80 border border-white/90 rounded-3xl p-8 text-center shadow-bento-card backdrop-blur-xl">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Already Authenticated</h2>
            <p className="text-slate-600 text-xs mb-6">
              Logged in as <strong className="text-indigo-600 font-semibold">{session.user.email}</strong>. Session token is active and persisted.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider text-xs"
            >
              <span>Proceed to Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      <Navbar />

      <FloatingOrbsCanvas />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-sm">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Sign In to Ivy Homes
            </h2>
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Authenticated via Ivy Homes Property API (Chennai Dataset)
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-8 shadow-bento-card relative">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  User Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-xs shadow-sm"
                    placeholder="demo1@ivy.homes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-xs shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs tracking-wider uppercase mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">
                Quick Demo Accounts (Password: f5a9dd5f8a)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes'].map((demoEmail) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => selectDemoAccount(demoEmail)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center truncate ${
                      email === demoEmail
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {demoEmail.split('@')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
