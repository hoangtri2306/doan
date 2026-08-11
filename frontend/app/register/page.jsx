"use client";

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { register as registerService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  "Write and publish beautiful articles",
  "Connect with a community of readers",
  "Discover stories from great minds",
  "Your writing, your audience",
];

function LeftPanel() {
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

      {/* Center */}
      <div>
        <h2 className="mb-3 text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}>
          Start your writing journey today.
        </h2>
        <p className="mb-8 text-base text-white/70">
          Join thousands of writers sharing ideas that matter.
        </p>

        <ul className="space-y-3">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-white/50">
        © 2025 Inkwell. A space for ideas.
      </p>
    </div>
  );
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  /* Simple password strength */
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-success'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await registerService(username, email, password);
      login(data.user);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 grid lg:grid-cols-2 bg-bg">
      <LeftPanel />

      {/* Right – form */}
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
          <div className="mb-8">
            <h1
              className="mb-2 text-3xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--playfair-font), Georgia, serif', letterSpacing: '-0.02em' }}
            >
              Create your account
            </h1>
            <p className="text-[15px] text-text-secondary">
              Free forever. No credit card needed.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-subtle px-4 py-3 text-sm text-danger animate-fade-in">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up delay-100">
              <label htmlFor="username" className="mb-2 block text-[13px] font-semibold text-text-primary">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="your_name"
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="animate-fade-in-up delay-200">
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

            <div className="animate-fade-in-up delay-300">
              <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
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

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3].map(lvl => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= lvl ? strengthColor[strength] : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-text-tertiary">{strengthLabel[strength]} password</p>
                </div>
              )}
            </div>

            <div className="animate-fade-in-up delay-400 pt-1">
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
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create my account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-xs text-text-tertiary animate-fade-in-up delay-500">
            By continuing, you agree to our{' '}
            <span className="text-text-secondary underline underline-offset-2 cursor-pointer">Terms</span>
            {' '}and{' '}
            <span className="text-text-secondary underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
          </p>

          <p className="mt-5 text-center text-sm text-text-secondary animate-fade-in-up delay-500">
            Already have an account?{' '}
            <Link href="/login" className="link-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
