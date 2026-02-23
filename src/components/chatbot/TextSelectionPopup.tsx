/**
 * TextSelectionPopup — shows "Ask AI" button when user selects text on a doc page.
 * Dispatches a custom event that FloatingChatbot listens to.
 */
import React, { useState, useEffect } from 'react';
import styles from './TextSelectionPopup.module.css';

interface PopupState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

export default function TextSelectionPopup(): React.JSX.Element | null {
  const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0, text: '' });

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      // Ignore clicks inside the chatbot panel or popup itself
      const target = e.target as Element;
      if (target?.closest?.('[data-chatbot]') || target?.closest?.('[data-text-popup]')) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? '';

        if (text.length < 15) {
          setPopup(p => ({ ...p, visible: false }));
          return;
        }

        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPopup({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 50,
            text,
          });
        }
      }, 20);
    }

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Element;
      if (!target?.closest?.('[data-text-popup]')) {
        setPopup(p => ({ ...p, visible: false }));
      }
    }

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  function handleAskAI() {
    window.dispatchEvent(
      new CustomEvent('physai:askabout', { detail: { text: popup.text } })
    );
    setPopup(p => ({ ...p, visible: false }));
    window.getSelection()?.removeAllRanges();
  }

  if (!popup.visible) return null;

  return (
    <div
      data-text-popup="true"
      className={styles.popup}
      style={{ left: popup.x, top: popup.y }}
    >
      <div className={styles.arrow} />
      <button className={styles.askBtn} onClick={handleAskAI}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L14.4 8.6L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.6 8.6L12 2Z"
            stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
        </svg>
        Ask AI about this
      </button>
    </div>
  );
}
