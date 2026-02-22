/**
 * TranslationSkeleton — shown while /api/translate is in flight.
 * Returns null when isTranslating is false — zero layout cost when idle.
 */
import React from 'react';
import { useUrdu } from '@site/src/context/UrduContext';
import styles from './TranslationSkeleton.module.css';

export default function TranslationSkeleton(): React.JSX.Element | null {
  const { isTranslating } = useUrdu();
  if (!isTranslating) return null;

  return (
    <>
      <div className={styles.rail} aria-hidden="true" />
      <div className={styles.banner} role="status" aria-live="polite">
        <span className={styles.pulse} aria-hidden="true" />
        <span>ترجمہ ہو رہا ہے…</span>
        <span className={styles.sub}>Translating chapter to Urdu</span>
      </div>
    </>
  );
}
