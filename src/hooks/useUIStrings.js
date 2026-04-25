/**
 * useUIStrings.js
 * ─────────────────────────────────────────────────────────────────────────
 * React hook that resolves UI strings for the currently configured language.
 *
 * Priority order:
 *   1. theme_config.language  (set by admin → saved in Firestore site/config)
 *   2. navigator.language     (browser locale, best-effort fallback)
 *   3. 'it'                   (hard default)
 *
 * Usage — site components:
 *   const t = useUIStrings(brand)      // brand = site.brand from useSiteData
 *   <h2>{t.services.heading}</h2>
 *
 * Usage — booking flow (receives language prop or falls back to hook):
 *   const t = useUIStrings(null, 'fr')
 *
 * Usage — no args (reads window.__SITE_LANGUAGE__ set by PublicSite):
 *   const t = useUIStrings()
 */

import { useMemo } from 'react'
import { getStrings, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/uiStrings'

/**
 * Resolve the best-match language code from various input sources.
 * @param {string|null} themeLang   - from brand.language or explicit prop
 * @returns {string}                - validated language code
 */
function resolveLang(themeLang) {
  const supported = SUPPORTED_LANGUAGES.map(l => l.code)

  // 1. Explicit theme language (admin-configured)
  if (themeLang && supported.includes(themeLang)) return themeLang

  // 2. Window-level flag set by PublicSite/AdminPanel (avoids prop drilling)
  if (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) {
    const wl = window.__SITE_LANGUAGE__
    if (supported.includes(wl)) return wl
  }

  // 3. Browser language (first two chars: 'it-IT' → 'it')
  if (typeof navigator !== 'undefined' && navigator.language) {
    const bl = navigator.language.slice(0, 2).toLowerCase()
    if (supported.includes(bl)) return bl
  }

  // 4. Hard default
  return DEFAULT_LANGUAGE
}

/**
 * @param {object|null} brand    - site.brand object (may contain brand.language)
 * @param {string|null} langOverride - explicit language code (e.g. from BookingFlow prop)
 */
export function useUIStrings(brand = null, langOverride = null) {
  const lang = useMemo(
    () => resolveLang(langOverride ?? brand?.language ?? null),
    [brand?.language, langOverride]
  )

  const t = useMemo(() => getStrings(lang), [lang])

  return t
}

/**
 * Non-hook version for use outside React (e.g. utility files, email templates).
 */
export function resolveStrings(langOrBrand) {
  const lang = typeof langOrBrand === 'string'
    ? langOrBrand
    : resolveLang(langOrBrand?.language ?? null)
  return getStrings(lang)
}