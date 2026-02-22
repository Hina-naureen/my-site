/**
 * Physical AI & Humanoid Robotics — Homepage
 * Enterprise green gradient hero + module feature cards.
 * No default Docusaurus illustrations.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

// ── Stats bar ─────────────────────────────────────────────────────────────────

const STATS = [
  { value: '6', label: 'Modules' },
  { value: '50+', label: 'Chapters' },
  { value: 'RAG', label: 'AI-Powered' },
  { value: '∞', label: 'Free Access' },
];

// ── Hero ──────────────────────────────────────────────────────────────────────

function HomepageHero(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.hero}>
      {/* Ambient orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.heroInner}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          Enterprise Textbook · 2025 Edition
        </div>

        {/* Title */}
        <h1 className={styles.heroTitle}>
          Physical AI &amp;<br />
          <span className={styles.heroAccent}>Humanoid Robotics</span>
        </h1>

        {/* Tagline */}
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

        {/* Stats */}
        <div className={styles.stats} role="list">
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.statItem} role="listitem">
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className={styles.ctaRow}>
          <Link className={styles.ctaPrimary} to="/docs/intro">
            Start Learning
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link className={styles.ctaSecondary} to="/docs/intro">
            Browse Modules
          </Link>
        </div>

        {/* Tech stack pills */}
        <div className={styles.techStack}>
          {['ROS 2', 'NVIDIA Isaac', 'VLA Models', 'Gazebo', 'LangChain RAG'].map(t => (
            <span key={t} className={styles.techPill}>{t}</span>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="The definitive open textbook on Physical AI, humanoid robotics, ROS 2, NVIDIA Isaac, and VLA models."
    >
      <HomepageHero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
