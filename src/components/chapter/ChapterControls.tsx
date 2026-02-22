/**
 * ChapterControls — toolbar injected at the top of every doc page.
 * Renders the Personalize button (auth-gated) and the RTL layout toggle.
 */
import React from 'react';
import { useAuth } from '@site/src/components/auth/AuthContext';
import { useUrdu } from '@site/src/context/UrduContext';
import PersonalizeButton from '@site/src/components/PersonalizeButton';
import styles from './styles.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────

function IconTranslate() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h12M9 3v2m0 0c0 4-2.5 7-6 8m6-8c0 4 2.5 7 6 8" />
      <path d="M11 17l2-5 2 5m-3.5-2h3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Level badge colours ────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#f59e0b',
  expert:       '#ef4444',
};

// ── Main component ─────────────────────────────────────────────────────────

export default function ChapterControls(): React.JSX.Element {
  const { user } = useAuth();
  const { urduMode, toggleUrdu } = useUrdu();

  return (
    <>
      <div className={styles.toolbar} role="toolbar" aria-label="Chapter tools">
        <span className={styles.toolbarLabel}>Chapter Tools</span>

        {user && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: `${LEVEL_COLORS[user.background_level]}22`,
              color: LEVEL_COLORS[user.background_level],
              border: `1px solid ${LEVEL_COLORS[user.background_level]}44`,
              textTransform: 'capitalize',
              letterSpacing: '0.04em',
            }}
          >
            {user.background_level}
          </span>
        )}

        <div className={styles.spacer} />

        <PersonalizeButton />

        <button
          className={`${styles.btn} ${styles.btnTranslate} ${urduMode ? styles.btnTranslateActive : ''}`}
          onClick={toggleUrdu}
          aria-label="Toggle RTL layout"
          aria-pressed={urduMode}
          title="Toggle Urdu RTL layout"
        >
          {urduMode ? (
            <><IconCheck /> اردو — On</>
          ) : (
            <><IconTranslate /> Urdu RTL</>
          )}
        </button>
      </div>

      {urduMode && (
        <div className={styles.urduBanner}>
          ↔ RTL layout active — reading right to left &nbsp;·&nbsp; اردو لے آؤٹ فعال ہے
        </div>
      )}
    </>
  );
}
