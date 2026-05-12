/**
 * useTranslatedContent.js
 * ─────────────────────────────────────────────────────────────────────────
 * Hook React que traduce un objeto de contenido (o string simple)
 * al idioma activo configurado en el panel.
 *
 * COMPORTAMIENTO:
 *  - Mientras traduce → devuelve el contenido ORIGINAL (sin flash vacío)
 *  - Cuando termina   → devuelve el contenido TRADUCIDO
 *  - Si lang === sourceLang → devuelve original sin llamar a la API
 *  - Si la API falla  → devuelve original (silencioso)
 *  - Escucha el evento 'sitelang' para reaccionar al cambio de idioma
 *    en tiempo real sin recargar la página
 *
 * USO:
 *   // String simple
 *   const title = useTranslatedContent(hero.headline, brand)
 *
 *   // Objeto con múltiples campos
 *   const { headline, sub, badge } = useTranslatedContent(
 *     { headline: hero.headline, sub: hero.sub, badge: hero.badge },
 *     brand
 *   )
 *
 * PARÁMETROS:
 *   content    {string|object}  Texto o mapa de textos a traducir
 *   brand      {object}         Objeto brand del site (necesita brand.language)
 *   sourceLang {string}         Idioma en que está escrito el contenido.
 *                               Si no se especifica se usa brand.language como
 *                               idioma origen (el admin escribe en el lang activo
 *                               al momento de guardar — asumimos que no cambia).
 *                               Pasa 'auto' para detección automática.
 */

import { useState, useEffect, useRef } from 'react'
import { translateBatch, shouldTranslate } from '../lib/translate'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/uiStrings'

function resolveTargetLang(brand) {
  const supported = SUPPORTED_LANGUAGES.map(l => l.code)
  const fromBrand = brand?.language
  const fromWindow = typeof window !== 'undefined' ? window.__SITE_LANGUAGE__ : null

  const candidate = fromBrand || fromWindow || DEFAULT_LANGUAGE
  return supported.includes(candidate) ? candidate : DEFAULT_LANGUAGE
}

/**
 * Extrae todos los valores string de un objeto (un nivel de profundidad)
 * Ignora valores que no son string, arrays de objetos, etc.
 */
function extractStrings(content) {
  if (typeof content === 'string') return [content]
  if (typeof content !== 'object' || content === null) return []
  return Object.values(content).filter(v => typeof v === 'string' && v.trim())
}

/**
 * Reconstruye el objeto traducido dado el original y el array de traducciones
 */
function rebuildObject(original, keys, translations) {
  if (typeof original === 'string') return translations[0] ?? original
  const result = { ...original }
  let i = 0
  for (const key of keys) {
    if (typeof original[key] === 'string' && original[key].trim()) {
      result[key] = translations[i] ?? original[key]
      i++
    }
  }
  return result
}

export function useTranslatedContent(content, brand, sourceLang = 'auto') {
  const [translated, setTranslated] = useState(content)
  const abortRef = useRef(false)

  // Escuchar cambio de idioma en tiempo real
  const [langTick, setLangTick] = useState(0)
  useEffect(() => {
    const handler = () => setLangTick(t => t + 1)
    window.addEventListener('sitelang', handler)
    return () => window.removeEventListener('sitelang', handler)
  }, [])

  useEffect(() => {
    // Reset: mostrar original mientras se traduce (sin flash vacío)
    setTranslated(content)
    abortRef.current = false

    const targetLang = resolveTargetLang(brand)

    // Si no hace falta traducir → salir inmediatamente
    if (!shouldTranslate(targetLang, sourceLang)) return
    if (!content) return

    // Preparar textos a traducir
    const isString = typeof content === 'string'
    const keys = isString ? null : Object.keys(content).filter(
      k => typeof content[k] === 'string' && content[k].trim()
    )
    const texts = isString ? [content] : keys.map(k => content[k])

    if (!texts.length) return

    let cancelled = false

    translateBatch(texts, targetLang, sourceLang).then(results => {
      if (cancelled || abortRef.current) return
      if (isString) {
        setTranslated(results[0] ?? content)
      } else {
        setTranslated(rebuildObject(content, keys, results))
      }
    })

    return () => { cancelled = true }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Serializar content para comparación estable
    typeof content === 'string' ? content : JSON.stringify(content),
    brand?.language,
    langTick,
    sourceLang,
  ])

  return translated
}

/**
 * useTranslatedArray — para arrays de objetos (servicios, testimonios, etc.)
 * Traduce cada item del array de forma independiente y en paralelo.
 *
 * USO:
 *   const translatedServices = useTranslatedArray(services, ['title','desc'], brand)
 *
 * @param {object[]} items     Array de objetos
 * @param {string[]} fields    Campos a traducir en cada objeto
 * @param {object}   brand     Objeto brand
 * @param {string}   sourceLang
 */
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
      // Traducir todos los items en paralelo
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

      setTranslated(
        results.map((r, i) => r.status === 'fulfilled' ? r.value : items[i])
      )
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