/**
 * EcosystemSection.jsx — v3 LANDING MODAL
 * ─────────────────────────────────────────────────────────────────────────
 * CAMBIO PRINCIPAL:
 *   Al hacer clic en una card, si `eco.detailHtml` está configurado,
 *   se abre un overlay fullscreen que renderiza ese HTML como una
 *   mini-landing page inmersiva (inspirada en la estructura King Barbes).
 *
 *   Si NO hay detailHtml → fallback al modal clásico (lista de beneficios).
 *
 * TODO LO DEMÁS INTACTO:
 *   - parseFeatures, useUIStrings, t.ecosystems.*
 *   - Upload de imágenes, idiomas, CRUD desde EcosystemsTab
 *   - Grid de cards, hover effects, badge destacado
 *   - Strings localizados (eyebrow, heading, headingPrefix, viewDetail, etc.)
 */

import { useState, useEffect, useCallback,useRef } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'

// ── Helpers ───────────────────────────────────────────────────────────
function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// ── Lock/unlock scroll del body ───────────────────────────────────────
function useBodyLock(active) {
  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [active])
}

// ─────────────────────────────────────────────────────────────────────
// LANDING MODAL — renderiza detailHtml como overlay fullscreen
// ─────────────────────────────────────────────────────────────────────
function LandingModal({ eco, primary, onClose }) {
  useBodyLock(true)

  // Inyectar estilos base en el iframe o en el div para que el HTML funcione
  // Usamos un <div> con dangerouslySetInnerHTML dentro de un contenedor aislado
  // para no contaminar el DOM de la app.
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'ecoLandingIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}
    >
      <style>{`
        @keyframes ecoLandingIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ecoLandingOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .eco-landing-close-btn:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: scale(1.08);
        }
        /* Estilos base que se inyectan en el contenedor del HTML externo */
        .eco-html-host * { box-sizing: border-box; }
        .eco-html-host img { max-width: 100%; }
        .eco-html-host a { color: inherit; }
      `}</style>

      {/* Barra superior — título + botón cerrar */}
      <div style={{
        flexShrink: 0,
        height: 56,
        background: 'rgba(10,10,10,0.95)',
        borderBottom: `1px solid ${primary}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {eco.image && (
            <img
              src={eco.image}
              alt={eco.title}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                objectFit: 'cover',
                border: `1px solid ${primary}40`,
              }}
            />
          )}
          <div>
            {eco.category && (
              <div style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: primary,
                lineHeight: 1,
              }}>
                {eco.category}
              </div>
            )}
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              marginTop: eco.category ? 2 : 0,
            }}>
              {eco.title}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="eco-landing-close-btn"
          aria-label="Cerrar"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            width: 36,
            height: 36,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Contenedor scrollable del HTML */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/*
          Renderizamos el HTML en un iframe sandboxed para aislamiento completo.
          allow-scripts permite ejecutar el JS interno del HTML (menú hamburguesa,
          animaciones, form submit, etc.).
          allow-same-origin permite que los fetch internos funcionen.
          allow-popups permite abrir links externos.
          allow-forms permite el submit del formulario.
        */}
        <iframe
          title={`${eco.title} — detalle`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 56px)',
            border: 'none',
            display: 'block',
            background: 'white',
          }}
          srcDoc={buildIframeSrcDoc(eco)}
        />
      </div>
    </div>
  )
}

/**
 * buildIframeSrcDoc
 * Envuelve el detailHtml del admin en un documento HTML completo con:
 *  - viewport meta tag
 *  - scroll-behavior smooth
 *  - reset básico
 * Si el HTML ya incluye <!DOCTYPE html>, lo usa tal cual.
 * Si es un fragmento, lo envuelve.
 */
function buildIframeSrcDoc(eco) {
  const html = eco.detailHtml || ''

  // Si ya es un documento HTML completo, usarlo directamente
  if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
    return html
  }

  // Si es un fragmento, envolverlo en un documento mínimo
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #333; }
    img { max-width: 100%; height: auto; }
    a { color: inherit; }
  </style>
</head>
<body>
${html}
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────
// MODAL CLÁSICO — fallback cuando no hay detailHtml
// (idéntico al modal de la v2, sin cambios)
// ─────────────────────────────────────────────────────────────────────
function ClassicModal({ eco, primary, onClose, t }) {
  useBodyLock(true)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const features = parseFeatures(eco.features)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'ecoModalIn 0.3s cubic-bezier(0.23,1,0.32,1) both',
      }}
    >
      <style>{`
        @keyframes ecoModalIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ecoModalCardIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d0d',
          border: `1px solid ${primary}30`,
          borderRadius: 20,
          maxWidth: 580,
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          animation: 'ecoModalCardIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'white', width: 32, height: 32, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {eco.image && (
          <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <img src={eco.image} alt={eco.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ color: primary, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
          {eco.category}
        </div>

        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'white' }}>
          {eco.title}
        </h3>

        {eco.price && (
          <div style={{ color: primary, fontWeight: 800, fontSize: '1.4rem', marginBottom: 12 }}>
            {eco.price}
            {eco.period && (
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>{' '}{eco.period}</span>
            )}
          </div>
        )}

        {eco.desc && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            {eco.desc}
          </p>
        )}

        {features.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              {t.ecosystems.benefits}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: primary, flexShrink: 0, fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}

        {eco.extraText && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}>{eco.extraText}</p>
        )}

        {eco.ctaLabel && eco.ctaLink && (
          <a
            href={eco.ctaLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', textAlign: 'center',
              background: primary, color: 'white',
              padding: '14px 32px', borderRadius: 10,
              fontWeight: 800, fontSize: '0.9rem',
              letterSpacing: 1.5, textTransform: 'uppercase',
              textDecoration: 'none', marginTop: 24,
            }}
          >
            {eco.ctaLabel}
          </a>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 16, width: '100%',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', padding: '10px',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}
        >
          {t.ecosystems.close}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ECOSYSTEM CARD — con indicador visual si tiene landing HTML
// ─────────────────────────────────────────────────────────────────────
function EcosystemCard({ eco, idx, primary, t, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const features = parseFeatures(eco.features).slice(0, 3)
  const hasLanding = !!(eco.detailHtml && eco.detailHtml.trim())

  return (
    <div
      onClick={() => onOpen(idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: eco.featured
          ? `1px solid ${primary}50`
          : hovered
            ? `1px solid ${primary}60`
            : '1px solid rgba(255,255,255,0.08)',
        background: eco.featured
          ? `${primary}08`
          : hovered
            ? `${primary}05`
            : 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${primary}30` : 'none',
        position: 'relative',
      }}
    >
      {/* Badge destacado */}
      {eco.featured && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          background: primary, color: 'white',
          fontSize: 9, fontWeight: 800, letterSpacing: 1,
          textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20,
        }}>
          {t.ecosystems.featured}
        </div>
      )}

      {/* Indicador de landing HTML — ícono de página */}
      {hasLanding && (
        <div style={{
          position: 'absolute',
          top: eco.featured ? 40 : 12,
          right: 12,
          zIndex: 2,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${primary}40`,
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 9,
          fontWeight: 700,
          color: primary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{ fontSize: 10 }}>🌐</span> Landing
        </div>
      )}

      {/* Imagen */}
      {eco.image && (
        <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
          <img
            src={eco.image}
            alt={eco.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: hovered ? 'brightness(0.65)' : 'brightness(0.55)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
          {/* Overlay con ícono de apertura al hover */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: `2px solid ${primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: hasLanding ? 20 : 16,
              color: primary,
              transform: hovered ? 'scale(1)' : 'scale(0.7)',
              transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            }}>
              {hasLanding ? '↗' : '→'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '18px 20px' }}>
        {/* Categoría */}
        <div style={{
          color: primary, fontSize: 10, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4,
        }}>
          {eco.category}
        </div>

        {/* Título */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
          {eco.title}
        </h3>

        {/* Precio */}
        {eco.price && (
          <div style={{ color: primary, fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>
            {eco.price}
            {eco.period && (
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
                {' '}{eco.period}
              </span>
            )}
          </div>
        )}

        {/* Descripción */}
        {eco.desc && (
          <p style={{
            color: 'var(--text-dim)', fontSize: 13,
            lineHeight: 1.6, margin: '0 0 12px',
          }}>
            {eco.desc}
          </p>
        )}

        {/* Primeros 3 beneficios */}
        {features.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                <span style={{ color: primary, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Link "ver detalle" / "ver landing" — localizado */}
        <div style={{
          marginTop: 4,
          fontSize: 11,
          color: hovered ? primary : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          transition: 'color 0.2s',
          fontWeight: hovered ? 700 : 400,
        }}>
          {hasLanding ? (
            <>
              <span style={{ fontSize: 12 }}>🌐</span>
              {t.ecosystems.viewDetail} →
            </>
          ) : (
            <>{t.ecosystems.viewDetail} →</>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SECCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
export default function EcosystemSection({ ecosystems, brand }) {
  const [selected, setSelected] = useState(null)
  const t = useUIStrings(brand)

  if (!ecosystems?.length) return null

  const selectedEco = selected !== null ? ecosystems[selected] : null
  const primary = brand?.primary || '#ff3c3c'
  const hasLanding = selectedEco && !!(selectedEco.detailHtml && selectedEco.detailHtml.trim())

  return (
    <section id="ecosistemas" style={{ padding: '100px 6%' }}>
      {/* Encabezado — usa strings localizados idénticos a v2 */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{
          color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
        }}>
          {t.ecosystems.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.ecosystems.headingPrefix}{' '}
          <span style={{ color: primary }}>{t.ecosystems.heading}</span>
        </h2>
      </div>

      {/* Grid de cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {ecosystems.map((eco, idx) => (
          <EcosystemCard
            key={eco.id || idx}
            eco={eco}
            idx={idx}
            primary={primary}
            t={t}
            onOpen={setSelected}
          />
        ))}
      </div>

      {/* Modal — Landing HTML o modal clásico según configuración */}
      {selectedEco && (
        hasLanding ? (
          <LandingModal
            eco={selectedEco}
            primary={primary}
            onClose={() => setSelected(null)}
          />
        ) : (
          <ClassicModal
            eco={selectedEco}
            primary={primary}
            onClose={() => setSelected(null)}
            t={t}
          />
        )
      )}
    </section>
  )
}