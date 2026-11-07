'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'en'
          ? 'Password and confirm password must match.'
          : 'စကားဝှက်နှစ်ခု ကိုက်ညီမှုမရှိပါ။'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            (language === 'en' ? 'Registration failed.' : 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။')
        );
        return;
      }

      router.replace('/login');
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
          <UserPlus size={14} />
          {language === 'en' ? 'Create an account' : 'အကောင့်အသစ် ဖွင့်ရန်'}
        </span>
        <h2>Join Startup Agentic</h2>
        <p className="auth-copy-dark">
          Set up your credentials to manage your business ideas and agent execution workspace.
        </p>
        <form onSubmit={handleRegister} className="auth-form-dark">
          <div className="form-field">
            <label htmlFor="username" className="dark-label">Username</label>
            <input
              id="username"
              type="text"
              className="dark-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="founder123"
              required
            />
          </div>
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
          <div className="form-field">
            <label htmlFor="confirmPassword" className="dark-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="dark-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            {isSubmitting ? (language === 'en' ? 'Creating account...' : 'အကောင့်ဖွင့်နေသည်...') : (language === 'en' ? 'Create Account' : 'အကောင့်ဖွင့်ရန်')}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-switch-dark">
          Already have an account?{' '}
          <Link href="/login" className="dark-link">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
