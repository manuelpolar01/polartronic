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

// ── MODAL LANDING ──
function ProjectLandingModal({ project, site, onClose }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey) }
  }, [onClose])

  const handleMessage = useCallback(async (e) => {
    if (e.source !== iframeRef.current?.contentWindow) return
    if (e.data?.type === 'PROJECT_LEAD') {
      const raw = e.data.data
      const lead = {
        name: raw.name || raw.nombre || '',
        email: raw.email || '',
        phone: raw.phone || raw.telefono || '',
        zona: raw.zona || raw.city || '',
        servicio: project.title || project.client || 'App Consulta',
        message: raw.message || raw.mensaje || '',
      }
      try {
        await processNewLead(lead, site)
        iframeRef.current?.contentWindow.postMessage({ type: 'LEAD_SUCCESS' }, '*')
      } catch(err) { console.error('[Project Lead Error]', err) }
    }
  }, [project, site])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  return (
    <div onClick={e => { if(e.target === e.currentTarget) onClose() }} style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.95)', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', animation:'projLandingIn 0.35s cubic-bezier(0.23,1,0.32,1) both' }}>
      <style>{`@keyframes projLandingIn { from { opacity:0; } to { opacity:1; } }`}</style>
      <div style={{ flexShrink:0, height:60, background:'rgba(10,10,10,0.98)', borderBottom:'1px solid var(--primary)30', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'var(--primary)', textTransform:'uppercase', letterSpacing:2 }}>🌐 APP ONLINE</span>
          <span style={{ fontSize:15, fontWeight:700, color:'white' }}>{project.title || project.client}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/" onClick={() => window.location.href = '/'} style={{ background:'var(--primary)', color:'white', padding:'8px 14px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:700, transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.9'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>🏠 Volver a Polartronic</a>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
      </div>
      <div style={{ flex:1, overflow:'hidden' }}>
        <iframe ref={iframeRef} title={`${project.client} app`} sandbox="allow-scripts allow-same-origin allow-popups allow-forms" style={{ width:'100%', height:'100%', border:'none' }} srcDoc={buildProjectSrcDoc(project)} />
      </div>
    </div>
  )
}

function buildProjectSrcDoc(proj) {
  const html = proj.detailHtml || ''
  const injector = `<script>
    document.addEventListener('DOMContentLoaded', () => {
      const handleSubmit = (e) => {
        if(e.target.tagName === 'FORM') {
          e.preventDefault()
          const fd = new FormData(e.target)
          window.parent.postMessage({ type:'PROJECT_LEAD',  Object.fromEntries(fd) }, '*')
        }
      }
      document.addEventListener('submit', handleSubmit, true)
    })
  </script>`
  if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
    return html.replace(/<\/head>/i, `${injector}</head>`)
  }
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}</style>${injector}</head><body>${html}</body></html>`
}

export default function ProjectsSection({ projects, brand, site }) {
  if (!projects?.length) return null
  const primary  = brand?.primary || 'var(--primary)'
  const t        = useUIStrings(brand)
  const trackRef = useRef(null)
  const [activeProject, setActiveProject] = useState(null)

  const scrollLeft  = () => trackRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  const scrollRight = () => trackRef.current?.scrollBy({ left:  SCROLL_STEP, behavior: 'smooth' })

  const hasLanding = (p) => !!(p.detailHtml && p.detailHtml.trim())

  return (
    <section id="proyectos" style={{ padding:'100px 0', background:'rgba(255,255,255,0.01)', overflow:'hidden' }}>
      <div style={{ padding:'0 6%', textAlign:'center', marginBottom:48 }}>
        <p style={{ color:primary, fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:4, marginBottom:12 }}>{t.projects.eyebrow}</p>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800 }}>{t.projects.heading} <span style={{ color:primary }}>{t.projects.headingAccent}</span></h2>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, marginTop:12, maxWidth:500, margin:'12px auto 0' }}>{t.projects.sub}</p>
      </div>
      <div style={{ position:'relative' }}>
        <div ref={trackRef} style={{ display:'flex', gap:CARD_GAP, overflowX:'auto', scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', paddingLeft:'6%', paddingRight:'6%', paddingBottom:8, msOverflowStyle:'none', scrollbarWidth:'none' }}>
          <style>{`#proyectos div::-webkit-scrollbar { display:none; }`}</style>
          {projects.map((proj, i) => (
            <div key={proj.id || i} style={{ flex:'0 0 auto', width:CARD_WIDTH, scrollSnapAlign:'start' }}>
              <ProjectCard proj={proj} primary={primary} t={t} onOpen={() => setActiveProject(proj)} hasLanding={hasLanding} />
            </div>
          ))}
        </div>
        {projects.length > 2 && (
          <>
            <button onClick={scrollLeft} aria-label="Anterior" style={arrowStyle('left')}>‹</button>
            <button onClick={scrollRight} aria-label="Siguiente" style={arrowStyle('right')}>›</button>
          </>
        )}
      </div>
      {activeProject && (
        hasLanding(activeProject) ? (
          <ProjectLandingModal project={activeProject} site={site} onClose={() => setActiveProject(null)} />
        ) : (
          activeProject.url && window.open(activeProject.url, '_blank')
        )
      )}
    </section>
  )
}

function arrowStyle(side) {
  return { position:'absolute', top:'50%', [side]:'calc(6% - 22px)', transform:'translateY(-50%)', width:44, height:44, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'50%', color:'rgba(255,255,255,0.8)', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, lineHeight:1, padding:0 }
}

function ProjectCard({ proj, primary, t, onOpen, hasLanding }) {
  const [hovered, setHovered] = useState(false)
  const client = proj.client || proj.title || ''
  const industry = proj.industry || proj.category || ''
  const title = proj.title || ''
  const description = proj.description || proj.desc || ''
  const results = proj.results || ''
  const rawUrl = proj.url || proj.link || ''
  const isValid = hasValidUrl(rawUrl)
  const hasL = hasLanding(proj)
  const isClickable = hasL || isValid

  const resultItems = results ? results.split('·').map(r => r.trim()).filter(Boolean) : []
  const cardStyle = {
    display:'flex', flexDirection:'column', borderRadius:20, overflow:'hidden',
    border: hovered ? `1px solid ${primary}` : '1px solid rgba(255,255,255,0.07)',
    textDecoration:'none', background: hovered ? 'rgba(255,60,60,0.03)' : 'rgba(255,255,255,0.02)',
    transition:'all 0.4s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
    boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
    cursor: isClickable ? 'pointer' : 'default', height:'100%', color:'inherit',
  }

  const inner = (
    <>
      {proj.image && (
        <div style={{ height:200, overflow:'hidden', position:'relative', flexShrink:0 }}>
          <img src={proj.image} alt={client} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter: hovered ? 'brightness(0.65)' : 'brightness(0.5)', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition:'all 0.5s cubic-bezier(0.23,1,0.32,1)' }} />
          {industry && (
            <div style={{ position:'absolute', top:14, left:14, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, padding:'4px 10px', borderRadius:20 }}>{industry}</div>
          )}
          {hasL && (
            <div style={{ position:'absolute', top:14, right:14, background:'var(--primary)', color:'white', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:1, padding:'4px 10px', borderRadius:6 }}>🌐 APP</div>
          )}
        </div>
      )}
      <div style={{ padding:'22px 24px 24px', display:'flex', flexDirection:'column', flex:1 }}>
        <div style={{ marginBottom:10 }}>
          <div style={{ color:primary, fontWeight:800, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>{client}</div>
          {title && title !== client && <h3 style={{ fontSize:'1.1rem', fontWeight:700, margin:0, lineHeight:1.3, color:'rgba(255,255,255,0.9)' }}>{title}</h3>}
        </div>
        {description && <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.7, margin:'0 0 16px', flex:1 }}>{description}</p>}
        {resultItems.length > 0 && (
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14, marginTop:'auto', display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.25)', marginBottom:4 }}>{t.projects.results}</div>
            {resultItems.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.7)' }}>
                <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(255,60,60,0.12)', border:`1px solid ${primary}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:primary, flexShrink:0 }}>▲</span>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )

  return isClickable ? (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => hasL ? onOpen() : window.open(rawUrl, '_blank')} style={cardStyle}>{inner}</div>
  ) : (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={cardStyle}>{inner}</div>
  )
}