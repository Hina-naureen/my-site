/**
 * UrduContext — global language toggle (en | ur).
 * Persists choice in localStorage. isTranslating is set by UrduTranslator
 * while the /api/translate call is in flight.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'ur';

interface UrduContextValue {
  lang: Lang;
  urduMode: boolean;          // convenience alias: lang === 'ur'
  isTranslating: boolean;
  setIsTranslating: (v: boolean) => void;
  toggleUrdu: () => void;
}

const UrduContext = createContext<UrduContextValue | null>(null);

export function UrduProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Rehydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      if (localStorage.getItem('urdu_mode') === 'true') setLang('ur');
    } catch { /* SSR / private browsing */ }
  }, []);

  const toggleUrdu = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'ur' : 'en';
      try { localStorage.setItem('urdu_mode', String(next === 'ur')); } catch {}
      return next;
    });
  }, []);

  return (
    <UrduContext.Provider value={{
      lang,
      urduMode: lang === 'ur',
      isTranslating,
      setIsTranslating,
      toggleUrdu,
    }}>
      {children}
    </UrduContext.Provider>
  );
}

export function useUrdu(): UrduContextValue {
  const ctx = useContext(UrduContext);
  if (!ctx) throw new Error('useUrdu must be used inside <UrduProvider>');
  return ctx;
}
