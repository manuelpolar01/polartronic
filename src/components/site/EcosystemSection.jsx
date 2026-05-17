/**
 * EcosystemSection.jsx — v6 PREMIUM REDESIGN + traducción editorial
 * ─────────────────────────────────────────────────────────────────────────
 * ÚNICO CAMBIO respecto al original:
 *   - useTranslatedArray aplicado a `ecosystems` para traducir:
 *     title, desc, category, extraText
 *   - Los features (array de strings) se traducen item a item via
 *     useTranslatedArray con campo 'features' (array plano → se maneja
 *     dentro del hook convirtiendo a strings individuales)
 *
 * TODO LO DEMÁS INTACTO: shell, drawer, cards, animaciones, lógica iframe.
 */

import { useState, useEffect, useRef } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'
import { useTranslatedArray } from '../../hooks/useTranslatedContent'

// ── Helpers ────────────────────────────────────────────────────────────
function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// Aplana ecosystems para traducir: convierte features array a string JSON
// para que useTranslatedArray pueda procesar el objeto completo
function prepareForTranslation(ecosystems) {
  return ecosystems.map(eco => ({
    ...eco,
    // features se serializa para que el hook lo trate como string
    // y se parsea de vuelta tras la traducción
    _featuresStr: parseFeatures(eco.features).join(' ||| '),
  }))
}

function restoreFeatures(translatedEcos, originalEcos) {
  return translatedEcos.map((eco, i) => {
    const featuresStr = eco._featuresStr || ''
    const features = featuresStr
      ? featuresStr.split(' ||| ').filter(Boolean)
      : parseFeatures(originalEcos[i]?.features)
    return { ...eco, _translatedFeatures: features }
  })
}

// ─────────────────────────────────────────────────────────────────────
// FULLSCREEN SHELL — sin cambios
// ─────────────────────────────────────────────────────────────────────
function EcosystemFullscreen({ eco, brand, onClose, t }) {
  const iframeRef  = useRef(null)
  const [iframeReady, setIframeReady] = useState(false)
  const primary    = brand?.primary || '#ff3c3c'
  const brandName  = brand?.name   || 'POLARTRONIC'
  const brandLogo  = brand?.logo   || ''

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  function buildSrcDoc(html) {
    const targetLang = (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) || brand?.language || 'it'

    // Script que traduce via postMessage — el lang llega del parent React
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
      var tr = (data[0] || []).map(function(c){return c[0]||'';}).join('');
      if (tr) _cache[key] = tr;
      return tr || text;
    } catch(e) { return text; }
  }

  async function translatePage(lang) {
    if (!lang || lang === 'auto') return;
    var nodes = getTextNodes(document.body);
    for (var i = 0; i < nodes.length; i += 8) {
      var batch = nodes.slice(i, i + 8);
      await Promise.all(batch.map(async function(node) {
        var orig = node.textContent;
        if (!orig.trim()) return;
        var tr = await translateText(orig.trim(), lang);
        if (tr && tr !== orig.trim()) node.textContent = tr;
      }));
    }
  }

  // Escucha el lang enviado por el parent React via postMessage
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'PT_LANG' && e.data.lang) {
      translatePage(e.data.lang);
    }
  });

  // Fallback: si el iframe ya tiene el lang en el atributo data del html
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

    // CSS + Script que oculta CUALQUIER botón X dentro del demo HTML
    const hideCloseScript = `<style>
      /* Ocultar por clase/id comunes de cierre */
      [class*="close"],[class*="Close"],[class*="cerrar"],[class*="cancel"],
      [class*="Cancel"],[class*="dismiss"],[class*="chiudi"],[class*="fermer"],
      [id*="close"],[id*="Close"],[id*="cancel"],[id*="dismiss"] {
        display: none !important;
      }
    </style>
    <script>
(function() {
  function hideX() {
    document.querySelectorAll('button, a, span, div, i').forEach(function(el) {
      // Sin hijos de tipo elemento — es un nodo hoja
      var hasNoElementChildren = el.children.length === 0;
      var txt = (el.innerText || el.textContent || '').trim();
      // Texto que sea solo X en cualquier variante
      var isX = hasNoElementChildren && /^[×✕✖xX❌]$|^[xX]\s*$/.test(txt);
      // Clase o id que sugiera cierre
      var cls = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
      var isClose = /(close|cerrar|cancel|dismiss|chiudi|fermer|schlie|back|volver|zurück|retour)/.test(cls);
      if (isX || isClose) {
        el.style.cssText += 'display:none!important;visibility:hidden!important;pointer-events:none!important;';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideX);
  } else { hideX(); }
  setTimeout(hideX, 300);
  setTimeout(hideX, 800);
  setTimeout(hideX, 2000);
})();
<\/script>`

    const inject = hideCloseScript + translateScript

    if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) {
      // Inyecta data-pt-lang en el tag <html> y el script en <head>
      return html
        .replace(/<html([^>]*)>/i, `<html$1 data-pt-lang="${targetLang}">`)
        .replace(/<\/head>/i, inject + '</head>')
    }
    return `<!DOCTYPE html><html lang="es" data-pt-lang="${targetLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111}img{max-width:100%}</style>${inject}</head><body>${html}</body></html>`
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      background: '#05070a',
      animation: 'shellOpen 0.38s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <style>{`
        @keyframes shellOpen{from{opacity:0;transform:scale(0.985)}to{opacity:1;transform:scale(1)}}
        @keyframes iframeReveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barSlide{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        .shell-back-btn:hover{background:rgba(255,255,255,0.12)!important;color:white!important;border-color:rgba(255,255,255,0.3)!important;}
        .shell-contact-btn:hover{transform:translateY(-2px)!important;box-shadow:0 12px 32px ${primary}60!important;}
      `}</style>

      <div style={{
        flexShrink: 0, height: 62,
        background: 'rgba(5,7,10,0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${primary}25`,
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
        animation: 'barSlide 0.4s cubic-bezier(0.16,1,0.3,1) both',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${primary}80, transparent)` }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {brandLogo
            ? <img src={brandLogo} alt={brandName} style={{ height: 28, maxWidth: 130, objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.4rem', color: primary, letterSpacing: 2 }}>{brandName}</span>
          }
        </div>

        <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {eco.category && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: primary, background: `${primary}15`, border: `1px solid ${primary}35`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{eco.category}</span>
          )}
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eco.title}</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>DEMO</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          <a href="#contacto" onClick={(e) => { e.preventDefault(); onClose(); setTimeout(() => { document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }) }, 220) }}
            className="shell-contact-btn"
            style={{ padding: '9px 20px', background: primary, color: 'white', borderRadius: 9, fontWeight: 800, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.22s', boxShadow: `0 4px 20px ${primary}35`, whiteSpace: 'nowrap' }}>
            {t.ecosystems?.ctaContact || 'Contratar'} →
          </a>
          <button onClick={onClose} className="shell-back-btn"
            style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            {t.ecosystems?.shellBack || '← Volver'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!iframeReady && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: '#08090c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.06)`, borderTopColor: primary, animation: 'shellSpin 0.8s linear infinite' }} />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Cargando demo...</div>
            <style>{`@keyframes shellSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        <iframe ref={iframeRef} title={`${eco.title} demo`} sandbox="allow-scripts allow-same-origin"
          onLoad={() => {
            setIframeReady(true)
            setTimeout(() => {
              iframeRef.current?.contentWindow?.postMessage(
                { type: 'PT_LANG', lang: targetLang },
                '*'
              )
            }, 150)
          }}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: 'white', opacity: iframeReady ? 1 : 0, transition: 'opacity 0.4s ease', animation: iframeReady ? 'iframeReveal 0.5s ease both' : 'none' }}
          srcDoc={buildSrcDoc(eco.detailHtml || '')} />
      </div>

      <div style={{ flexShrink: 0, display: 'none', padding: '12px 16px', gap: 10, background: 'rgba(4,5,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)' }} className="eco-mobile-bar">
        <style>{`.eco-mobile-bar{@media(max-width:640px){display:flex!important;}}`}</style>
        <a href="#contacto" onClick={(e) => { e.preventDefault(); onClose(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 220) }}
          style={{ flex: 1, padding: '13px', background: primary, color: 'white', borderRadius: 10, fontWeight: 800, fontSize: 13, textDecoration: 'none', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {t.ecosystems?.ctaContact || 'Contratar'} →
        </a>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// FALLBACK DRAWER — sin cambios, recibe eco ya traducido
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

  // Usa _translatedFeatures si existe, sino parsea el original
  const features = eco._translatedFeatures || parseFeatures(eco.features)

  const relatedProjects = projects.filter(p => {
    const pi = (p.industry || p.category || '').toLowerCase()
    const ec = (eco.category || eco.title || '').toLowerCase()
    return pi && ec && (pi.includes(ec.split(' ')[0]) || ec.includes(pi.split(' ')[0]))
  }).slice(0, 3)

  return (
    <>
      <style>{`
        @keyframes drawerIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes backdropIn{from{opacity:0}to{opacity:1}}
        .drawer-cta-primary:hover{transform:translateY(-2px)!important;box-shadow:0 12px 32px ${primary}50!important;}
        .drawer-cta-ghost:hover{border-color:${primary}!important;color:${primary}!important;}
        .feature-item:hover{background:rgba(255,255,255,0.03)!important;padding-left:14px!important;}
      `}</style>

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'backdropIn 0.28s ease both', cursor: 'pointer' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8100, width: 'min(500px, 92vw)', background: 'linear-gradient(160deg, #0d0e12 0%, #08090c 100%)', borderLeft: `1px solid ${primary}20`, display: 'flex', flexDirection: 'column', animation: 'drawerIn 0.42s cubic-bezier(0.16,1,0.3,1) both', boxShadow: `-32px 0 80px rgba(0,0,0,0.7)` }}>

        <div style={{ height: 3, background: `linear-gradient(90deg, ${primary}, ${primary}40, transparent)`, flexShrink: 0 }} />

        <div style={{ position: 'relative', flexShrink: 0 }}>
          {eco.image && (
            <div style={{ height: 180, overflow: 'hidden' }}>
              <img src={eco.image} alt={eco.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, #0d0e12 0%, transparent 60%)` }} />
            </div>
          )}
          <div style={{ padding: eco.image ? '0 24px 20px' : '24px 24px 20px', position: eco.image ? 'absolute' : 'relative', bottom: eco.image ? 0 : 'auto', left: 0, right: 0 }}>
            {eco.category && (
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, color: primary, textTransform: 'uppercase', marginBottom: 6 }}>{eco.category}</div>
            )}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>{eco.title}</h2>
            {eco.price && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: primary }}>{eco.price}</span>
                {eco.period && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{eco.period}</span>}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>
          {eco.desc && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 24, borderLeft: `2px solid ${primary}40`, paddingLeft: 14 }}>
              {eco.desc}
            </p>
          )}

          {relatedProjects.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
                {t.ecosystems?.successCases || 'Casos de éxito'}
              </div>
              {relatedProjects.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', marginBottom: 8 }}>
                  {p.image && <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{p.client || p.title}</div>
                    {p.results && <div style={{ fontSize: 11, color: primary, marginTop: 2 }}>↑ {p.results.split('·')[0].trim()}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {features.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>
                {t.ecosystems?.benefits || 'Incluye'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {features.map((f, i) => (
                  <div key={i} className="feature-item" style={{ display: 'flex', gap: 10, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', transition: 'all 0.18s' }}>
                    <span style={{ color: primary, flexShrink: 0, fontWeight: 900, fontSize: 12 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {eco.extraText && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>{eco.extraText}</p>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10 }}>
          <a href="#contacto" onClick={onClose} className="drawer-cta-primary"
            style={{ flex: 1, padding: '14px 20px', background: primary, color: 'white', borderRadius: 10, fontWeight: 800, fontSize: 13, letterSpacing: 0.8, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', transition: 'all 0.22s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 20px ${primary}30` }}>
            {t.ecosystems?.ctaContact || 'Hablemos'} →
          </a>
          <a href="#proyectos" onClick={onClose} className="drawer-cta-ghost"
            style={{ flex: 1, padding: '14px 20px', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 10, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {t.ecosystems?.ctaProjects || 'Proyectos'} →
          </a>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ECOSYSTEM CARD — recibe eco ya traducido
// ─────────────────────────────────────────────────────────────────────
function EcosystemCard({ eco, idx, primary, t, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)
  // Usa features traducidas si están disponibles
  const features = (eco._translatedFeatures || parseFeatures(eco.features)).slice(0, 3)
  const hasLanding = !!(eco.detailHtml && eco.detailHtml.trim())

  function handleMouseMove(e) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  return (
    <div ref={cardRef} onClick={() => onOpen(idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer', position: 'relative',
        border: eco.featured ? `1px solid ${primary}55` : hovered ? `1px solid ${primary}45` : '1px solid rgba(255,255,255,0.07)',
        background: '#0a0b0e',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.4s',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px ${primary}25` : '0 4px 20px rgba(0,0,0,0.3)',
        height: '100%',
      }}>
      {hovered && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, ${primary}10 0%, transparent 70%)`, transition: 'opacity 0.2s' }} />
      )}
      {eco.featured && (
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, background: primary, color: 'white', fontSize: 9, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, boxShadow: `0 4px 16px ${primary}50` }}>★ Destacado</div>
      )}
      {hasLanding && (
        <div style={{ position: 'absolute', top: eco.featured ? 42 : 14, right: 14, zIndex: 3, background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.4)', color: '#5aacff', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>🌐 Demo live</div>
      )}
      {eco.image && (
        <div style={{ height: 180, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <img src={eco.image} alt={eco.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: hovered ? 'brightness(0.6) saturate(1.1)' : 'brightness(0.45)', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0b0e 0%, rgba(10,11,14,0.3) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,7,10,0.75)', backdropFilter: 'blur(10px)', border: `2px solid ${primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: hasLanding ? 22 : 20, color: primary, transform: hovered ? 'scale(1)' : 'scale(0.6)', transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 32px ${primary}40` }}>
              {hasLanding ? '▶' : '→'}
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: '20px 22px 22px', position: 'relative', zIndex: 1 }}>
        {eco.category && <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: primary, marginBottom: 6 }}>{eco.category}</div>}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px', color: 'white', lineHeight: 1.2 }}>{eco.title}</h3>
        {eco.price && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: primary }}>{eco.price}</span>
            {eco.period && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{eco.period}</span>}
          </div>
        )}
        {eco.desc && <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.65, margin: '0 0 14px' }}>{eco.desc}</p>}
        {features.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: primary, flexShrink: 0, fontWeight: 900 }}>✓</span>{f}
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: hovered ? primary : 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}>
            {hasLanding ? (t.ecosystems?.viewDetail || 'Ver demo') + ' ▶' : (t.ecosystems?.viewDetail || 'Ver detalle') + ' →'}
          </span>
          {hovered && <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${primary}60, transparent)` }} />}
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

  const primary = brand?.primary || '#ff3c3c'

  // Preparar para traducción: title, desc, category, extraText, _featuresStr
  const prepared = prepareForTranslation(ecosystems)
  const translatedRaw = useTranslatedArray(
    prepared,
    ['title', 'desc', 'category', 'extraText', '_featuresStr'],
    brand
  )
  // Restaurar features como array desde _featuresStr traducido
  const translatedEcosystems = restoreFeatures(translatedRaw, ecosystems)

  const selectedEco = selected !== null ? translatedEcosystems[selected] : null
  const hasLanding  = selectedEco && !!(selectedEco.detailHtml && selectedEco.detailHtml.trim())

  return (
    <section id="ecosistemas" style={{ padding: '100px 6%' }}>
      <style>{`
        @keyframes cardReveal{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        #ecosistemas .eco-card{animation:cardReveal 0.55s cubic-bezier(0.16,1,0.3,1) both;}
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ color: primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
          {t.ecosystems?.eyebrow || 'Grupos Partners'}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          {t.ecosystems?.headingPrefix || 'Nuestras'}{' '}
          <span style={{ color: primary }}>{t.ecosystems?.heading || 'Membresías'}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
        {translatedEcosystems.map((eco, idx) => (
          <div key={eco.id || idx} className="eco-card" style={{ animationDelay: `${idx * 0.07}s` }}>
            <EcosystemCard eco={eco} idx={idx} primary={primary} t={t} onOpen={setSelected} />
          </div>
        ))}
      </div>

      {selectedEco && hasLanding && (
        <EcosystemFullscreen eco={selectedEco} brand={brand} onClose={() => setSelected(null)} t={t} />
      )}
      {selectedEco && !hasLanding && (
        <EcosystemDrawer eco={selectedEco} primary={primary} onClose={() => setSelected(null)} t={t} projects={projects} />
      )}
    </section>
  )
}