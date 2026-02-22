/**
 * Better-Auth — Login form.
 */
import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { useAuth } from './AuthContext';
import styles from './styles.module.css';

export default function LoginForm() {
  const { login } = useAuth();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      history.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="26" fill="url(#lg)" />
            <path d="M26 16v10l6 4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26" cy="26" r="10" stroke="white" strokeWidth="2.5" strokeOpacity="0.5" />
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" /><stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>
          Sign in to continue your learning journey
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
