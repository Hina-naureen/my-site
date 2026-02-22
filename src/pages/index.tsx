import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

// Stats
const STATS = [
  { value: '6', label: 'Modules' },
  { value: '50+', label: 'Chapters' },
  { value: 'RAG', label: 'AI Powered' },
  { value: '∞', label: 'Free Access' },
];

// HERO SECTION
function HomepageHeader(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>

        {/* Badge */}
        <div className={styles.badge}>
          Enterprise Textbook | 2025 Edition
        </div>

        {/* TITLE */}
        <h1 className={styles.heroTitle}>
          Physical AI <br />
          <span className={styles.heroAccent}>
            Humanoid Robotics
          </span>
        </h1>

        {/* Subtitle */}
        <p className={styles.heroSubtitle}>
          AI Robotics learning platform — اردو + English
        </p>

        {/* STATS */}
        <div className={styles.stats}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className={styles.ctaRow}>
          <Link className={styles.ctaPrimary} to="/docs/intro">
            سیکھنا شروع کریں
          </Link>

          <Link className={styles.ctaSecondary} to="/docs/intro">
            ماڈیولز دیکھیں
          </Link>
        </div>

        {/* TECH STACK */}
        <div className={styles.techStack}>
          {['ROS 2','NVIDIA Isaac','VLA Models','Gazebo','LangChain RAG']
            .map((t) => (
              <span key={t} className={styles.techPill}>
                {t}
              </span>
            ))}
        </div>

      </div>
    </header>
  );
}

// MAIN PAGE
export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Humanoid Robotics, Physical AI, ROS2, NVIDIA Isaac Learning Platform">
      
      <HomepageHeader />

      <main>
        <HomepageFeatures />
      </main>

    </Layout>
  );
}
