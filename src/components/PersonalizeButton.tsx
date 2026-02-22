/**
 * PersonalizeButton — AI-powered chapter personalisation.
 *
 * Only renders when the user is logged in.
 * On click: reads the user profile from AuthContext + localStorage,
 * calls /api/chat with a personalised prompt, and displays an
 * AI-generated study tip inline below the button.
 */
import React, { useState, useCallback } from 'react';
import { useAuth } from '@site/src/components/auth/AuthContext';
import styles from './PersonalizeButton.module.css';

const API_URL = 'http://localhost:8000/api/chat';

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  expert: '#ef4444',
};

function localFallback(level: string, field: string, goals: string): string {
  const tip: Record<string, string> = {
    beginner:
      `As a beginner in ${field}, focus on the diagrams and step-by-step code examples. ` +
      `Don't skip the "Why it matters" sections — they connect concepts to your goal: ${goals}.`,
    intermediate:
      `At intermediate level, pay attention to architecture trade-offs and how this module's ` +
      `components integrate with the broader ${field} stack. Your goals (${goals}) align well with the practical exercises.`,
    expert:
      `For an expert in ${field}, skim the fundamentals and focus on advanced configuration, ` +
      `performance benchmarks, and edge-case notes. Your goals (${goals}) are best served by the implementation deep-dives.`,
  };
  return tip[level] ?? tip['intermediate'];
}

export default function PersonalizeButton(): React.JSX.Element | null {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    // Toggle panel if tip already fetched
    if (tip !== null) {
      setIsOpen(o => !o);
      return;
    }

    setIsOpen(true);
    setLoading(true);

    // Read profile: prefer context value, fall back to raw localStorage
    let profile = user;
    if (!profile) {
      try {
        const raw = typeof window !== 'undefined'
          ? window.localStorage.getItem('physai_auth')
          : null;
        if (raw) profile = JSON.parse(raw).user;
      } catch { /* ignore */ }
    }
    if (!profile) { setLoading(false); return; }

    const chapterTitle =
      typeof document !== 'undefined'
        ? document.title.split('|')[0].trim()
        : 'this chapter';

    const goals = (profile.learning_goals ?? []).join(', ') || 'general learning';
    const message =
      `I'm reading "${chapterTitle}" in the Physical AI & Humanoid Robotics textbook. ` +
      `My background: ${profile.background_level} level, field: ${profile.field_of_interest}, ` +
      `goals: ${goals}. ` +
      `In 2-3 sentences, tell me what to focus on in this chapter given my profile.`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          user_level: profile.background_level,
          history: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTip(data.answer ?? localFallback(profile.background_level, profile.field_of_interest, goals));
      } else {
        setTip(localFallback(profile.background_level, profile.field_of_interest, goals));
      }
    } catch {
      setTip(localFallback(profile.background_level, profile.field_of_interest, goals));
    } finally {
      setLoading(false);
    }
  }, [user, tip]);

  // Auth gate — hide completely when logged out
  if (!token || !user) return null;

  const levelColor = LEVEL_COLORS[user.background_level] ?? '#818cf8';

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${isOpen ? styles.btnOpen : ''}`}
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-label="Personalize this chapter for your learning profile"
      >
        {loading ? (
          <>
            <div className={styles.spinner} />
            Personalizing…
          </>
        ) : (
          <>✨ Personalize Chapter</>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel} role="region" aria-label="Personalized study tip">
          <div className={styles.panelHeader}>
            <span className={styles.panelHeaderLabel}>Study Tip for you</span>
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
          {loading ? (
            <p className={styles.loadingText}>Generating your personalised tip…</p>
          ) : (
            <p className={styles.panelText}>{tip}</p>
          )}
        </div>
      )}
    </div>
  );
}
