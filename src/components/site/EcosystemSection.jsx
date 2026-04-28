/**
 * EcosystemSection.jsx — v4 DRAWER
 * ─────────────────────────────────────────────────────────────────────────
 * CAMBIO PRINCIPAL (según diagrama):
 *   Al hacer clic en una card de ecosistema, se abre un DRAWER lateral
 *   (panel que desliza desde la derecha) que permanece DENTRO del contexto
 *   de Polartronic. El usuario nunca "sale" del sitio.
 *
 *   El drawer muestra:
 *     - Header con categoría + título del ecosistema
 *     - Casos de éxito del sector (proyectos filtrados por industry/category)
 *     - Resultados típicos
 *     - Servicios/beneficios incluidos
 *     - CTA: "Ver proyectos →" y "Hablemos →"
 *
 *   Si eco.detailHtml está configurado, se renderiza dentro del drawer
 *   (iframe embebido en el panel lateral), no como overlay fullscreen.
 *
 * FALLBACK: Si no hay detailHtml → drawer con contenido automático
 *   (beneficios, casos de éxito filtrados, CTAs).
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
// DRAWER LATERAL — panel que desliza desde la derecha
// ─────────────────────────────────────────────────────────────────────
function EcosystemDrawer({ eco, primary, onClose, t, projects = [] }) {
  useBodyLock(true)
  const drawerRef = useRef(null)
  const hasLanding = !!(eco.detailHtml && eco.detailHtml.trim())

  // Cierre con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Filtrar proyectos del mismo sector para mostrar como casos de éxito
  const relatedProjects = projects.filter(p => {
    const pInd = (p.industry || p.category || '').toLowerCase()
    const eCat = (eco.category || eco.title || '').toLowerCase()
    return pInd && eCat && (pInd.includes(eCat.split(' ')[0]) || eCat.includes(pInd.split(' ')[0]))
  }).slice(0, 3)

  const features = parseFeatures(eco.features)

  // Construye srcDoc del iframe si hay detailHtml
  function buildIframeSrcDoc(html) {
    if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) return html
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}</style></head><body>${html}</body></html>`
  }

  return (
    <>
      <style>{`
        @keyframes drawerIn {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .eco-drawer-close:hover {
          background: rgba(255,255,255,0.12) !important;
          transform: scale(1.08);
        }
        .eco-drawer-cta-primary:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }
        .eco-drawer-cta-secondary:hover {
          border-color: ${primary} !important;
          color: ${primary} !important;
          transform: translateY(-1px) !important;
        }
        .eco-drawer-project-card:hover {
          border-color: ${primary}60 !important;
          background: ${primary}06 !important;
          transform: translateY(-2px) !important;
        }
        .eco-drawer-scroll::-webkit-scrollbar { width: 3px; }
        .eco-drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .eco-drawer-scroll::-webkit-scrollbar-thumb { background: ${primary}40; border-radius: 2px; }
      `}</style>

      {/* Backdrop oscuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'backdropIn 0.3s ease both',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 8100,
          width: 'min(520px, 92vw)',
          background: '#0a0a0a',
          borderLeft: `1px solid ${primary}25`,
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerIn 0.38s cubic-bezier(0.23,1,0.32,1) both',
          boxShadow: `-24px 0 80px rgba(0,0,0,0.6), -1px 0 0 ${primary}15`,
        }}
      >
        {/* ── Header del drawer ── */}
        <div style={{
          flexShrink: 0,
          padding: '20px 24px',
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}>
          {/* Thumbnail */}
          {eco.image && (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              overflow: 'hidden',
              flexShrink: 0,
              border: `1px solid ${primary}30`,
            }}>
              <img
                src={eco.image}
                alt={eco.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {eco.category && (
              <div style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 2.5,
                color: primary,
                marginBottom: 4,
              }}>
                {eco.category}
              </div>
            )}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {eco.title}
            </h2>
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              margin: '6px 0 0',
              lineHeight: 1.5,
            }}>
              {t.ecosystems.drawerSubtitle || 'Cómo trabajamos este sector'}
            </p>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="eco-drawer-close"
            aria-label="Cerrar"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
              width: 34,
              height: 34,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Precio (si existe) ── */}
        {eco.price && (
          <div style={{
            flexShrink: 0,
            padding: '12px 24px',
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: primary,
            }}>
              {eco.price}
            </span>
            {eco.period && (
              <span style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.35)',
              }}>
                {eco.period}
              </span>
            )}
            {eco.featured && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: primary,
                color: 'white',
                padding: '3px 10px',
                borderRadius: 20,
              }}>
                {t.ecosystems.featured}
              </span>
            )}
          </div>
        )}

        {/* ── Contenido scrollable ── */}
        <div
          className="eco-drawer-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Si hay HTML de landing, renderizarlo en iframe dentro del drawer */}
          {hasLanding ? (
            <iframe
              title={`${eco.title} — detalle`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              style={{
                width: '100%',
                minHeight: 500,
                border: 'none',
                display: 'block',
                background: 'white',
              }}
              srcDoc={buildIframeSrcDoc(eco.detailHtml)}
            />
          ) : (
            <div style={{ padding: '24px 24px 8px' }}>

              {/* Descripción */}
              {eco.desc && (
                <p style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 14,
                  lineHeight: 1.75,
                  marginBottom: 24,
                }}>
                  {eco.desc}
                </p>
              )}

              {/* Casos de éxito del sector */}
              {relatedProjects.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: 12,
                  }}>
                    {t.ecosystems.successCases || 'Casos de éxito'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {relatedProjects.map((proj, i) => (
                      <div
                        key={proj.id || i}
                        className="eco-drawer-project-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.07)',
                          background: 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s',
                          cursor: 'default',
                        }}
                      >
                        {proj.image && (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 7,
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}>
                            <img
                              src={proj.image}
                              alt={proj.client}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: 'white',
                          }}>
                            {proj.client || proj.title}
                          </div>
                          {proj.results && (
                            <div style={{
                              fontSize: 11,
                              color: primary,
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              ▲ {proj.results.split('·')[0].trim()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados típicos del sector */}
              {relatedProjects.some(p => p.results) && (
                <div style={{
                  marginBottom: 28,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: `${primary}08`,
                  border: `1px solid ${primary}20`,
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: primary,
                    marginBottom: 10,
                  }}>
                    {t.ecosystems.typicalResults || 'Resultados típicos'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {relatedProjects
                      .flatMap(p => (p.results || '').split('·').map(r => r.trim()).filter(Boolean))
                      .slice(0, 4)
                      .map((r, i) => (
                        <div key={i} style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: primary,
                          background: `${primary}12`,
                          border: `1px solid ${primary}30`,
                          borderRadius: 20,
                          padding: '4px 12px',
                        }}>
                          {r}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Beneficios / Servicios incluidos */}
              {features.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: 12,
                  }}>
                    {t.ecosystems.benefits || 'Incluido en este plan'}
                  </div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    {features.map((f, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.5,
                      }}>
                        <span style={{
                          color: primary,
                          flexShrink: 0,
                          fontWeight: 800,
                          marginTop: 1,
                        }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extra text */}
              {eco.extraText && (
                <p style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 12,
                  lineHeight: 1.7,
                  marginBottom: 16,
                  fontStyle: 'italic',
                }}>
                  {eco.extraText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer del drawer — CTAs fijos ── */}
        <div style={{
          flexShrink: 0,
          padding: '16px 24px',
          borderTop: `1px solid rgba(255,255,255,0.07)`,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          gap: 10,
        }}>
          {/* CTA primario: "Hablemos" → contacto */}
          <a
            href="#contacto"
            onClick={onClose}
            className="eco-drawer-cta-primary"
            style={{
              flex: 1,
              padding: '13px 20px',
              background: primary,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1,
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {t.ecosystems.ctaContact || 'Hablemos'} →
          </a>

          {/* CTA secundario: "Ver proyectos" */}
          <a
            href="#proyectos"
            onClick={onClose}
            className="eco-drawer-cta-secondary"
            style={{
              flex: 1,
              padding: '13px 20px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {t.ecosystems.ctaProjects || 'Ver proyectos'} →
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
            ? `1px solid ${primary}55`
            : '1px solid rgba(255,255,255,0.08)',
        background: eco.featured
          ? `${primary}08`
          : hovered
            ? `${primary}04`
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
          {/* Overlay icono "→" en hover */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              border: `2px solid ${primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: primary,
              transform: hovered ? 'scale(1)' : 'scale(0.7)',
              transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            }}>
              ↗
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

        {/* Indicador "ver detalle" */}
        <div style={{
          marginTop: 4, fontSize: 11,
          color: hovered ? primary : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'color 0.2s',
          fontWeight: hovered ? 700 : 400,
        }}>
          {t.ecosystems.viewDetail || 'Ver detalle'} →
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SECCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
export default function EcosystemSection({ ecosystems, brand, projects = [] }) {
  const [selected, setSelected] = useState(null)
  const t = useUIStrings(brand)

  if (!ecosystems?.length) return null

  const selectedEco = selected !== null ? ecosystems[selected] : null
  const primary = brand?.primary || '#ff3c3c'

  return (
    <section id="ecosistemas" style={{ padding: '100px 6%' }}>
      {/* Encabezado */}
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

      {/* Drawer lateral */}
      {selectedEco && (
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