/**
 * ProjectsSection.jsx — iframe auto-translate + 100% responsivo
 * ÚNICO CAMBIO vs original: buildSrcDoc inyecta script de traducción automática
 * al idioma configurado en el panel (window.__SITE_LANGUAGE__).
 * Todo lo demás (shell, cards, animaciones, lógica) INTACTO.
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

// ── buildSrcDoc con traducción automática inyectada ──────────────────
function buildSrcDoc(html, targetLang) {
  const translateScript = `<script>
(function() {
  var _cache = {};

  function getTextNodes(root) {
    var walker = document.createTreeWalker(
      root, NodeFilter.SHOW_TEXT,
      { acceptNode: function(node) {
          var p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (['SCRIPT','STYLE','NOSCRIPT','META','LINK'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
          if (!node.textContent.trim()) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
      }}
    );
    var nodes = []; var n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  async function translateText(text, lang) {
    var key = lang + '_' + text.trim().slice(0, 60);
    if (_cache[key]) return _cache[key];
    try {
      var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + lang + '&dt=t&q=' + encodeURIComponent(text);
      var res = await fetch(url);
      if (!res.ok) return text;
      var data = await res.json();
      var tr = (data[0]||[]).map(function(c){return c[0]||'';}).join('');
      if (tr) _cache[key] = tr;
      return tr || text;
    } catch(e) { return text; }
  }

  async function translatePage(lang) {
    if (!lang || lang === 'auto') return;
    var nodes = getTextNodes(document.body);
    for (var i = 0; i < nodes.length; i += 8) {
      var batch = nodes.slice(i, i+8);
      await Promise.all(batch.map(async function(node) {
        var orig = node.textContent;
        if (!orig.trim()) return;
        var tr = await translateText(orig.trim(), lang);
        if (tr && tr !== orig.trim()) node.textContent = tr;
      }));
    }
  }

  // Escucha el lang enviado por el parent React
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'PT_LANG' && e.data.lang) {
      translatePage(e.data.lang);
    }
  });

  // Fallback via atributo data-pt-lang en <html>
  var htmlLang = document.documentElement.getAttribute('data-pt-lang');
  if (htmlLang) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ translatePage(htmlLang); });
    } else {
      translatePage(htmlLang);
    }
  }
})();
<\/script>`

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

  const inject = translateScript + injector

  if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
    return html
      .replace(/<html([^>]*)>/i, `<html$1 data-pt-lang="${targetLang || 'it'}">`)
      .replace(/<\/head>/i, inject + '</head>')
  }
  return `<!DOCTYPE html><html lang="es" data-pt-lang="${targetLang || 'it'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}a{color:inherit}</style>${inject}</head><body>${html}</body></html>`
}

// ─────────────────────────────────────────────────────────────────────
// PROJECT SHELL
// ─────────────────────────────────────────────────────────────────────
function ProjectShell({ project, brand, site, onClose }) {
  const iframeRef    = useRef(null)
  const [ready, setReady]         = useState(false)
  const [activeTab, setActiveTab] = useState('demo')
  const t         = useUIStrings(brand)
  const primary   = brand?.primary || '#ff3c3c'
  const brandName = brand?.name    || 'POLARTRONIC'
  const brandLogo = brand?.logo    || ''
  const targetLang = (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) || brand?.language || 'it'

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

  const clientName  = project.client || project.title || ''
  const industry    = project.industry || project.category || ''
  const resultItems = (project.results || '').split('·').map(r => r.trim()).filter(Boolean)
  const hasExternal = hasValidUrl(project.url)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', flexDirection: 'column', background: '#04050a', animation: 'projShellOpen 0.36s cubic-bezier(0.16,1,0.3,1) both' }}>
      <style>{`
        @keyframes projShellOpen{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
        @keyframes projBarIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes projLoaderSpin{to{transform:rotate(360deg)}}
        @keyframes projIframeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .proj-tab:hover{color:white!important;}
        .proj-back-btn:hover{background:rgba(255,255,255,0.1)!important;color:white!important;}
        .proj-hire-btn:hover{transform:translateY(-2px)!important;box-shadow:0 14px 36px ${primary}55!important;}
        .proj-ext-btn:hover{border-color:${primary}!important;color:${primary}!important;}
        @media(max-width:640px){
          .proj-shell-actions .proj-ext-btn{display:none!important;}
          .proj-shell-bar{padding:0 12px!important;gap:8px!important;}
          .proj-shell-info{display:none!important;}
        }
      `}</style>

      {/* TOP BAR */}
      <div className="proj-shell-bar" style={{ flexShrink: 0, height: 64, background: 'rgba(4,5,10,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: `1px solid rgba(255,255,255,0.07)`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, position: 'relative', zIndex: 2, animation: 'projBarIn 0.38s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, ${primary}50 40%, ${primary}50 60%, transparent 100%)` }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {brandLogo
            ? <img src={brandLogo} alt={brandName} style={{ height: 26, maxWidth: 120, objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.3rem', color: primary, letterSpacing: 2 }}>{brandName}</span>
          }
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        <div className="proj-shell-info" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {industry && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: primary, background: `${primary}15`, border: `1px solid ${primary}30`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{industry}</span>}
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName}</span>
        </div>

        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '3px', flexShrink: 0 }}>
          {[{ id: 'demo', label: '▶ Demo' }, ...(resultItems.length > 0 ? [{ id: 'results', label: '↑ Resultados' }] : [])].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="proj-tab"
              style={{ padding: 'clamp(5px,1vw,6px) clamp(8px,2vw,14px)', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: activeTab === tab.id ? primary : 'transparent', color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.18s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="proj-shell-actions" style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          {hasExternal && (
            <a href={project.url} target="_blank" rel="noreferrer" className="proj-ext-btn"
              style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              🔗 {t.projects?.visitSite || 'Ver sitio'}
            </a>
          )}
          <button onClick={() => { onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 200) }}
            className="proj-hire-btn"
            style={{ padding: 'clamp(7px,1.5vw,9px) clamp(12px,3vw,20px)', background: primary, color: 'white', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.22s', boxShadow: `0 4px 20px ${primary}35`, whiteSpace: 'nowrap' }}>
            {t.projects?.contractThis || 'Contratar'} →
          </button>
          <button onClick={onClose} className="proj-back-btn"
            style={{ padding: 'clamp(7px,1.5vw,9px) clamp(10px,2vw,14px)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'demo' && (
          <>
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.06)`, borderTopColor: primary, animation: 'projLoaderSpin 0.8s linear infinite' }} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Cargando...</div>
              </div>
            )}
            <iframe ref={iframeRef} title={`${clientName} app`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => {
                setReady(true)
                setTimeout(() => {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: 'PT_LANG', lang: targetLang },
                    '*'
                  )
                }, 150)
              }}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: 'white', opacity: ready ? 1 : 0, transition: 'opacity 0.45s ease' }}
              srcDoc={buildSrcDoc(project.detailHtml || '', targetLang)}
            />
          </>
        )}

        {activeTab === 'results' && (
          <div style={{ padding: 'clamp(32px,5vw,48px) clamp(16px,6%,80px)', overflowY: 'auto', height: '100%', background: 'linear-gradient(160deg, #06070c 0%, #04050a 100%)' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, color: primary, textTransform: 'uppercase', marginBottom: 16 }}>Resultados</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 8, lineHeight: 1.1 }}>{clientName}</h2>
              {project.description && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, marginBottom: 40, borderLeft: `2px solid ${primary}50`, paddingLeft: 16 }}>{project.description}</p>}
              {resultItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 40 }}>
                  {resultItems.map((r, i) => (
                    <div key={i} style={{ padding: '20px 16px', background: `${primary}08`, border: `1px solid ${primary}25`, borderRadius: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: primary, fontWeight: 800 }}>↑</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 4 }}>{r}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 200) }}
                style={{ padding: '16px 36px', background: primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 8px 32px ${primary}40` }}>
                {t.projects?.contractThis || 'Quiero esto'} →
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
// PROJECT CARD
// ─────────────────────────────────────────────────────────────────────
function ProjectCard({ proj, primary, t, onOpen, index }) {
  const [hovered, setHovered]   = useState(false)
  const [tilt, setTilt]         = useState({ x: 0, y: 0 })
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

  return (
    <div ref={cardRef} onClick={() => isClickable && onOpen(proj)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
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
      }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, ${primary}12 0%, transparent 70%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />

      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {industry && <div style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '4px 10px', borderRadius: 20 }}>{industry}</div>}
        {hasLanding && <div style={{ background: primary, color: 'white', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, padding: '4px 10px', borderRadius: 6, boxShadow: `0 3px 12px ${primary}50` }}>🌐 APP</div>}
      </div>

      {proj.image && (
        <div style={{ height: 200, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <img src={proj.image} alt={clientName} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: hovered ? 'brightness(0.6) saturate(1.15)' : 'brightness(0.45)', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'all 0.65s cubic-bezier(0.16,1,0.3,1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #090a0f 0%, rgba(9,10,15,0.2) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.28s' }}>
            <div style={{ padding: '10px 24px', background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(10px)', border: `1px solid ${primary}60`, borderRadius: 24, color: primary, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', transform: hovered ? 'scale(1)' : 'scale(0.85)', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {hasLanding ? '▶ Abrir Demo' : '↗ Ver Sitio'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 'clamp(16px,3vw,20px) clamp(16px,3vw,22px) clamp(18px,3vw,22px)', position: 'relative', zIndex: 1 }}>
        <div style={{ color: primary, fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{clientName}</div>
        {proj.title && proj.title !== clientName && <h3 style={{ fontSize: 'clamp(0.95rem,2.5vw,1.05rem)', fontWeight: 800, margin: '0 0 8px', color: 'white', lineHeight: 1.3 }}>{proj.title}</h3>}
        {description && <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.65, margin: '0 0 14px' }}>{description.length > 100 ? description.slice(0, 100) + '…' : description}</p>}
        {resultItems.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {resultItems.map((r, i) => <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: `${primary}10`, border: `1px solid ${primary}25`, color: primary, fontWeight: 700 }}>↑ {r}</span>)}
          </div>
        )}
        {isClickable && (
          <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: hovered ? primary : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
              {hasLanding ? (t.projects?.openApp || 'Ver demo') + ' ▶' : (t.projects?.visitSite || 'Ver sitio') + ' ↗'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>{String(index + 1).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────
export default function ProjectsSection({ projects, brand, site }) {
  if (!projects?.length) return null

  const primary  = brand?.primary || '#ff3c3c'
  const t        = useUIStrings(brand)
  const trackRef = useRef(null)
  const [activeProject, setActiveProject]   = useState(null)
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
    <section id="proyectos" style={{ padding: 'clamp(60px,10vw,100px) 0', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
      <style>{`
        @keyframes projCardReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .proj-track::-webkit-scrollbar{display:none}
        .proj-track{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div style={{ padding: '0 clamp(16px,6%,80px)', textAlign: 'center', marginBottom: 52 }}>
        <p style={{ color: primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>{t.projects.eyebrow}</p>
        <h2 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 800, margin: '0 0 12px' }}>
          {t.projects.heading}{' '}<span style={{ color: primary }}>{t.projects.headingAccent}</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>{t.projects.sub}</p>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--bg), transparent)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--bg), transparent)', zIndex: 5, pointerEvents: 'none' }} />

        <div ref={trackRef} className="proj-track"
          style={{ display: 'flex', gap: CARD_GAP, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: `8px clamp(16px,6%,80px) 16px`, alignItems: 'stretch' }}>
          {projects.map((proj, i) => (
            <div key={proj.id || i} style={{ flex: `0 0 clamp(260px, 80vw, ${CARD_WIDTH}px)`, scrollSnapAlign: 'start', animation: `projCardReveal 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both` }}>
              <ProjectCard proj={proj} primary={primary} t={t} onOpen={handleOpen} index={i} />
            </div>
          ))}
        </div>

        {projects.length > 2 && (
          <>
            <button onClick={() => scrollBy(-1)} disabled={!canScrollLeft} style={{ position: 'absolute', top: '50%', left: 'clamp(4px,2%,16px)', transform: 'translateY(-50%)', zIndex: 10, width: 46, height: 46, borderRadius: '50%', background: canScrollLeft ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: `1px solid ${canScrollLeft ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, color: canScrollLeft ? 'white' : 'rgba(255,255,255,0.2)', fontSize: 22, cursor: canScrollLeft ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, transition: 'all 0.2s' }}>‹</button>
            <button onClick={() => scrollBy(1)} disabled={!canScrollRight} style={{ position: 'absolute', top: '50%', right: 'clamp(4px,2%,16px)', transform: 'translateY(-50%)', zIndex: 10, width: 46, height: 46, borderRadius: '50%', background: canScrollRight ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: `1px solid ${canScrollRight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, color: canScrollRight ? 'white' : 'rgba(255,255,255,0.2)', fontSize: 22, cursor: canScrollRight ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, transition: 'all 0.2s' }}>›</button>
          </>
        )}
      </div>

      {activeProject && (
        <ProjectShell project={activeProject} brand={brand} site={site} onClose={() => setActiveProject(null)} />
      )}
    </section>
  )
}