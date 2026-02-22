/**
 * PersonalizeButton — instant chapter personalisation from stored user profile.
 *
 * Reads the user profile from AuthContext (populated from localStorage on
 * mount) and generates a tailored study tip locally — no API call required.
 * Only rendered when the user is logged in.
 */
import React, { useState } from 'react';
import { useAuth } from '@site/src/components/auth/AuthContext';
import styles from './PersonalizeButton.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  background_level: string;
  field_of_interest: string;
  learning_goals: string[];
}

// ── Level colour map ───────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#f59e0b',
  expert:       '#ef4444',
};

// ── Local tip generator ────────────────────────────────────────────────────

const LEVEL_ADVICE: Record<string, [string, string, string]> = {
  beginner: [
    'Start with the concept diagrams before diving into code.',
    'Read the "Why it matters" sections first — they build intuition.',
    'Work through each step-by-step example in order; don\'t skip ahead.',
  ],
  intermediate: [
    'Focus on how each component integrates with the broader system.',
    'The architecture diagrams reveal design decisions worth studying closely.',
    'Trace the data flow through the full pipeline as you read.',
  ],
  expert: [
    'Skim the fundamentals and jump to advanced configuration and edge cases.',
    'The implementation deep-dives and benchmark sections are highest value.',
    'Consider how each pattern scales and where the failure modes are.',
  ],
};

function buildTip(user: UserProfile, chapterTitle: string): string {
  const level  = user.background_level;
  const field  = user.field_of_interest;
  const goals  = user.learning_goals;

  const advice = LEVEL_ADVICE[level] ?? LEVEL_ADVICE.intermediate;
  const goalNote =
    goals.length > 0
      ? `Your goal — "${goals[0]}" — maps directly to the hands-on sections of ${chapterTitle}.`
      : `Apply the concepts in ${chapterTitle} to your ${field} projects as you read.`;

  return [advice[0], advice[1], '', goalNote].join('\n');
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PersonalizeButton(): React.JSX.Element | null {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen]   = useState(false);

  // Auth gate — hidden when logged out
  if (!token || !user) return null;

  const chapterTitle =
    typeof document !== 'undefined'
      ? document.title.split('|')[0].trim()
      : 'this chapter';

  const tip        = buildTip(user, chapterTitle);
  const levelColor = LEVEL_COLORS[user.background_level] ?? '#818cf8';
  const firstName  = user.name.split(' ')[0];

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${isOpen ? styles.btnOpen : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-label="Personalize this chapter for your learning profile"
      >
        ✨ Personalize
      </button>

      {isOpen && (
        <div className={styles.panel} role="region" aria-label="Personalized study tip">
          {/* Profile header */}
          <div className={styles.panelHeader}>
            <span className={styles.panelHeaderLabel}>
              {firstName} · {user.field_of_interest}
            </span>
            <span
              className={styles.levelBadge}
              style={{
                background: `${levelColor}22`,
                color: levelColor,
                border: `1px solid ${levelColor}44`,
              }}
            >
              {user.background_level}
            </span>
          </div>

          {/* Goal tags */}
          {user.learning_goals.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.65rem' }}>
              {user.learning_goals.slice(0, 3).map(g => (
                <span
                  key={g}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: '#a5b4fc',
                    fontWeight: 600,
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Tip text */}
          <p className={styles.panelText} style={{ whiteSpace: 'pre-line' }}>
            {tip}
          </p>
        </div>
      )}
    </div>
  );
}
