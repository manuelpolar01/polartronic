/**
 * useUIStrings.js — v3
 *
 * Prioridad de idioma:
 *  1. langOverride (pasado explícitamente al hook)
 *  2. brand.language (lo que el admin configuró en el panel)
 *  3. window.__SITE_LANGUAGE__ (ya resuelto por applyBrandColors)
 *  4. navigator.language del visitante (detección automática por país/browser)
 *  5. DEFAULT_LANGUAGE ('it') como último fallback
 *
 * Esto significa:
 *  - Si el admin configuró español → todos ven español
 *  - Si el admin NO configuró idioma → el visitante ve el idioma de su browser
 *  - Si el browser del visitante no está soportado → italiano por defecto
 */

import { useState, useEffect, useMemo } from 'react'
import { getStrings, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/uiStrings'

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map(l => l.code)

function detectBrowserLang() {
  if (typeof navigator === 'undefined') return null
  const lang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase()
  return SUPPORTED_CODES.includes(lang) ? lang : null
}

function resolveLang(themeLang) {
  // 1. Idioma pasado directamente
  if (themeLang && SUPPORTED_CODES.includes(themeLang)) return themeLang

  // 2. Variable global (seteada por applyBrandColors)
  if (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) {
    const wl = window.__SITE_LANGUAGE__
    if (SUPPORTED_CODES.includes(wl)) return wl
  }

  // 3. Idioma del navegador del visitante
  const browserLang = detectBrowserLang()
  if (browserLang) return browserLang

  // 4. Fallback
  return DEFAULT_LANGUAGE
}

export function useUIStrings(brand = null, langOverride = null) {
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