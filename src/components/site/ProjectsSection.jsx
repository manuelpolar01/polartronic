/**
 * ProjectsSection.jsx — v2 SHELL POLARTRONIC
 * ─────────────────────────────────────────────────────────────────────────
 * CAMBIO PRINCIPAL (según diagrama):
 *   Al hacer clic en un proyecto que tiene detailHtml configurado, se abre
 *   un SHELL de Polartronic con:
 *     - Barra superior con branding Polartronic + nombre del proyecto
 *     - Botón "Contratar esto" (→ #contacto dentro del mismo site)
 *     - Botón "← Volver" (cierra el shell)
 *     - Iframe con la app/demo del cliente
 *
 *   Si NO hay detailHtml → abre el link externo (url) en nueva pestaña.
 *
 *   IDIOMA: useUIStrings(brand) — 100% localizado.
 *   LEADS: intercepta forms del iframe y los envía al inbox de Polartronic.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'
import { processNewLead } from '../../lib/leadHelpers'

const CARD_WIDTH  = 320
const CARD_GAP    = 20
const SCROLL_STEP = CARD_WIDTH + CARD_GAP

function hasValidUrl(url) {
  if (!url) return false
  const u = url.trim()
  return u !== '#' && u !== '/#'
}

// ─────────────────────────────────────────────────────────────────────
// SHELL POLARTRONIC — overlay fullscreen con barra de marca
// ─────────────────────────────────────────────────────────────────────
function ProjectShell({ project, brand, site, onClose }) {
  const iframeRef = useRef(null)
  const t = useUIStrings(brand)
  const primary = brand?.primary || '#ff3c3c'
  const brandName = brand?.name || 'POLARTRONIC'
  const brandLogo = brand?.logo || ''

  // Bloquea scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape para cerrar
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Intercepta mensajes del iframe (formularios internos → leads)
  const handleMessage = useCallback(async (e) => {
    if (e.source !== iframeRef.current?.contentWindow) return
    if (e.data?.type === 'PROJECT_LEAD') {
      const raw = e.data.data || {}
      const lead = {
        name:     raw.name     || raw.nombre   || '',
        email:    raw.email    || '',
        phone:    raw.phone    || raw.telefono  || '',
        zona:     raw.zona     || raw.city      || '',
        servizio: project.title || project.client || 'Demo App',
        message:  raw.message  || raw.mensaje   || '',
      }
      try {
        await processNewLead(lead, site)
        iframeRef.current?.contentWindow.postMessage({ type: 'LEAD_SUCCESS' }, '*')
      } catch (err) {
        console.error('[ProjectShell] lead error:', err)
      }
    }
  }, [project, site])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Construye srcDoc del iframe
  function buildSrcDoc(html) {
    const injector = `<script>
      document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('submit', function(e) {
          if (e.target.tagName === 'FORM') {
            e.preventDefault()
            var fd = new FormData(e.target)
            var data = {}
            fd.forEach(function(v, k) { data[k] = v })
            window.parent.postMessage({ type: 'PROJECT_LEAD', data: data }, '*')
          }
        }, true)
      })
    <\/script>`

    if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
      return html.replace(/<\/head>/i, injector + '</head>')
    }
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}a{color:inherit}</style>${injector}</head><body>${html}</body></html>`
  }

  const clientName  = project.client || project.title || ''
  const industry    = project.industry || project.category || ''
  const hasExternal = hasValidUrl(project.url)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      background: '#080a0c',
      animation: 'shellFadeIn 0.3s cubic-bezier(0.23,1,0.32,1) both',
    }}>
      <style>{`
        @keyframes shellFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .shell-btn-contract:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px ${primary}40 !important;
        }
        .shell-btn-back:hover {
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
        }
        .shell-btn-external:hover {
          border-color: ${primary} !important;
          color: ${primary} !important;
        }
      `}</style>

      {/* ── BARRA SUPERIOR POLARTRONIC ── */}
      <div style={{
        flexShrink: 0,
        height: 60,
        background: 'rgba(8,10,12,0.98)',
        borderBottom: `1px solid ${primary}30`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo / marca Polartronic */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              style={{ height: 28, maxWidth: 120, objectFit: 'contain' }}
            />
          ) : (
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.4rem',
              color: primary,
              letterSpacing: 2,
              lineHeight: 1,
            }}>
              {brandName}
            </span>
          )}
        </div>

        {/* Separador */}
        <div style={{
          width: 1,
          height: 28,
          background: 'rgba(255,255,255,0.12)',
          flexShrink: 0,
        }} />

        {/* Nombre del proyecto + industry */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            {industry && (
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: primary,
                border: `1px solid ${primary}40`,
                background: `${primary}10`,
                padding: '2px 8px',
                borderRadius: 4,
                flexShrink: 0,
              }}>
                {industry}
              </span>
            )}
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {clientName}
              {project.title && project.title !== clientName
                ? ` — ${project.title}`
                : ' — Demo'}
            </span>
          </div>
        </div>

        {/* Acciones — desktop */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Botón externo (si existe URL) */}
          {hasExternal && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="shell-btn-external"
              style={{
                display: 'none', // se muestra en desktop via media query
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              🔗 {t.projects?.visitSite || 'Ver sitio'}
            </a>
          )}

          {/* Botón "Contratar esto" → #contacto */}
          <a
            href="/#contacto"
            onClick={(e) => {
              e.preventDefault()
              onClose()
              // Pequeño delay para que el shell se cierre antes de hacer scroll
              setTimeout(() => {
                const el = document.getElementById('contacto')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }, 200)
            }}
            className="shell-btn-contract"
            style={{
              padding: '9px 18px',
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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 0 20px ${primary}30`,
              whiteSpace: 'nowrap',
            }}
          >
            {t.projects?.contractThis || 'Contratar esto'}
          </a>

          {/* Botón "← Volver" */}
          <button
            onClick={onClose}
            className="shell-btn-back"
            style={{
              padding: '9px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            ← {t.projects?.backBtn || 'Volver'}
          </button>
        </div>
      </div>

      {/* ── IFRAME CON LA APP DEL CLIENTE ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <iframe
          ref={iframeRef}
          title={`${clientName} — app`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          srcDoc={buildSrcDoc(project.detailHtml || '')}
        />
      </div>

      {/* ── BARRA INFERIOR (mobile) — acciones repetidas ── */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px',
        background: 'rgba(8,10,12,0.98)',
        borderTop: `1px solid rgba(255,255,255,0.07)`,
        display: 'none', // visible en mobile via CSS
        gap: 10,
      }}
        className="shell-mobile-bar"
      >
        <style>{`
          @media (max-width: 640px) {
            .shell-mobile-bar { display: flex !important; }
            .shell-btn-external { display: none !important; }
          }
          @media (min-width: 641px) {
            .shell-btn-external { display: flex !important; }
          }
        `}</style>
        <a
          href="/#contacto"
          onClick={(e) => {
            e.preventDefault()
            onClose()
            setTimeout(() => {
              const el = document.getElementById('contacto')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }, 200)
          }}
          style={{
            flex: 1, padding: '12px 16px',
            background: primary, color: 'white',
            border: 'none', borderRadius: 8,
            fontWeight: 800, fontSize: 12,
            letterSpacing: 0.8, textTransform: 'uppercase',
            textDecoration: 'none', textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          {t.projects?.contractThis || 'Contratar esto'}
        </a>
        <button
          onClick={onClose}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: 8, fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ← {t.projects?.backBtn || 'Volver'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────────────
function ProjectCard({ proj, primary, t, onOpen }) {
  const [hovered, setHovered] = useState(false)

  const clientName  = proj.client || proj.title || ''
  const industry    = proj.industry || proj.category || ''
  const description = proj.description || proj.desc || ''
  const results     = proj.results || ''
  const rawUrl      = proj.url || proj.link || ''
  const hasLanding  = !!(proj.detailHtml && proj.detailHtml.trim())
  const isValid     = hasValidUrl(rawUrl)
  const isClickable = hasLanding || isValid

  const resultItems = results
    ? results.split('·').map(r => r.trim()).filter(Boolean)
    : []

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isClickable && onOpen(proj)}
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: 20, overflow: 'hidden',
        border: hovered ? `1px solid ${primary}` : '1px solid rgba(255,255,255,0.07)',
        background: hovered ? 'rgba(255,60,60,0.03)' : 'rgba(255,255,255,0.02)',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
        cursor: isClickable ? 'pointer' : 'default',
        height: '100%', color: 'inherit',
      }}
    >
      {proj.image && (
        <div style={{ height: 200, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img
            src={proj.image}
            alt={clientName}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: hovered ? 'brightness(0.65)' : 'brightness(0.5)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
          {/* Badges */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {industry && (
              <div style={{
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1.5,
                padding: '4px 10px', borderRadius: 20,
              }}>
                {industry}
              </div>
            )}
            {hasLanding && (
              <div style={{
                background: primary, color: 'white',
                fontSize: 9, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: 1,
                padding: '4px 10px', borderRadius: 6,
              }}>
                🌐 APP
              </div>
            )}
          </div>

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              border: `2px solid ${primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: hasLanding ? 22 : 18, color: primary,
              transform: hovered ? 'scale(1)' : 'scale(0.7)',
              transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            }}>
              {hasLanding ? '▶' : '↗'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{
            color: primary, fontWeight: 800, fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
          }}>
            {clientName}
          </div>
          {proj.title && proj.title !== clientName && (
            <h3 style={{
              fontSize: '1.1rem', fontWeight: 700, margin: 0,
              lineHeight: 1.3, color: 'rgba(255,255,255,0.9)',
            }}>
              {proj.title}
            </h3>
          )}
        </div>

        {description && (
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: 13,
            lineHeight: 1.7, margin: '0 0 16px', flex: 1,
          }}>
            {description}
          </p>
        )}

        {resultItems.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 14, marginTop: 'auto',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: 2,
              color: 'rgba(255,255,255,0.25)', marginBottom: 4,
            }}>
              {t.projects.results}
            </div>
            {resultItems.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'rgba(255,255,255,0.7)',
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: `rgba(255,60,60,0.12)`,
                  border: `1px solid ${primary}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: primary, flexShrink: 0,
                }}>▲</span>
                {r}
              </div>
            ))}
          </div>
        )}

        {/* CTA label en hover */}
        {isClickable && (
          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: hovered ? primary : 'rgba(255,255,255,0.2)',
            fontWeight: hovered ? 700 : 400,
            transition: 'color 0.2s',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {hasLanding
              ? (t.projects?.openApp || 'Abrir demo') + ' ▶'
              : (t.projects?.visitSite || 'Ver sitio') + ' ↗'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SECCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
export default function ProjectsSection({ projects, brand, site }) {
  if (!projects?.length) return null

  const primary  = brand?.primary || 'var(--primary)'
  const t        = useUIStrings(brand)
  const trackRef = useRef(null)
  const [activeProject, setActiveProject] = useState(null)

  const scrollLeft  = () => trackRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  const scrollRight = () => trackRef.current?.scrollBy({ left:  SCROLL_STEP, behavior: 'smooth' })

  function handleOpen(proj) {
    const hasLanding = !!(proj.detailHtml && proj.detailHtml.trim())
    if (hasLanding) {
      setActiveProject(proj)
    } else if (hasValidUrl(proj.url)) {
      window.open(proj.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section id="proyectos" style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <div style={{ padding: '0 6%', textAlign: 'center', marginBottom: 48 }}>
        <p style={{
          color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
        }}>
          {t.projects.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800 }}>
          {t.projects.heading}{' '}
          <span style={{ color: primary }}>{t.projects.headingAccent}</span>
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.4)', fontSize: 15,
          marginTop: 12, maxWidth: 500, margin: '12px auto 0',
        }}>
          {t.projects.sub}
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Track horizontal scrollable */}
        <div
          ref={trackRef}
          style={{
            display: 'flex', gap: CARD_GAP,
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: '6%', paddingRight: '6%', paddingBottom: 8,
            msOverflowStyle: 'none', scrollbarWidth: 'none',
          }}
        >
          <style>{`#proyectos div::-webkit-scrollbar { display: none; }`}</style>
          {projects.map((proj, i) => (
            <div
              key={proj.id || i}
              style={{ flex: '0 0 auto', width: CARD_WIDTH, scrollSnapAlign: 'start' }}
            >
              <ProjectCard
                proj={proj}
                primary={primary}
                t={t}
                onOpen={handleOpen}
              />
            </div>
          ))}
        </div>

        {/* Botones de navegación del carrusel */}
        {projects.length > 2 && (
          <>
            <button onClick={scrollLeft} aria-label="Anterior" style={arrowStyle('left')}>‹</button>
            <button onClick={scrollRight} aria-label="Siguiente" style={arrowStyle('right')}>›</button>
          </>
        )}
      </div>

      {/* Shell Polartronic — se abre cuando hay detailHtml */}
      {activeProject && (
        <ProjectShell
          project={activeProject}
          brand={brand}
          site={site}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  )
}

function arrowStyle(side) {
  return {
    position: 'absolute', top: '50%',
    [side]: 'calc(6% - 22px)',
    transform: 'translateY(-50%)',
    width: 44, height: 44,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50%',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 22, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10, lineHeight: 1, padding: 0,
  }
}