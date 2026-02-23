/**
 * Profile page — view and edit user profile settings.
 */
import React, { useState } from 'react';
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

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  expert: '#ef4444',
};

export default function ProfileForm(): React.JSX.Element {
  const { user, logout, updateProfile, isLoading } = useAuth();
  const history = useHistory();

  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert'>(
    user?.background_level ?? 'beginner'
  );
  const [field, setField] = useState(user?.field_of_interest ?? 'robotics');
  const [goals, setGoals] = useState<string[]>(user?.learning_goals ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    history.push('/login');
    return <div />;
  }

  if (isLoading || !user) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard} style={{ textAlign: 'center', color: '#94a3b8' }}>
          Loading…
        </div>
      </div>
    );
  }

  function toggleGoal(id: string) {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ background_level: level, field_of_interest: field, learning_goals: goals });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    history.push('/');
  }

  const levelColor = LEVEL_COLORS[level] ?? '#6366f1';

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard} style={{ maxWidth: 520 }}>

        {/* Avatar + name */}
        <div className={styles.authLogo}>
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="26" fill="url(#pg)" />
            <text x="26" y="32" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white">
              {user.name.charAt(0).toUpperCase()}
            </text>
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f46e5" /><stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.authTitle}>{user.name}</h1>
        <p className={styles.authSubtitle} style={{ marginBottom: '0.5rem' }}>{user.email}</p>

        {/* Level badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.9rem',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 700,
            background: `${levelColor}22`,
            color: levelColor,
            border: `1px solid ${levelColor}55`,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {user.background_level}
          </span>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {saved && (
          <div style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.35)',
            borderRadius: 10,
            padding: '0.7rem 1rem',
            color: '#86efac',
            fontSize: '0.87rem',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}>
            Profile saved successfully!
          </div>
        )}

        <form className={styles.form} onSubmit={handleSave}>

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

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Logout */}
        <div className={styles.authFooter}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.87rem',
              fontWeight: 600,
              padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
