/**
 * UrduTranslator — RTL layout toggle.
 *
 * When Urdu mode is active this component adds the `urdu-mode` class to
 * <body>, which triggers the RTL CSS rules in custom.css (scoped to the
 * article element only — sidebar and navbar remain LTR).
 *
 * No API calls. No text translation. Pure CSS layout switch.
 * Returns null — renders nothing to the DOM.
 */
import { useEffect } from 'react';
import { useUrdu } from '@site/src/context/UrduContext';

export default function UrduTranslator(): null {
  const { urduMode } = useUrdu();

  useEffect(() => {
    if (urduMode) {
      document.body.classList.add('urdu-mode');
    } else {
      document.body.classList.remove('urdu-mode');
    }
    return () => {
      document.body.classList.remove('urdu-mode');
    };
  }, [urduMode]);

  return null;
}
