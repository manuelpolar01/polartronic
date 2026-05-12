/**
 * translate.js
 * ─────────────────────────────────────────────────────────────────────────
 * Traducción gratuita via Google Translate endpoint no oficial.
 * Sin API key. Mismo endpoint que usa la extensión de Chrome.
 *
 * REGLAS:
 *  - Cache en sessionStorage → una sola petición por texto+lang por sesión
 *  - Si sourceLang === targetLang → devuelve el texto original sin llamar a la API
 *  - Si falla la API → devuelve el texto original (fallback silencioso)
 *  - Textos vacíos, null o undefined → devuelve '' sin llamar a la API
 *  - Batching: traduce arrays de strings en una sola request
 */

const CACHE_PREFIX = 'pt_tr_'

function cacheKey(text, from, to) {
  // Clave corta para sessionStorage
  return `${CACHE_PREFIX}${to}_${btoa(encodeURIComponent(text)).slice(0, 40)}`
}

function fromCache(text, from, to) {
  try {
    const raw = sessionStorage.getItem(cacheKey(text, from, to))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function toCache(text, from, to, translated) {
  try {
    sessionStorage.setItem(cacheKey(text, from, to), JSON.stringify(translated))
  } catch { /* sessionStorage lleno — ignorar */ }
}

/**
 * translateText — traduce un string individual
 * @param {string} text       Texto a traducir
 * @param {string} targetLang Código ISO 639-1 destino (ej: 'en', 'es', 'fr')
 * @param {string} sourceLang Código ISO 639-1 origen (default: 'auto')
 * @returns {Promise<string>} Texto traducido o texto original si falla
 */
export async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || typeof text !== 'string' || !text.trim()) return text || ''

  // Si origen y destino son el mismo idioma → sin traducción
  if (sourceLang !== 'auto' && sourceLang === targetLang) return text

  // Revisar cache
  const cached = fromCache(text, sourceLang, targetLang)
  if (cached !== null) return cached

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) return text

    const data = await res.json()
    // La respuesta es un array anidado: [[["translated","original",...],...],...]
    const translated = data?.[0]
      ?.map(chunk => chunk?.[0] ?? '')
      .join('') || text

    toCache(text, sourceLang, targetLang, translated)
    return translated
  } catch {
    // API inalcanzable → texto original
    return text
  }
}

/**
 * translateBatch — traduce múltiples strings en paralelo
 * Usa Promise.allSettled para que un fallo individual no cancele los demás
 * @param {string[]} texts
 * @param {string}   targetLang
 * @param {string}   sourceLang
 * @returns {Promise<string[]>}
 */
export async function translateBatch(texts, targetLang, sourceLang = 'auto') {
  if (!texts || !texts.length) return []
  if (sourceLang !== 'auto' && sourceLang === targetLang) return texts

  const results = await Promise.allSettled(
    texts.map(t => translateText(t, targetLang, sourceLang))
  )

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : texts[i]
  )
}

/**
 * shouldTranslate — decide si hay que traducir
 * Si el idioma configurado en el panel es el mismo en que está escrito el contenido
 * (sourceLang) → no hace falta traducir nada.
 */
export function shouldTranslate(targetLang, sourceLang = 'auto') {
  if (!targetLang) return false
  if (sourceLang === 'auto') return true
  return sourceLang !== targetLang
}