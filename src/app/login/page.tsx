'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (res?.error) {
        setErrorMessage(
          language === 'en'
            ? 'Invalid email or password.'
            : 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။'
        );
        return;
      }

      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(
        err?.message ||
          (language === 'en' ? 'An unexpected error occurred.' : 'မမျှော်လင့်ထားသော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။')
      );
    }
  };

  return (
    <section className="landing-dark-theme-wrapper">
      <div className="glass-panel">
        <span className="badge-neon">
          <ShieldCheck size={14} />
          {language === 'en' ? 'Secure workspace' : 'လုံခြုံစိတ်ချရသော လုပ်ငန်းခွင်'}
        </span>
        <h2>Welcome back</h2>
        <p className="auth-copy-dark">
          Sign in to continue shaping your startup blueprint with the agent workflow.
        </p>
        <form onSubmit={handleLogin} className="auth-form-dark">
          <div className="form-field">
            <label htmlFor="email" className="dark-label">Email</label>
            <input
              id="email"
              type="email"
              className="dark-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="dark-label">Password</label>
            <input
              id="password"
              type="password"
              className="dark-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {errorMessage ? <p className="auth-error-dark">{errorMessage}</p> : null}

          <button
            type="submit"
            className="btn-accent-glow full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? (language === 'en' ? 'Signing in...' : 'ဝင်ရောက်နေသည်...') : (language === 'en' ? 'Sign In' : 'အကောင့်ဝင်ရန်')}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-switch-dark">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="dark-link">Create one</Link>
        </p>
      </div>
    </section>
  );
}
