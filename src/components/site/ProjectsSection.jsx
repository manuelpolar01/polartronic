/**
 * ProjectsSection.jsx — v3 PREMIUM REDESIGN
 * ─────────────────────────────────────────────────────────────────────────
 * Cards horizontales + vertical en grid adaptativo.
 * Shell de proyecto: fullscreen con barra branded + tabs info/resultados.
 * Hover effects: tilt 3D sutil, spotlight radial, línea reveal animada.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'
import { processNewLead } from '../../lib/leadHelpers'

const CARD_WIDTH  = 340
const CARD_GAP    = 22

function hasValidUrl(url) {
  if (!url) return false
  const u = url.trim()
  return u !== '#' && u !== '/#'
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT SHELL — fullscreen cinematic viewer
// ─────────────────────────────────────────────────────────────────────
function ProjectShell({ project, brand, site, onClose }) {
  const iframeRef    = useRef(null)
  const [ready, setReady]       = useState(false)
  const [activeTab, setActiveTab] = useState('demo')
  const t       = useUIStrings(brand)
  const primary = brand?.primary || '#ff3c3c'
  const brandName = brand?.name  || 'POLARTRONIC'
  const brandLogo = brand?.logo  || ''

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const handleMessage = useCallback(async (e) => {
    if (e.source !== iframeRef.current?.contentWindow) return
    if (e.data?.type === 'PROJECT_LEAD') {
      const raw = e.data.data || {}
      try {
        await processNewLead({
          name:     raw.name     || raw.nombre   || '',
          email:    raw.email    || '',
          phone:    raw.phone    || raw.telefono  || '',
          zona:     raw.zona     || raw.city      || '',
          servizio: project.title || project.client || 'Demo App',
          message:  raw.message  || '',
        }, site)
        iframeRef.current?.contentWindow.postMessage({ type: 'LEAD_SUCCESS' }, '*')
      } catch (err) { console.error('[ProjectShell]', err) }
    }
  }, [project, site])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  function buildSrcDoc(html) {
    const injector = `<script>
      document.addEventListener('DOMContentLoaded',function(){
        document.addEventListener('submit',function(e){
          if(e.target.tagName==='FORM'){
            e.preventDefault();
            var fd=new FormData(e.target),data={};
            fd.forEach(function(v,k){data[k]=v});
            window.parent.postMessage({type:'PROJECT_LEAD',data:data},'*');
          }
        },true);
      });
    <\/script>`
    if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
      return html.replace(/<\/head>/i, injector + '</head>')
    }
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}a{color:inherit}</style>${injector}</head><body>${html}</body></html>`
  }

  const clientName  = project.client || project.title || ''
  const industry    = project.industry || project.category || ''
  const resultItems = (project.results || '').split('·').map(r => r.trim()).filter(Boolean)
  const hasExternal = hasValidUrl(project.url)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      background: '#04050a',
      animation: 'projShellOpen 0.36s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <style>{`
        @keyframes projShellOpen{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
        @keyframes projBarIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes projLoaderSpin{to{transform:rotate(360deg)}}
        @keyframes projIframeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .proj-tab:hover{color:white!important;}
        .proj-back-btn:hover{background:rgba(255,255,255,0.1)!important;color:white!important;}
        .proj-hire-btn:hover{transform:translateY(-2px)!important;box-shadow:0 14px 36px ${primary}55!important;}
        .proj-ext-btn:hover{border-color:${primary}!important;color:${primary}!important;}
      `}</style>

      {/* TOP BAR */}
      <div style={{
        flexShrink: 0, height: 64,
        background: 'rgba(4,5,10,0.92)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 14,
        position: 'relative', zIndex: 2,
        animation: 'projBarIn 0.38s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Línea glow bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, ${primary}50 40%, ${primary}50 60%, transparent 100%)` }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {brandLogo
            ? <img src={brandLogo} alt={brandName} style={{ height: 26, maxWidth: 120, objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.3rem', color: primary, letterSpacing: 2 }}>{brandName}</span>
          }
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Project info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {industry && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: primary, background: `${primary}15`, border: `1px solid ${primary}30`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{industry}</span>
          )}
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName}</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '3px', flexShrink: 0 }}>
          {[
            { id: 'demo', label: '▶ Demo' },
            ...(resultItems.length > 0 ? [{ id: 'results', label: '↑ Resultados' }] : []),
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="proj-tab"
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: activeTab === tab.id ? primary : 'transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.18s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          {hasExternal && (
            <a href={project.url} target="_blank" rel="noreferrer" className="proj-ext-btn"
              style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              🔗 {t.projects?.visitSite || 'Ver sitio'}
            </a>
          )}
          <button
            onClick={() => { onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 200) }}
            className="proj-hire-btn"
            style={{ padding: '9px 20px', background: primary, color: 'white', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.22s', boxShadow: `0 4px 20px ${primary}35`, whiteSpace: 'nowrap' }}>
            {t.projects?.contractThis || 'Contratar'} →
          </button>
          <button onClick={onClose} className="proj-back-btn"
            style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* DEMO TAB */}
        {activeTab === 'demo' && (
          <>
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.06)`, borderTopColor: primary, animation: 'projLoaderSpin 0.8s linear infinite' }} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Cargando aplicación…</div>
                {project.image && (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05, filter: 'blur(20px)' }} />
                )}
              </div>
            )}
            <iframe
              ref={iframeRef}
              title={`${clientName} app`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setReady(true)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: 'white', opacity: ready ? 1 : 0, transition: 'opacity 0.45s ease', animation: ready ? 'projIframeIn 0.5s ease both' : 'none' }}
              srcDoc={buildSrcDoc(project.detailHtml || '')}
            />
          </>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <div style={{ padding: '48px 6%', overflowY: 'auto', height: '100%', background: 'linear-gradient(160deg, #06070c 0%, #04050a 100%)' }}>
            {project.image && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.04, filter: 'blur(30px)', pointerEvents: 'none' }} />
            )}
            <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, color: primary, textTransform: 'uppercase', marginBottom: 16 }}>Resultados del proyecto</div>
              <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 8, lineHeight: 1.1 }}>{clientName}</h2>
              {industry && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 32 }}>{industry}</div>}

              {project.description && (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, marginBottom: 40, borderLeft: `2px solid ${primary}50`, paddingLeft: 16 }}>{project.description}</p>
              )}

              {resultItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
                  {resultItems.map((r, i) => (
                    <div key={i} style={{ padding: '20px 16px', background: `${primary}08`, border: `1px solid ${primary}25`, borderRadius: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: primary, fontWeight: 800, letterSpacing: 0.5 }}>↑</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 4 }}>{r}</div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 200) }}
                style={{ padding: '16px 36px', background: primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 8px 32px ${primary}40`, transition: 'all 0.22s' }}>
                {t.projects?.contractThis || 'Quiero esto para mi negocio'} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div style={{ flexShrink: 0, display: 'none', padding: '12px 16px', gap: 10, background: 'rgba(4,5,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)' }} className="proj-mobile-bar">
        <style>{`@media(max-width:640px){.proj-mobile-bar{display:flex!important;}}`}</style>
        <button onClick={() => { onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 200) }}
          style={{ flex: 1, padding: '13px', background: primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer' }}>
          {t.projects?.contractThis || 'Contratar'} →
        </button>
        <button onClick={onClose} style={{ padding: '13px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD — diseño editorial con tilt 3D
// ─────────────────────────────────────────────────────────────────────
function ProjectCard({ proj, primary, t, onOpen, index }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)

  const clientName  = proj.client || proj.title || ''
  const industry    = proj.industry || proj.category || ''
  const description = proj.description || proj.desc || ''
  const results     = proj.results || ''
  const hasLanding  = !!(proj.detailHtml && proj.detailHtml.trim())
  const isClickable = hasLanding || hasValidUrl(proj.url)
  const resultItems = results ? results.split('·').map(r => r.trim()).filter(Boolean).slice(0, 2) : []

  function handleMouseMove(e) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top)  / rect.height
    setTilt({ x: (y - 0.5) * 8, y: (x - 0.5) * -8 })
    setMousePos({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onClick={() => isClickable && onOpen(proj)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        borderRadius: 20, overflow: 'hidden',
        cursor: isClickable ? 'pointer' : 'default',
        border: hovered ? `1px solid ${primary}50` : '1px solid rgba(255,255,255,0.08)',
        background: '#090a0f',
        transform: hovered ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)` : 'perspective(800px) rotateX(0) rotateY(0) translateY(0)',
        transition: hovered ? 'transform 0.1s ease, box-shadow 0.3s, border-color 0.3s' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.3s',
        boxShadow: hovered ? `0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px ${primary}20` : '0 4px 24px rgba(0,0,0,0.3)',
        height: '100%', position: 'relative',
      }}
    >
      {/* Spotlight */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, ${primary}12 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />

      {/* Badges */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {industry && (
          <div style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '4px 10px', borderRadius: 20 }}>
            {industry}
          </div>
        )}
        {hasLanding && (
          <div style={{ background: primary, color: 'white', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, padding: '4px 10px', borderRadius: 6, boxShadow: `0 3px 12px ${primary}50` }}>
            🌐 APP
          </div>
        )}
      </div>

      {/* Imagen */}
      {proj.image && (
        <div style={{ height: 200, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <img src={proj.image} alt={clientName} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: hovered ? 'brightness(0.6) saturate(1.15)' : 'brightness(0.45)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.65s cubic-bezier(0.16,1,0.3,1)',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #090a0f 0%, rgba(9,10,15,0.2) 55%, transparent 100%)' }} />

          {/* Open overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.28s' }}>
            <div style={{
              padding: '10px 24px', background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(10px)',
              border: `1px solid ${primary}60`, borderRadius: 24, color: primary,
              fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
              transform: hovered ? 'scale(1)' : 'scale(0.85)',
              transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {hasLanding ? '▶ Abrir Demo' : '↗ Ver Sitio'}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '20px 22px 22px', position: 'relative', zIndex: 1 }}>
        <div style={{ color: primary, fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
          {clientName}
        </div>
        {proj.title && proj.title !== clientName && (
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px', color: 'white', lineHeight: 1.3 }}>{proj.title}</h3>
        )}
        {description && (
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.65, margin: '0 0 14px' }}>
            {description.length > 100 ? description.slice(0, 100) + '…' : description}
          </p>
        )}

        {/* Results chips */}
        {resultItems.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {resultItems.map((r, i) => (
              <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: `${primary}10`, border: `1px solid ${primary}25`, color: primary, fontWeight: 700 }}>
                ↑ {r}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {isClickable && (
          <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: hovered ? primary : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
              {hasLanding ? (t.projects?.openApp || 'Ver demo') + ' ▶' : (t.projects?.visitSite || 'Ver sitio') + ' ↗'}
            </span>
            {/* Número del proyecto */}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
              {String(index + 1).padStart(2, '0')}
            </span>
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

  const primary  = brand?.primary || '#ff3c3c'
  const t        = useUIStrings(brand)
  const trackRef = useRef(null)
  const [activeProject, setActiveProject] = useState(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function checkScroll() {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [])

  const scrollBy = (dir) => trackRef.current?.scrollBy({ left: dir * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' })

  function handleOpen(proj) {
    if (!!(proj.detailHtml && proj.detailHtml.trim())) {
      setActiveProject(proj)
    } else if (hasValidUrl(proj.url)) {
      window.open(proj.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section id="proyectos" style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <style>{`
        @keyframes projCardReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .proj-track::-webkit-scrollbar{display:none}
        .proj-track{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* Header */}
      <div style={{ padding: '0 6%', textAlign: 'center', marginBottom: 52 }}>
        <p style={{ color: primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
          {t.projects.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, margin: '0 0 12px' }}>
          {t.projects.heading}{' '}
          <span style={{ color: primary }}>{t.projects.headingAccent}</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
          {t.projects.sub}
        </p>
      </div>

      {/* Track */}
      <div style={{ position: 'relative' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--bg), transparent)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--bg), transparent)', zIndex: 5, pointerEvents: 'none' }} />

        <div
          ref={trackRef}
          className="proj-track"
          style={{ display: 'flex', gap: CARD_GAP, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '8px 6% 16px', alignItems: 'stretch' }}
        >
          {projects.map((proj, i) => (
            <div key={proj.id || i} style={{ flex: `0 0 ${CARD_WIDTH}px`, scrollSnapAlign: 'start', animation: `projCardReveal 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both` }}>
              <ProjectCard proj={proj} primary={primary} t={t} onOpen={handleOpen} index={i} />
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        {projects.length > 2 && (
          <>
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              style={{
                position: 'absolute', top: '50%', left: '3%',
                transform: 'translateY(-50%)', zIndex: 10,
                width: 46, height: 46, borderRadius: '50%',
                background: canScrollLeft ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${canScrollLeft ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: canScrollLeft ? 'white' : 'rgba(255,255,255,0.2)',
                fontSize: 22, cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, lineHeight: 1,
                transition: 'all 0.2s',
              }}
            >‹</button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              style={{
                position: 'absolute', top: '50%', right: '3%',
                transform: 'translateY(-50%)', zIndex: 10,
                width: 46, height: 46, borderRadius: '50%',
                background: canScrollRight ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${canScrollRight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: canScrollRight ? 'white' : 'rgba(255,255,255,0.2)',
                fontSize: 22, cursor: canScrollRight ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, lineHeight: 1,
                transition: 'all 0.2s',
              }}
            >›</button>
          </>
        )}
      </div>

      {/* Shell */}
      {activeProject && (
        <ProjectShell project={activeProject} brand={brand} site={site} onClose={() => setActiveProject(null)} />
      )}
    </section>
  )
}