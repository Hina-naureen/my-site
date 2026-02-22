/**
 * Better-Auth — Signup form with background profiling.
 */
import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { useAuth } from './AuthContext';
import styles from './styles.module.css';

const LEARNING_GOALS = [
  { id: 'build-robots', label: 'Build real robots' },
  { id: 'ai-research', label: 'AI research' },
  { id: 'ros2-skills', label: 'Master ROS 2' },
  { id: 'sim-training', label: 'Sim-to-real training' },
  { id: 'vla-models', label: 'VLA / LLM planning' },
  { id: 'career-switch', label: 'Career in robotics' },
];

const FIELDS = [
  { value: 'robotics', label: 'Robotics Engineering' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'software', label: 'Software Engineering' },
  { value: 'other', label: 'Other' },
];

export default function SignupForm() {
  const { signup } = useAuth();
  const history = useHistory();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [field, setField] = useState('robotics');
  const [goals, setGoals] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleGoal(id: string) {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        background_level: level,
        field_of_interest: field,
        learning_goals: goals,
      });
      history.push('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
            <circle cx="26" cy="26" r="26" fill="url(#sg)" />
            <path d="M17 26l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f46e5" /><stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.authTitle}>Create your account</h1>
        <p className={styles.authSubtitle}>
          Personalized AI-powered learning starts here
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>

          {/* ── Basic Info ── */}
          <div className={styles.sectionLabel}>Basic Info</div>

          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ada Lovelace"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {/* ── Background ── */}
          <div className={styles.sectionLabel}>Your Background</div>

          <div className={styles.field}>
            <label className={styles.label}>Skill Level</label>
            <div className={styles.levelGroup}>
              {(['beginner', 'intermediate', 'expert'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  className={`${styles.levelPill} ${level === l ? styles.levelPillActive : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Field of Interest</label>
            <select
              className={styles.select}
              value={field}
              onChange={e => setField(e.target.value)}
            >
              {FIELDS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* ── Goals ── */}
          <div className={styles.sectionLabel}>Learning Goals</div>

          <div className={styles.checkboxGrid}>
            {LEARNING_GOALS.map(g => (
              <label key={g.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={goals.includes(g.id)}
                  onChange={() => toggleGoal(g.id)}
                />
                {g.label}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
