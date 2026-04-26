/**
 * ProposalPage.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Página de propuesta visual dinámica por proyecto.
 * URL: /proposal/:slug  (slug = client en lowercase con guiones)
 * Lee datos desde Firestore vía getProjects() + getSiteConfig()
 * Todo configurable desde ProjectsTab en el admin panel.
 */

import { useEffect, useState } from 'react'
import { useParams, Link }     from 'react-router-dom'
import { getProjects, getSiteConfig } from '../lib/firebaseHelpers'

// ── Helpers ───────────────────────────────────────────────────────────
function toSlug(str = '') {
  return str.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

function hexToRgb(hex = '') {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function isLight(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.55
}

// ── Spinner ───────────────────────────────────────────────────────────
function Spinner({ accent }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#080a0c', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `3px solid rgba(255,255,255,0.1)`,
        borderTopColor: accent || '#c5a059',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── 404 ───────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#080a0c', color: 'white', gap: 16, textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Propuesta no encontrada</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        El proyecto que buscas no existe o fue eliminado.
      </p>
      <Link to="/" style={{
        marginTop: 8, padding: '12px 32px', background: '#c5a059', color: '#000',
        borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: 14,
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}

// ── Feature Card ──────────────────────────────────────────────────────
function FeatureCard({ feature, accent, index }) {
  const [hovered, setHovered] = useState(false)
  const rgb = hexToRgb(accent) || { r: 197, g: 160, b: 89 }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `rgba(${rgb.r},${rgb.g},${rgb.b},0.06)`
          : 'linear-gradient(145deg, #16181a, #0f1113)',
        border: `1px solid ${hovered ? accent : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 40,
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: hovered ? '0 30px 60px rgba(0,0,0,0.7)' : 'none',
        display: 'flex', flexDirection: 'column',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Imagen */}
      {feature.image && (
        <div style={{ width: '100%', height: 220, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img
            src={feature.image}
            alt={feature.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.8s ease',
              filter: 'brightness(0.75)',
            }}
          />
          {/* Icon badge flotante */}
          {feature.icon && (
            <div style={{
              position: 'absolute', top: 18, right: 18,
              background: 'rgba(8,10,12,0.85)',
              backdropFilter: 'blur(12px)',
              width: 48, height: 48, borderRadius: '50%',
              border: `1px solid ${accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {feature.icon}
            </div>
          )}
          {/* Número */}
          <div style={{
            position: 'absolute', bottom: 16, left: 20,
            fontFamily: 'Cinzel, serif',
            fontSize: 11, letterSpacing: 3, fontWeight: 700,
            color: accent, textTransform: 'uppercase', opacity: 0.9,
          }}>
            0{index + 1}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{ padding: '32px 36px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '1.15rem', fontWeight: 700,
          letterSpacing: 2, marginBottom: 14,
          color: 'white', textTransform: 'uppercase',
        }}>
          {feature.title}
        </h3>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 14, lineHeight: 1.8,
          marginBottom: 24, flex: 1,
        }}>
          {feature.description}
        </p>
        {/* Badges */}
        {feature.badges?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {feature.badges.map((b, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                textTransform: 'uppercase',
                border: `1px solid rgba(255,255,255,0.12)`,
                background: 'rgba(255,255,255,0.04)',
                padding: '5px 14px', borderRadius: 50,
                color: 'rgba(255,255,255,0.5)',
              }}>
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function ProposalPage() {
  const { slug }                    = useParams()
  const [project,  setProject]      = useState(null)
  const [site,     setSite]         = useState(null)
  const [loading,  setLoading]      = useState(true)
  const [notFound, setNotFound]     = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [projects, cfg] = await Promise.all([getProjects(), getSiteConfig()])
        setSite(cfg)
        const match = projects.find(p => toSlug(p.client || p.title || '') === slug)
        if (!match) { setNotFound(true); return }
        setProject(match)
      } catch (e) {
        console.error('[ProposalPage]', e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading)  return <Spinner />
  if (notFound) return <NotFound />

  const accent      = project.accentColor  || site?.brand?.primary || '#c5a059'
  const bg          = project.proposalBg   || '#080a0c'
  const features    = parseFeatures(project.proposalFeatures)
  const tagline     = project.proposalTagline || project.description || ''
  const ctaLink     = project.ctaLink      || '/#contacto'
  const ctaLabel    = project.ctaLabel     || 'Solicitar Demo'
  const footerTitle = project.footerTitle  || '¿Listo para empezar?'
  const footerSub   = project.footerSub    || 'Construyamos juntos la experiencia digital que tu negocio merece.'
  const clientName  = project.client       || project.title || ''
  const industry    = project.industry     || ''
  const rgb         = hexToRgb(accent) || { r: 197, g: 160, b: 89 }
  const lightBg     = isLight(bg)

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      color: lightBg ? '#0a0a0a' : '#f3f4f6',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .proposal-fade-in {
          animation: propFadeIn 0.8s cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes propFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .proposal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        @media (max-width: 768px) {
          .proposal-grid { grid-template-columns: 1fr; }
          .proposal-hero h1 { font-size: 2.8rem !important; }
          .proposal-footer-inner { flex-direction: column !important; text-align: center !important; gap: 28px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <header
        className="proposal-fade-in"
        style={{
          textAlign: 'center',
          padding: 'clamp(60px, 10vw, 120px) clamp(24px, 6%, 80px) clamp(50px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow de fondo */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse at 50% -10%, rgba(${rgb.r},${rgb.g},${rgb.b},0.18) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        {/* Hero image de fondo si existe */}
        {project.image && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${project.image})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.08, filter: 'blur(2px)',
          }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Industry badge */}
          {industry && (
            <div style={{
              display: 'inline-block',
              border: `1px solid rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`,
              background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`,
              color: accent, borderRadius: 50,
              padding: '6px 20px', marginBottom: 32,
              fontSize: 10, fontWeight: 700,
              letterSpacing: 3, textTransform: 'uppercase',
            }}>
              {industry}
            </div>
          )}

          {/* Línea decorativa */}
          <div style={{
            width: 60, height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            margin: '0 auto 28px',
          }} />

          {/* Nombre cliente */}
          <h1
            className="proposal-hero"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              fontWeight: 700, letterSpacing: 4,
              lineHeight: 0.95, marginBottom: 28,
              color: lightBg ? '#0a0a0a' : 'white',
            }}
          >
            {clientName.split(' ').map((word, i, arr) => (
              <span key={i} style={{ color: i === arr.length - 1 ? accent : 'inherit' }}>
                {word}{i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          {/* Tagline */}
          {tagline && (
            <p style={{
              color: lightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.45)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 300, lineHeight: 1.7,
              maxWidth: 560, margin: '0 auto 48px',
            }}>
              {tagline}
            </p>
          )}

          {/* Results pills */}
          {project.results && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              {project.results.split('·').map(r => r.trim()).filter(Boolean).map((r, i) => (
                <div key={i} style={{
                  background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`,
                  border: `1px solid rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                  borderRadius: 50, padding: '8px 20px',
                  fontSize: 12, fontWeight: 700, color: accent,
                  letterSpacing: 0.5,
                }}>
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* CTA principal */}
          <a
            href={ctaLink}
            style={{
              display: 'inline-block',
              background: accent, color: isLight(accent) ? '#000' : '#fff',
              padding: '18px 52px', borderRadius: 50,
              fontWeight: 800, fontSize: 13,
              letterSpacing: 2, textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: `0 0 40px rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
              e.currentTarget.style.boxShadow = `0 16px 48px rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = `0 0 40px rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </header>

      {/* ── DIVIDER ── */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, rgba(${rgb.r},${rgb.g},${rgb.b},0.4), transparent)`,
        margin: '0 clamp(24px, 6%, 80px)',
      }} />

      {/* ── FEATURES GRID ── */}
      {features.length > 0 && (
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6%, 80px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{
              color: accent, fontSize: 10, fontWeight: 700,
              letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16,
            }}>
              Lo que incluye
            </p>
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: lightBg ? '#0a0a0a' : 'white',
              letterSpacing: 2,
            }}>
              La Experiencia Completa
            </h2>
          </div>

          <div className="proposal-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} accent={accent} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER CTA ── */}
      <footer style={{ padding: 'clamp(40px, 6vw, 80px) clamp(24px, 6%, 80px) clamp(60px, 8vw, 100px)' }}>
        <div
          style={{
            background: accent,
            borderRadius: 56,
            padding: 'clamp(40px, 5vw, 64px) clamp(32px, 5vw, 72px)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 32,
            boxShadow: `0 32px 80px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
          }}
          className="proposal-footer-inner"
        >
          <div>
            <h4 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
              fontWeight: 700, letterSpacing: 2,
              color: isLight(accent) ? '#000' : '#fff',
              marginBottom: 10, textTransform: 'uppercase',
            }}>
              {footerTitle}
            </h4>
            <p style={{
              fontSize: 14, fontWeight: 500, opacity: 0.65,
              color: isLight(accent) ? '#000' : '#fff',
              maxWidth: 440, lineHeight: 1.6,
            }}>
              {footerSub}
            </p>
          </div>
          <a
            href={ctaLink}
            style={{
              background: isLight(accent) ? '#000' : '#fff',
              color: isLight(accent) ? '#fff' : '#000',
              padding: '18px 48px', borderRadius: 50,
              fontWeight: 800, fontSize: 13,
              letterSpacing: 2, textTransform: 'uppercase',
              textDecoration: 'none', flexShrink: 0,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {ctaLabel}
          </a>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            to="/"
            style={{
              color: lightBg ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)',
              fontSize: 12, textDecoration: 'none',
              letterSpacing: 1, transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = accent }}
            onMouseLeave={e => { e.currentTarget.style.color = lightBg ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)' }}
          >
            ← Volver al sitio
          </Link>
        </div>
      </footer>
    </div>
  )
}