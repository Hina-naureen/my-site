/**
 * UrduContext — global RTL layout toggle (en | ur).
 * Persists the user's preference in localStorage.
 * Urdu mode is a client-side RTL layout switch only — no API calls.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'ur';

interface UrduContextValue {
  lang: Lang;
  urduMode: boolean;   // convenience alias: lang === 'ur'
  toggleUrdu: () => void;
}

const UrduContext = createContext<UrduContextValue | null>(null);

export function UrduProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [lang, setLang] = useState<Lang>('en');

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
    <UrduContext.Provider value={{ lang, urduMode: lang === 'ur', toggleUrdu }}>
      {children}
    </UrduContext.Provider>
  );
}

export function useUrdu(): UrduContextValue {
  const ctx = useContext(UrduContext);
  if (!ctx) throw new Error('useUrdu must be used inside <UrduProvider>');
  return ctx;
}
