/**
 * useTranslatedContent.js — v2
 *
 * NUEVO: resolveTargetLang detecta el idioma del browser del visitante
 * cuando el admin no configuró ningún idioma.
 *
 * Prioridad:
 *  1. brand.language (admin configuró) → siempre respetarlo
 *  2. window.__SITE_LANGUAGE__ (resuelto por applyBrandColors)
 *  3. navigator.language del browser del visitante
 *  4. DEFAULT_LANGUAGE ('it') como fallback
 */

import { useState, useEffect } from 'react'
import { translateBatch, shouldTranslate } from '../lib/translate'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/uiStrings'

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map(l => l.code)

function detectBrowserLang() {
  if (typeof navigator === 'undefined') return null
  const lang = (navigator.language || navigator.userLanguage || '')
    .slice(0, 2).toLowerCase()
  return SUPPORTED_CODES.includes(lang) ? lang : null
}

function resolveTargetLang(brand) {
  // 1. Admin configuró un idioma
  if (brand?.language && SUPPORTED_CODES.includes(brand.language)) {
    return brand.language
  }
  // 2. Variable global
  if (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) {
    const wl = window.__SITE_LANGUAGE__
    if (SUPPORTED_CODES.includes(wl)) return wl
  }
  // 3. Browser del visitante
  const browserLang = detectBrowserLang()
  if (browserLang) return browserLang
  // 4. Fallback
  return DEFAULT_LANGUAGE
}

export function useTranslatedContent(content, brand, sourceLang = 'auto') {
  const [translated, setTranslated] = useState(content)
  const [langTick, setLangTick] = useState(0)

  useEffect(() => {
    const handler = () => setLangTick(t => t + 1)
    window.addEventListener('sitelang', handler)
    return () => window.removeEventListener('sitelang', handler)
  }, [])

  useEffect(() => {
    setTranslated(content)
    if (!content) return

    const targetLang = resolveTargetLang(brand)
    if (!shouldTranslate(targetLang, sourceLang)) return

    const isString = typeof content === 'string'
    const keys = isString
      ? null
      : Object.keys(content).filter(k => typeof content[k] === 'string' && content[k].trim())
    const texts = isString ? [content] : keys.map(k => content[k])
    if (!texts.length) return

    let cancelled = false

    translateBatch(texts, targetLang, sourceLang).then(results => {
      if (cancelled) return
      if (isString) {
        setTranslated(results[0] ?? content)
      } else {
        const result = { ...content }
        let i = 0
        for (const key of keys) {
          if (typeof content[key] === 'string' && content[key].trim()) {
            result[key] = results[i] ?? content[key]
            i++
          }
        }
        setTranslated(result)
      }
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    typeof content === 'string' ? content : JSON.stringify(content),
    brand?.language,
    langTick,
    sourceLang,
  ])

  return translated
}

export function useTranslatedArray(items, fields, brand, sourceLang = 'auto') {
  const [translated, setTranslated] = useState(items)
  const [langTick, setLangTick] = useState(0)

  useEffect(() => {
    const handler = () => setLangTick(t => t + 1)
    window.addEventListener('sitelang', handler)
    return () => window.removeEventListener('sitelang', handler)
  }, [])

  useEffect(() => {
    setTranslated(items)
    if (!items || !items.length) return

    const targetLang = resolveTargetLang(brand)
    if (!shouldTranslate(targetLang, sourceLang)) return

    let cancelled = false

    async function run() {
      const promises = items.map(async item => {
        const texts = fields
          .filter(f => typeof item[f] === 'string' && item[f].trim())
          .map(f => item[f])
        if (!texts.length) return item

        const results = await translateBatch(texts, targetLang, sourceLang)
        const updated = { ...item }
        let i = 0
        for (const f of fields) {
          if (typeof item[f] === 'string' && item[f].trim()) {
            updated[f] = results[i] ?? item[f]
            i++
          }
        }
        return updated
      })

      const results = await Promise.allSettled(promises)
      if (cancelled) return
      setTranslated(results.map((r, i) => r.status === 'fulfilled' ? r.value : items[i]))
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(items?.map(i => fields.map(f => i[f]))),
    brand?.language,
    langTick,
    sourceLang,
  ])

  return translated
}