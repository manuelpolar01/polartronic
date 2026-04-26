/**
 * useUIStrings.js — FIXED v2
 *
 * FIX IDIOMA (Problema 3):
 * useMemo no detecta cambios en window.__SITE_LANGUAGE__ porque es una
 * variable global, no estado React. Fix: useState + listener del custom
 * event 'sitelang' que LanguageTab dispara al guardar. Cuando el evento
 * llega, el hook re-calcula el idioma y todos los componentes que lo usan
 * se re-renderizan automáticamente con los strings correctos.
 */

import { useState, useEffect, useMemo } from 'react'
import { getStrings, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/uiStrings'

function resolveLang(themeLang) {
  const supported = SUPPORTED_LANGUAGES.map(l => l.code)

  if (themeLang && supported.includes(themeLang)) return themeLang

  if (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) {
    const wl = window.__SITE_LANGUAGE__
    if (supported.includes(wl)) return wl
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const bl = navigator.language.slice(0, 2).toLowerCase()
    if (supported.includes(bl)) return bl
  }

  return DEFAULT_LANGUAGE
}

export function useUIStrings(brand = null, langOverride = null) {
  // FIX: estado local que se actualiza cuando llega el custom event 'sitelang'
  const [globalLang, setGlobalLang] = useState(
    () => (typeof window !== 'undefined' ? window.__SITE_LANGUAGE__ : null)
  )

  useEffect(() => {
    const handler = (e) => {
      setGlobalLang(e.detail ?? window.__SITE_LANGUAGE__ ?? null)
    }
    window.addEventListener('sitelang', handler)
    return () => window.removeEventListener('sitelang', handler)
  }, [])

  const lang = useMemo(
    () => resolveLang(langOverride ?? brand?.language ?? globalLang ?? null),
    [brand?.language, langOverride, globalLang]
  )

  const t = useMemo(() => getStrings(lang), [lang])

  return t
}

export function resolveStrings(langOrBrand) {
  const lang = typeof langOrBrand === 'string'
    ? langOrBrand
    : resolveLang(langOrBrand?.language ?? null)
  return getStrings(lang)
}