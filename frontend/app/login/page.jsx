"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { login as loginService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

/* Rotating editorial quotes */
const QUOTES = [
  { text: "The scariest moment is always just before you start.", author: "Stephen King" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "A word after a word after a word is power.", author: "Margaret Atwood" },
  { text: "You have to write the book that wants to be written.", author: "Madeleine L'Engle" },
];

function LeftPanel() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div className="auth-panel-left hidden lg:flex flex-col justify-between p-12 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
            <line x1="16" y1="8" x2="2" y2="22"/>
            <line x1="17.5" y1="15" x2="9" y2="15"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}>
          Inkwell
        </span>
      </div>

      {/* Center content */}
      <div>
        <div
          className="mb-2 text-4xl font-bold leading-tight"
          style={{ fontFamily: 'var(--playfair-font), Georgia, serif', opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          &ldquo;{q.text}&rdquo;
        </div>
        <div
          className="text-sm font-medium text-white/70"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          — {q.author}
        </div>

        {/* Quote dots */}
        <div className="mt-6 flex gap-1.5">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setQuoteIdx(i); setVisible(true); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === quoteIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/50">
        © 2025 Inkwell. A space for ideas.
      </p>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // BUG-033: đọc query param — setTimeout(0) tránh setState đồng bộ trong effect
  // (rule react-hooks/set-state-in-effect: setState đồng bộ trong effect gây cascading render)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const errorMsg = new URLSearchParams(window.location.search).get('error');
    if (!errorMsg) return;
    const t = setTimeout(() => setError(errorMsg), 0);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await loginService(email, password);
      login(data.user);
      if (data.user?.role === 'ADMIN' || data.user?.role === 'MODERATOR') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 grid lg:grid-cols-2 bg-bg">
      <LeftPanel />

      {/* Right – form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20 overflow-y-auto">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
              <line x1="16" y1="8" x2="2" y2="22"/>
              <line x1="17.5" y1="15" x2="9" y2="15"/>
            </svg>
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}>Inkwell</span>
        </div>

        <div className="mx-auto w-full max-w-sm animate-fade-in-up">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="mb-2 text-3xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--playfair-font), Georgia, serif', letterSpacing: '-0.02em' }}
            >
              Welcome back
            </h1>
            <p className="text-[15px] text-text-secondary">
              Sign in to continue your story.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-subtle px-4 py-3 text-sm text-danger animate-fade-in">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up delay-100">
              <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-text-primary">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="animate-fade-in-up delay-200">
              <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pr-11"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up delay-300 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent w-full py-3 text-[15px]"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary animate-fade-in-up delay-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="link-accent">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
