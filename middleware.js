/**
 * middleware.js — Polartronic Studio
 * RUTA: middleware.js (raíz del proyecto)
 *
 * Detecta bots (Googlebot, etc.) e inyecta SEO completo y robusto:
 *  - Lee idioma, nombre y tagline desde Firebase Firestore en tiempo real
 *  - Elige las meta tags en el idioma configurado en el panel admin
 *  - Keywords específicas para diferenciarse de competidores con mismo nombre
 *  - Schema.org completo tipo ProfessionalService
 */

export const config = { matcher: ['/', '/index.html'] }

// ─── Config ───────────────────────────────────────────────────────────
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'polartronic-27bf7'
const SITE_URL            = 'https://polartronic.app-customer.com'
const GOOGLE_VERIFICATION = 'fVDBv_QoaC2pSBLcWuHXeEBP-uhk2ym4o0dXK1zx15U'

// ─── Bots que deben recibir el HTML con SEO ───────────────────────────
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
  'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
]

// ─── SEO por idioma ───────────────────────────────────────────────────
// Keywords específicas de nicho para diferenciarse de Polartronic China
// y posicionarse en el mercado correcto (agencia digital latina en Europa)
const SEO_BY_LANG = {
  it: {
    lang:        'it',
    locale:      'it_IT',
    title:       (name) => `${name} — Studio Web & Branding Digitale in Italia`,
    description: (name, tagline) =>
      `${tagline || 'Studio digitale creativo'} con radici in Argentina e presenza in Europa. Siti web professionali, branding e sviluppo digitale di alto impatto per aziende italiane. Creatività latina, standard europei.`,
    keywords:    'studio web Italia, siti web professionali Milano, branding digitale italiano, agenzia web Argentina Europa, sviluppo web Italia, design web professionale, web agency latina Europa, siti web aziendali Italia',
    serviceType: ['Web Design', 'Branding', 'Sviluppo Web', 'Marketing Digitale'],
    areaServed:  ['Italia', 'Europa'],
  },
  es: {
    lang:        'es',
    locale:      'es_ES',
    title:       (name) => `${name} — Diseño Web & Branding Digital`,
    description: (name, tagline) =>
      `${tagline || 'Estudio digital creativo'} con raíces en Argentina y presencia en Europa. Diseño web profesional, branding y desarrollo digital de alto impacto. Creatividad latina, estándares europeos.`,
    keywords:    'estudio web Italia, diseño web profesional, branding digital, agencia web Argentina Europa, desarrollo web Italia, diseño web empresas, web agency latina Europa',
    serviceType: ['Diseño Web', 'Branding', 'Desarrollo Web', 'Marketing Digital'],
    areaServed:  ['Italia', 'Europa'],
  },
  en: {
    lang:        'en',
    locale:      'en_GB',
    title:       (name) => `${name} — Web Design & Digital Branding Studio`,
    description: (name, tagline) =>
      `${tagline || 'Creative digital studio'} with roots in Argentina and presence in Europe. Professional web design, branding and digital development for European businesses. Latin creativity, European standards.`,
    keywords:    'web design studio Italy, professional websites, digital branding, Argentina Europe web agency, web development Italy, business web design, Latin web agency Europe',
    serviceType: ['Web Design', 'Branding', 'Web Development', 'Digital Marketing'],
    areaServed:  ['Italy', 'Europe'],
  },
  fr: {
    lang:        'fr',
    locale:      'fr_FR',
    title:       (name) => `${name} — Studio Web & Branding Digital`,
    description: (name, tagline) =>
      `${tagline || 'Studio créatif digital'} avec des racines en Argentine et une présence en Europe. Sites web professionnels, branding et développement digital de haute qualité.`,
    keywords:    'studio web Italie, sites web professionnels, branding digital, agence web Argentine Europe, développement web Italie',
    serviceType: ['Web Design', 'Branding', 'Développement Web', 'Marketing Digital'],
    areaServed:  ['Italie', 'Europe'],
  },
  de: {
    lang:        'de',
    locale:      'de_DE',
    title:       (name) => `${name} — Webdesign & Digitales Branding Studio`,
    description: (name, tagline) =>
      `${tagline || 'Kreatives Digital-Studio'} mit Wurzeln in Argentinien und Präsenz in Europa. Professionelle Webseiten, Branding und digitale Entwicklung für europäische Unternehmen.`,
    keywords:    'Webdesign Studio Italien, professionelle Webseiten, digitales Branding, Webagentur Argentinien Europa, Webentwicklung Italien',
    serviceType: ['Webdesign', 'Branding', 'Webentwicklung', 'Digitales Marketing'],
    areaServed:  ['Italien', 'Europa'],
  },
  pt: {
    lang:        'pt',
    locale:      'pt_PT',
    title:       (name) => `${name} — Studio Web & Branding Digital`,
    description: (name, tagline) =>
      `${tagline || 'Estúdio digital criativo'} com raízes na Argentina e presença na Europa. Sites profissionais, branding e desenvolvimento digital de alto impacto.`,
    keywords:    'estúdio web Itália, sites profissionais, branding digital, agência web Argentina Europa, desenvolvimento web Itália',
    serviceType: ['Web Design', 'Branding', 'Desenvolvimento Web', 'Marketing Digital'],
    areaServed:  ['Itália', 'Europa'],
  },
}

const DEFAULT_LANG = 'it'

// ─── Helpers ──────────────────────────────────────────────────────────
function isBot(userAgent = '') {
  const ua = userAgent.toLowerCase()
  return BOT_AGENTS.some(bot => ua.includes(bot))
}

function extractString(firestoreValue) {
  return firestoreValue?.stringValue || null
}

// ─── Leer configuración desde Firebase Firestore ──────────────────────
async function fetchSiteConfig() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/site/config`
    const res = await fetch(url)
    if (!res.ok) return null

    const data   = await res.json()
    const fields = data.fields || {}
    const brand  = fields.brand?.mapValue?.fields || {}

    return {
      name:     extractString(brand.name)     || 'Polartronic Studio',
      tagline:  extractString(brand.tagline)  || '',
      language: extractString(brand.language) || DEFAULT_LANG,
    }
  } catch {
    return null
  }
}

// ─── Middleware principal ─────────────────────────────────────────────
export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  if (!isBot(ua)) return

  // Leer datos reales de Firebase en tiempo real
  const config = await fetchSiteConfig()

  const name    = config?.name     || 'Polartronic Studio'
  const tagline = config?.tagline  || ''
  const lang    = config?.language || DEFAULT_LANG

  // Elegir SEO según idioma configurado en el panel admin
  const seo = SEO_BY_LANG[lang] || SEO_BY_LANG[DEFAULT_LANG]

  const title       = seo.title(name)
  const description = seo.description(name, tagline)
  const keywords    = seo.keywords
  const locale      = seo.locale
  const htmlLang    = seo.lang
  const serviceType = JSON.stringify(seo.serviceType)
  const areaServed  = JSON.stringify(seo.areaServed)

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords"    content="${keywords}" />
  <meta name="robots"      content="index, follow" />
  <link rel="canonical"    href="${SITE_URL}" />

  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url"         content="${SITE_URL}" />
  <meta property="og:site_name"   content="${name}" />
  <meta property="og:locale"      content="${locale}" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />

  <meta name="google-site-verification" content="${GOOGLE_VERIFICATION}" />
  <link rel="icon" type="image/png" href="/favicon.png" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "${name}",
    "url": "${SITE_URL}",
    "description": "${description}",
    "areaServed": ${areaServed},
    "serviceType": ${serviceType},
    "inLanguage": "${htmlLang}",
    "foundingLocation": {
      "@type": "Place",
      "name": "Buenos Aires, Argentina"
    },
    "knowsAbout": ["Web Design", "Branding", "Digital Marketing", "Web Development"]
  }
  <\/script>
</head>
<body>
  <h1>${name}</h1>
  <p>${description}</p>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}