/**
 * UrduTranslator — side-effect-only component mounted on every doc page.
 *
 * When urduMode is ON:
 *   1. Adds dir="rtl" to <html> and the "urdu-mode" class to <body>.
 *      CSS in custom.css scopes RTL to `article` only — sidebar and navbar
 *      are explicitly reset to LTR.
 *   2. Collects ALL chapter headings (h1–h4), paragraphs, and list items
 *      from the doc article, in batches of 50.
 *   3. Sends each batch to POST /api/translate (dedicated endpoint, no RAG).
 *   4. Replaces each element's content in-place:
 *        - Plain text elements  → el.textContent  (fast, safe)
 *        - Elements with inline children (<strong>, <a>, etc.)
 *                                → el.innerHTML   (preserves restore fidelity)
 *        Original content is stored in data-en / data-en-html attributes.
 *   5. Caches translations per pathname (text-pair map) so navigating back
 *      to the same page applies instantly with no API call.
 *
 * When urduMode is OFF: restores every translated element to its original
 * content and removes dir/class from the document.
 *
 * Returns null — no rendered output.
 */
import { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useUrdu } from '@site/src/context/UrduContext';

const API_URL = 'http://localhost:8000/api/translate';

// Max items per API call (backend TranslateRequest.texts max_length = 60)
const BATCH_SIZE = 50;

// ── Selectors ──────────────────────────────────────────────────────────────

const TARGET_SELECTORS = 'h1, h2, h3, h4, h5, p, li';

const SKIP_ANCESTORS = [
  '[class*="codeBlock"]',
  '[class*="tableOfContents"]',
  '[class*="tocCollapsible"]',
  '[class*="pagination"]',
  'pre', 'code', 'nav', 'footer',
  '.navbar', '.breadcrumbs', '.theme-doc-sidebar-container',
].join(', ');

// ── Text-pair cache: pathname → Map<englishText, urduText> ─────────────────

const translationCache = new Map<string, Map<string, string>>();

// ── DOM helpers ────────────────────────────────────────────────────────────

function getArticle(): Element | null {
  return (
    document.querySelector('article') ??
    document.querySelector('[class*="docItemContainer"]') ??
    document.querySelector('main')
  );
}

function hasChildElements(el: Element): boolean {
  return Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
}

function collectTargets(article: Element): Element[] {
  const result: Element[] = [];
  for (const el of Array.from(article.querySelectorAll(TARGET_SELECTORS))) {
    const text = el.textContent?.trim() ?? '';
    if (text.length < 3) continue;
    if (el.closest(SKIP_ANCESTORS)) continue;
    if (el.hasAttribute('data-en') || el.hasAttribute('data-en-html')) continue;
    result.push(el);
  }
  return result;
}

function applyUrdu(el: Element, urduText: string) {
  if (hasChildElements(el)) {
    el.setAttribute('data-en-html', el.innerHTML);
    el.innerHTML = urduText;
  } else {
    el.setAttribute('data-en', el.textContent ?? '');
    el.textContent = urduText;
  }
  el.setAttribute('lang', 'ur');
}

function restoreEnglish(el: Element) {
  const origHtml = el.getAttribute('data-en-html');
  if (origHtml !== null) {
    el.innerHTML = origHtml;
    el.removeAttribute('data-en-html');
    el.removeAttribute('lang');
    return;
  }
  const orig = el.getAttribute('data-en');
  if (orig === null) return;
  el.textContent = orig;
  el.removeAttribute('data-en');
  el.removeAttribute('lang');
}

// ── API ────────────────────────────────────────────────────────────────────

async function fetchBatch(texts: string[]): Promise<string[]> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target_lang: 'ur' }),
  });
  if (!res.ok) return texts;
  const data = await res.json();
  if (!Array.isArray(data.translations)) return texts;
  return texts.map((orig, i) => {
    const v = data.translations[i];
    return typeof v === 'string' && v.trim() ? v : orig;
  });
}

async function fetchTranslations(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  const results: string[] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      const translated = await fetchBatch(batch);
      results.push(...translated);
    } catch {
      results.push(...batch);
    }
  }
  return results;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function UrduTranslator(): null {
  const { urduMode, setIsTranslating } = useUrdu();
  const { pathname } = useLocation();

  // ── RTL: set on <html>, scope to article via CSS ────────────────────────
  useEffect(() => {
    if (urduMode) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.classList.add('urdu-mode');
    } else {
      document.documentElement.removeAttribute('dir');
      document.body.classList.remove('urdu-mode');
    }
  }, [urduMode]);

  // ── Translation ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const article = getArticle();
      if (!article) return;

      if (!urduMode) {
        article.querySelectorAll('[data-en], [data-en-html]').forEach(restoreEnglish);
        return;
      }

      const elements = collectTargets(article);
      if (elements.length === 0) return;

      const texts = elements.map(el => el.textContent?.trim() ?? '');

      const cached = translationCache.get(pathname);
      if (cached) {
        elements.forEach((el, i) => {
          const urdu = cached.get(texts[i]);
          if (urdu !== undefined) applyUrdu(el, urdu);
        });
        return;
      }

      setIsTranslating(true);
      try {
        const translations = await fetchTranslations(texts);
        if (cancelled) return;

        const pageMap = new Map<string, string>();
        elements.forEach((el, i) => {
          const urdu = translations[i];
          if (!urdu) return;
          applyUrdu(el, urdu);
          pageMap.set(texts[i], urdu);
        });
        translationCache.set(pathname, pageMap);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [urduMode, pathname, setIsTranslating]);

  return null;
}
