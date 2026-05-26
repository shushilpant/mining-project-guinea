import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  'Contract & concession agreement registry',
  'Real-time operator compliance tracking',
  'Automated risk flag & breach detection',
  'EITI-aligned transparency reporting',
  'Cross-country negotiation intelligence',
];

export function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        login('admin'); navigate('/');
      } else if (username === 'viewer' && password === 'viewer') {
        login('viewer'); navigate('/');
      } else {
        setError('Invalid credentials. Access denied.');
        setIsSubmitting(false);
      }
    }, 700);
  };

  const inputClass =
    'w-full rounded-lg py-3 pl-10 pr-4 text-[13.5px] text-ink bg-surface-2 border border-line ' +
    'placeholder:text-ink-4 outline-none transition-all duration-200 ' +
    'focus:bg-surface focus:border-brand-600 focus:shadow-focus-ring';

  return (
    <main className="min-h-screen flex bg-canvas">

      {/* ── Left brand panel ─────────────────────────────── */}
      <section
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden bg-forest-900"
        aria-label="About this platform"
      >
        {/* Single restrained static highlight — no animation */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(900px circle at 85% -10%, rgba(200,153,30,0.07), transparent 55%), radial-gradient(700px circle at 0% 110%, rgba(1,105,64,0.16), transparent 50%)',
          }}
        />
        {/* Thin static gold rule */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gold-500/80" />

        {/* Ministry identity */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-12">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gold-500 shadow-sm">
              <span className="font-extrabold text-[13px] tracking-tight text-forest-900">MoM</span>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-500">
                Ministries of Mining
              </div>
              <div className="text-[11px] tracking-wide mt-1 text-white/45">
                West Africa · Guinea · Ghana · Côte d'Ivoire
              </div>
            </div>
          </div>

          <h1 className="text-[33px] font-bold leading-[1.15] mb-5 text-white tracking-snugger">
            National Compliance<br />
            <span className="text-gold-500">Intelligence Platform</span>
          </h1>
          <p className="text-[14px] leading-relaxed max-w-sm text-white/55">
            Centralised monitoring of mining agreements, operator performance, and
            compliance obligations across the West African region.
          </p>
        </div>

        {/* Feature list */}
        <ul className="relative z-10 space-y-3.5">
          {FEATURES.map((item) => (
            <li key={item} className="flex items-center gap-3.5">
              <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-gold-500/12 border border-gold-500/25">
                <Check size={11} className="text-gold-500" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-white/70">{item}</span>
            </li>
          ))}
        </ul>

        {/* Classification notice */}
        <div className="relative z-10 pt-6 border-t border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 bg-gold-500/10 border border-gold-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 pulse-live" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-500">
              Secure Government System
            </span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-white/35 max-w-sm">
            Restricted to authorised government personnel only. Unauthorised access
            is a criminal offence. All activity is monitored and logged.
          </p>
        </div>
      </section>

      {/* ── Right login panel ────────────────────────────── */}
      <section className="flex-1 flex flex-col bg-canvas" aria-label="Sign in">
        {/* Top bar */}
        <div className="px-8 py-3.5 flex items-center justify-between border-b border-line glass">
          <div className="flex items-center gap-2.5">
            <span className="w-0.5 h-5 rounded-full bg-gold-500 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-2">
              Secure Government Access Portal
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-[0.1em] bg-forest-900/[0.06] text-ink-3">
            PEB-0526
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm scale-in">
            <div className="rounded-2xl overflow-hidden bg-surface border border-line shadow-lg">
              {/* Thin forest top rule */}
              <div className="h-1 bg-forest-900" />

              <div className="p-8">
                <div className="flex items-center gap-3.5 mb-8">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-forest-900 shadow-sm">
                    <ShieldCheck size={18} className="text-gold-500" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-ink tracking-snugger">Secure Sign In</h2>
                    <p className="text-[12px] text-ink-3">Authorised personnel only</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="username" className="block text-[11px] font-bold mb-2 uppercase tracking-[0.14em] text-ink-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-4">
                        <User size={14} />
                      </span>
                      <input
                        id="username"
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-invalid={!!error}
                        data-focus-ring="custom"
                        className={inputClass}
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-[11px] font-bold mb-2 uppercase tracking-[0.14em] text-ink-2">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-4">
                        <Lock size={14} />
                      </span>
                      <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? 'login-error' : undefined}
                        data-focus-ring="custom"
                        className={inputClass}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      id="login-error"
                      role="alert"
                      className="flex items-center gap-2.5 text-[13px] py-3 px-3.5 rounded-lg text-status-danger bg-red-50 border border-red-200 fade-in"
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-focus-ring="custom"
                    className="w-full text-white font-semibold py-3 rounded-lg text-[14px] tracking-wide mt-2 bg-brand-600 shadow-sm
                               transition-all duration-200 hover:bg-brand-700 hover:shadow-md focus-visible:shadow-focus-ring
                               disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Sign In to Platform
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-3.5 rounded-lg bg-surface-2 border border-line">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 text-ink-4">
                    Demo Credentials
                  </p>
                  <p className="text-[12px] font-mono text-ink-2">
                    admin / password &nbsp;·&nbsp; viewer / viewer
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] mt-5 leading-relaxed text-ink-3">
              By signing in you acknowledge this system is for authorised use only
              and that all activity is monitored and logged.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 flex items-center justify-between border-t border-line glass">
          <span className="text-[11px] text-ink-3">
            National Compliance Intelligence Platform · West Africa
          </span>
          <span className="text-[11px] font-mono text-ink-4">
            RESTRICTED — Government Use Only
          </span>
        </div>
      </section>
    </main>
  );
}
