/**
 * Physical AI Textbook — Homepage Feature Cards
 * Three core pillars: ROS 2, NVIDIA Isaac, VLA
 */
import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// ── Feature data ──────────────────────────────────────────────────────────────

interface Feature {
  icon: React.JSX.Element;
  title: string;
  description: string;
  tags: string[];
  href: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'ROS 2 & Robotics Brain',
    description:
      'Master the Robot Operating System 2 ecosystem. Build intelligent robot brains with nodes, topics, services, Nav2 navigation, and real-time control architectures.',
    tags: ['ROS 2', 'Nav2', 'DDS', 'Autonomy'],
    href: '/docs/ros2-intro',
    color: '#0ea5e9',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'NVIDIA Isaac & Simulation',
    description:
      'Photorealistic robot simulation for synthetic data generation at scale. Master Isaac Sim, Isaac ROS, and digital twin workflows for safe sim-to-real transfer.',
    tags: ['Isaac Sim', 'Isaac ROS', 'Synthetic Data', 'Sim-to-Real'],
    href: '/docs/isaac-sim-synthetic-data',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Vision Language Action (VLA)',
    description:
      'Bridge natural language and robot control with state-of-the-art VLA models. Enable robots to understand, reason, and act from visual and linguistic inputs.',
    tags: ['VLA', 'Transformers', 'LLM', 'Embodied AI'],
    href: '/docs/vla-overview',
    color: '#8b5cf6',
  },
];

// ── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: Feature }): React.JSX.Element {
  return (
    <Link
      to={feature.href}
      className={styles.card}
      style={{ '--accent': feature.color } as React.CSSProperties}
    >
      <div
        className={styles.iconBadge}
        style={{ color: feature.color, background: `${feature.color}18` }}
      >
        {feature.icon}
      </div>

      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{feature.title}</h3>
        <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className={styles.cardDesc}>{feature.description}</p>

      <div className={styles.tags}>
        {feature.tags.map(t => (
          <span key={t} className={styles.tag}
            style={{ borderColor: `${feature.color}40`, color: feature.color }}>
            {t}
          </span>
        ))}
      </div>

      <div className={styles.cardGlow} aria-hidden="true"
        style={{ background: `${feature.color}12` }} />
    </Link>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Core Pillars</h2>
        <p className={styles.sectionSubtitle}>
          Three foundational domains powering the future of embodied intelligence.
        </p>
      </div>

      <div className={styles.featureGrid}>
        {FEATURES.map(f => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </section>
  );
}
