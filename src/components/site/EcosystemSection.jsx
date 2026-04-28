/**
 * EcosystemSection.jsx — v5 FULLSCREEN SHELL
 * ─────────────────────────────────────────────────────────────────────────
 * Al clicar una card:
 *   - Se hay detailHtml → abre overlay FULLSCREEN con barra Polartronic
 *       La barra solo tiene: Logo | Nombre del eco | "← Volver" | "Hablemos →"
 *       El iframe NO tiene ningún botón, formulario ni hamburguesa interno
 *       (son bloqueados via CSS injection + sandbox)
 *   - Si no hay detailHtml → drawer lateral con contenido automático (fallback)
 *
 * IDIOMA: useUIStrings(brand) — 100% localizado.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'

// ── Helpers ───────────────────────────────────────────────────────────
function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// ─────────────────────────────────────────────────────────────────────
// FULLSCREEN SHELL — overlay fullscreen con barra Polartronic minima
// ─────────────────────────────────────────────────────────────────────
function EcosystemFullscreen({ eco, brand, onClose, t }) {
  const iframeRef = useRef(null)
  const primary   = brand?.primary || '#ff3c3c'
  const brandName = brand?.logo ? null : (brand?.name || 'POLARTRONIC')
  const brandLogo = brand?.logo || ''

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  /**
   * Build iframe srcDoc:
   * - Wraps fragment in full HTML if needed
   * - Injects CSS that hides ALL buttons, forms, nav, hamburgers, CTAs
   *   that are INSIDE the HTML (clean demo commercial template)
   */
  function buildSrcDoc(html) {
    // CSS injected into the iframe to strip all interactive elements
    const stripCSS = `
      <style id="polartronic-strip">
        /* Hide all interactive / navigation elements inside the demo */
        button,
        input[type="submit"],
        input[type="button"],
        input[type="reset"],
        form,
        nav,
        .nav, .navbar, .navigation,
        .hamburger, .menu-toggle, .burger, .menu-btn,
        [class*="hamburger"], [class*="burger"], [id*="hamburger"],
        [class*="menu-btn"], [id*="menu-btn"],
        footer a[href*="contact"], footer a[href*="whatsapp"],
        a[href^="mailto"], a[href^="tel"], a[href^="wa.me"], a[href^="https://wa.me"],
        a[href*="whatsapp"], a[href*="contacto"], a[href*="contact"],
        a[href*="reserva"], a[href*="book"], a[href*="prenotazione"],
        [class*="cta"], [class*="btn"], [id*="cta"], [id*="btn"],
        .cta, .btn, .button,
        .contact-form, .booking-form, [class*="form"],
        textarea, select
        {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        /* Disable all links to prevent navigation away */
        a { pointer-events: none !important; cursor: default !important; }
        /* Remove scroll bar from iframe body */
        html, body { overflow-x: hidden; }
      </style>
    `

    if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
      // Full HTML — inject strip CSS into <head>
      return html.replace(/<\/head>/i, stripCSS + '</head>')
    }
    // Fragment — wrap with full HTML + strip CSS
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}</style>
  ${stripCSS}
</head>
<body>${html}</body>
</html>`
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      background: '#080a0c',
      animation: 'ecoShellIn 0.32s cubic-bezier(0.23,1,0.32,1) both',
    }}>
      <style>{`
        @keyframes ecoShellIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .eco-shell-back:hover {
          background: rgba(255,255,255,0.12) !important;
          color: white !important;
        }
        .eco-shell-contact:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }
      `}</style>

      {/* ── POLARTRONIC SHELL BAR — minimal: Logo | Name | Back | Contact ── */}
      <div style={{
        flexShrink: 0,
        height: 58,
        background: 'rgba(5,5,5,0.97)',
        borderBottom: `1px solid ${primary}35`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 14,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {brandLogo ? (
            <img src={brandLogo} alt={brand?.name} style={{ height: 26, maxWidth: 120, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.35rem', color: primary, letterSpacing: 2, lineHeight: 1 }}>
              {brandName}
            </span>
          )}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Ecosystem name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'block',
          }}>
            {eco.category && <span style={{ color: primary, marginRight: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>{eco.category} ·</span>}
            {eco.title}
          </span>
        </div>

        {/* CTA: Hablemos → #contacto */}
        <a
          href="#contacto"
          onClick={(e) => {
            e.preventDefault()
            onClose()
            setTimeout(() => {
              const el = document.getElementById('contacto')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }, 220)
          }}
          className="eco-shell-contact"
          style={{
            flexShrink: 0,
            padding: '8px 18px',
            background: primary,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: `0 0 16px ${primary}30`,
            whiteSpace: 'nowrap',
          }}
        >
          {t.ecosystems?.ctaContact || 'Hablemos'} →
        </a>

        {/* Back button */}
        <button
          onClick={onClose}
          className="eco-shell-back"
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 5,
            whiteSpace: 'nowrap',
          }}
        >
          ← {t.ecosystems?.close || 'Volver'}
        </button>
      </div>

      {/* ── IFRAME — sandboxed demo, no interactive elements ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <iframe
          ref={iframeRef}
          title={`${eco.title} — demo`}
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            background: 'white',
          }}
          srcDoc={buildSrcDoc(eco.detailHtml || '')}
        />
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div style={{
        flexShrink: 0,
        display: 'none',
        padding: '10px 16px',
        background: 'rgba(5,5,5,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        gap: 10,
      }}
        className="eco-shell-mobile-bar"
      >
        <style>{`
          @media (max-width: 640px) {
            .eco-shell-mobile-bar { display: flex !important; }
          }
        `}</style>
        <a
          href="#contacto"
          onClick={(e) => {
            e.preventDefault()
            onClose()
            setTimeout(() => {
              const el = document.getElementById('contacto')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }, 220)
          }}
          style={{
            flex: 1, padding: '12px', background: primary,
            color: 'white', border: 'none', borderRadius: 8,
            fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
            textDecoration: 'none', textAlign: 'center', cursor: 'pointer',
            letterSpacing: 0.8,
          }}
        >
          {t.ecosystems?.ctaContact || 'Hablemos'} →
        </a>
        <button
          onClick={onClose}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          ← {t.ecosystems?.close || 'Volver'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// FALLBACK DRAWER — when no detailHtml
// ─────────────────────────────────────────────────────────────────────
function EcosystemDrawer({ eco, primary, onClose, t, projects = [] }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const relatedProjects = projects.filter(p => {
    const pInd = (p.industry || p.category || '').toLowerCase()
    const eCat = (eco.category || eco.title || '').toLowerCase()
    return pInd && eCat && (pInd.includes(eCat.split(' ')[0]) || eCat.includes(pInd.split(' ')[0]))
  }).slice(0, 3)

  const features = parseFeatures(eco.features)

  return (
    <>
      <style>{`
        @keyframes drawerIn { from { transform: translateX(100%); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        .eco-drawer-scroll::-webkit-scrollbar { width: 3px; }
        .eco-drawer-scroll::-webkit-scrollbar-thumb { background: ${primary}40; border-radius: 2px; }
        .eco-drawer-cta1:hover { opacity: 0.88 !important; transform: translateY(-1px) !important; }
        .eco-drawer-cta2:hover { border-color: ${primary} !important; color: ${primary} !important; }
      `}</style>

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'backdropIn 0.3s ease both' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8100, width: 'min(520px, 92vw)', background: '#0a0a0a', borderLeft: `1px solid ${primary}25`, display: 'flex', flexDirection: 'column', animation: 'drawerIn 0.38s cubic-bezier(0.23,1,0.32,1) both', boxShadow: `-24px 0 80px rgba(0,0,0,0.6)` }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {eco.image && (
            <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: `1px solid ${primary}30` }}>
              <img src={eco.image} alt={eco.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {eco.category && <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2.5, color: primary, marginBottom: 4 }}>{eco.category}</div>}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>{eco.title}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', lineHeight: 1.5 }}>{t.ecosystems?.drawerSubtitle || 'Cómo trabajamos este sector'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>✕</button>
        </div>

        {/* Price */}
        {eco.price && (
          <div style={{ flexShrink: 0, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: primary }}>{eco.price}</span>
            {eco.period && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{eco.period}</span>}
          </div>
        )}

        {/* Scrollable content */}
        <div className="eco-drawer-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 24px 8px' }}>
          {eco.desc && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>{eco.desc}</p>}

          {/* Related projects */}
          {relatedProjects.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                {t.ecosystems?.successCases || 'Casos de éxito'}
              </div>
              {relatedProjects.map((proj, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', marginBottom: 8 }}>
                  {proj.image && <div style={{ width: 40, height: 40, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}><img src={proj.image} alt={proj.client} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{proj.client || proj.title}</div>
                    {proj.results && <div style={{ fontSize: 11, color: primary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>▲ {proj.results.split('·')[0].trim()}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                {t.ecosystems?.benefits || 'Beneficios incluidos'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    <span style={{ color: primary, flexShrink: 0, fontWeight: 800, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {eco.extraText && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>{eco.extraText}</p>}
        </div>

        {/* Footer CTAs */}
        <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.4)', display: 'flex', gap: 10 }}>
          <a href="#contacto" onClick={onClose} className="eco-drawer-cta1" style={{ flex: 1, padding: '13px 20px', background: primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {t.ecosystems?.ctaContact || 'Hablemos'} →
          </a>
          <a href="#proyectos" onClick={onClose} className="eco-drawer-cta2" style={{ flex: 1, padding: '13px 20px', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {t.ecosystems?.ctaProjects || 'Ver proyectos'} →
          </a>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ECOSYSTEM CARD
// ─────────────────────────────────────────────────────────────────────
function EcosystemCard({ eco, idx, primary, t, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const features   = parseFeatures(eco.features).slice(0, 3)
  const hasLanding = !!(eco.detailHtml && eco.detailHtml.trim())

  return (
    <div
      onClick={() => onOpen(idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        border: eco.featured
          ? `1px solid ${primary}50`
          : hovered ? `1px solid ${primary}55` : '1px solid rgba(255,255,255,0.08)',
        background: eco.featured
          ? `${primary}08`
          : hovered ? `${primary}04` : 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${primary}30` : 'none',
        position: 'relative',
      }}
    >
      {eco.featured && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: primary, color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20 }}>
          {t.ecosystems?.featured || '★ Destacado'}
        </div>
      )}

      {eco.image && (
        <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
          <img src={eco.image} alt={eco.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: hovered ? 'brightness(0.65)' : 'brightness(0.55)', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: `2px solid ${primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: primary, transform: hovered ? 'scale(1)' : 'scale(0.7)', transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)' }}>
              {hasLanding ? '↗' : '→'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '18px 20px' }}>
        <div style={{ color: primary, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>{eco.category}</div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>{eco.title}</h3>
        {eco.price && (
          <div style={{ color: primary, fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>
            {eco.price}
            {eco.period && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}> {eco.period}</span>}
          </div>
        )}
        {eco.desc && <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>{eco.desc}</p>}
        {features.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                <span style={{ color: primary, flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 4, fontSize: 11, color: hovered ? primary : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s', fontWeight: hovered ? 700 : 400 }}>
          {hasLanding ? (t.ecosystems?.viewDetail || 'Ver detalle') + ' ↗' : (t.ecosystems?.viewDetail || 'Ver detalle') + ' →'}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────
export default function EcosystemSection({ ecosystems, brand, projects = [] }) {
  const [selected, setSelected] = useState(null)
  const t = useUIStrings(brand)

  if (!ecosystems?.length) return null

  const selectedEco = selected !== null ? ecosystems[selected] : null
  const primary     = brand?.primary || '#ff3c3c'
  const hasLanding  = selectedEco && !!(selectedEco.detailHtml && selectedEco.detailHtml.trim())

  return (
    <section id="ecosistemas" style={{ padding: '100px 6%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          {t.ecosystems?.eyebrow || 'Grupos Partners'}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.ecosystems?.headingPrefix || 'Nuestras'}{' '}
          <span style={{ color: primary }}>{t.ecosystems?.heading || 'Membresías'}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {ecosystems.map((eco, idx) => (
          <EcosystemCard key={eco.id || idx} eco={eco} idx={idx} primary={primary} t={t} onOpen={setSelected} />
        ))}
      </div>

      {/* Fullscreen shell (has detailHtml) */}
      {selectedEco && hasLanding && (
        <EcosystemFullscreen
          eco={selectedEco}
          brand={brand}
          onClose={() => setSelected(null)}
          t={t}
        />
      )}

      {/* Fallback drawer (no detailHtml) */}
      {selectedEco && !hasLanding && (
        <EcosystemDrawer
          eco={selectedEco}
          primary={primary}
          onClose={() => setSelected(null)}
          t={t}
          projects={projects}
        />
      )}
    </section>
  )
}