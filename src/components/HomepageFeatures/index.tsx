/**
 * Physical AI Textbook — Module Feature Cards
 * Replaces default Docusaurus feature placeholders with
 * the actual six textbook modules.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// ── Module data ───────────────────────────────────────────────────────────────

interface Module {
  num: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  color: string;
}

const MODULES: Module[] = [
  {
    num: '01',
    title: 'Sensors & Perception',
    description:
      'LiDAR, depth cameras, IMUs, and GPS. From raw sensor data to processed perception pipelines that power real-world robots.',
    tags: ['LiDAR', 'Point Clouds', 'IMU', 'SLAM'],
    href: '/docs/intro',
    color: '#16a34a',
  },
  {
    num: '02',
    title: 'ROS 2 Fundamentals',
    description:
      'Nodes, topics, services, and actions. Build the middleware backbone of your robot using the industry-standard ROS 2 and Nav2 navigation stack.',
    tags: ['ROS 2', 'Nav2', 'DDS', 'Launch Files'],
    href: '/docs/intro',
    color: '#0ea5e9',
  },
  {
    num: '03',
    title: 'Simulation & Digital Twins',
    description:
      'Gazebo world-building, sensor simulation, and Unity visualization. Master sim-to-real transfer for safe, scalable robot development.',
    tags: ['Gazebo', 'Digital Twin', 'Unity', 'Sim-to-Real'],
    href: '/docs/intro',
    color: '#8b5cf6',
  },
  {
    num: '04',
    title: 'NVIDIA Isaac Sim',
    description:
      'Photorealistic robot simulation for synthetic data generation at scale. Isaac ROS VSLAM, sensor models, and automated data pipelines.',
    tags: ['Isaac Sim', 'Synthetic Data', 'VSLAM', 'Isaac ROS'],
    href: '/docs/intro',
    color: '#f59e0b',
  },
  {
    num: '05',
    title: 'VLA Models & AI Planning',
    description:
      'Vision-Language-Action models that bridge natural language and robot control. Whisper voice interface and LLM-to-ROS action bridges.',
    tags: ['VLA', 'LLM', 'Whisper', 'Transformers'],
    href: '/docs/intro',
    color: '#ef4444',
  },
  {
    num: '06',
    title: 'Capstone Project',
    description:
      'Integrate everything: build a fully autonomous humanoid robot with ROS 2, VLA models, NVIDIA Isaac, and real-world deployment.',
    tags: ['Capstone', 'Humanoid', 'Deployment', 'Integration'],
    href: '/docs/intro',
    color: '#22c55e',
  },
];

// ── Module Card ───────────────────────────────────────────────────────────────

function ModuleCard({ mod }: { mod: Module }): React.JSX.Element {
  return (
    <Link to={mod.href} className={styles.card} style={{ '--accent': mod.color } as React.CSSProperties}>
      <div className={styles.cardHeader}>
        <span className={styles.moduleNum} style={{ color: mod.color }}>
          Module {mod.num}
        </span>
        <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className={styles.cardTitle}>{mod.title}</h3>
      <p className={styles.cardDesc}>{mod.description}</p>

      <div className={styles.tags}>
        {mod.tags.map(t => (
          <span key={t} className={styles.tag} style={{ borderColor: `${mod.color}33`, color: mod.color }}>
            {t}
          </span>
        ))}
      </div>

      <div className={styles.cardGlow} aria-hidden="true" style={{ background: `${mod.color}18` }} />
    </Link>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Curriculum Overview</h2>
        <p className={styles.sectionSubtitle}>
          Six production-ready modules — from sensors to full autonomy.
        </p>
      </div>

      <div className={styles.grid}>
        {MODULES.map(mod => (
          <ModuleCard key={mod.num} mod={mod} />
        ))}
      </div>
    </section>
  );
}
