import { useState, useEffect } from 'react'
import { useUIStrings }        from '../../hooks/useUIStrings'

function BrandLogo({ brand, scrolled }) {
  const logo    = brand?.logo    || ''
  const name    = brand?.name    || 'POLARTRONIC'
  const primary = brand?.primary || '#ff3c3c'
  const layout  = brand?.logoLayout || (logo ? 'logo-only' : 'name-only')
  const imgH    = scrolled ? 28 : 36

  if (layout === 'logo-only') {
    return logo
      ? <img src={logo} alt={name} style={{ height: imgH, maxWidth: 180, objectFit: 'contain', transition: 'height 0.4s' }} />
      : <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: primary, letterSpacing: 2 }}>{name}</span>
  }
  if (layout === 'logo-name-side') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logo && <img src={logo} alt={name} style={{ height: imgH - 4, maxWidth: 60, objectFit: 'contain', transition: 'height 0.4s' }} />}
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: scrolled ? '1.5rem' : '1.8rem', color: primary, letterSpacing: 2, transition: 'font-size 0.4s' }}>{name}</span>
      </div>
    )
  }
  if (layout === 'logo-name-stack') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
        {logo && <img src={logo} alt={name} style={{ height: scrolled ? 18 : 22, maxWidth: 100, objectFit: 'contain', transition: 'height 0.4s' }} />}
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: scrolled ? '0.85rem' : '1rem', color: primary, letterSpacing: 2, lineHeight: 1, transition: 'font-size 0.4s' }}>{name}</span>
      </div>
    )
  }
  return <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: primary, letterSpacing: 2 }}>{name}</span>
}

// ── Icono hamburguesa animado ─────────────────────────────────────────
function HamburgerIcon({ open, primary }) {
  return (
    <div style={{ width: 22, height: 16, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <span style={{
        display: 'block', height: 2, borderRadius: 2,
        background: open ? primary : 'rgba(255,255,255,0.8)',
        transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
        transformOrigin: 'center',
      }} />
      <span style={{
        display: 'block', height: 2, borderRadius: 2,
        background: open ? primary : 'rgba(255,255,255,0.8)',
        transform: open ? 'scaleX(0)' : 'scaleX(1)',
        opacity: open ? 0 : 1,
        transition: 'all 0.25s cubic-bezier(0.23,1,0.32,1)',
        transformOrigin: 'center',
      }} />
      <span style={{
        display: 'block', height: 2, borderRadius: 2,
        background: open ? primary : 'rgba(255,255,255,0.8)',
        transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
        transformOrigin: 'center',
      }} />
    </div>
  )
}

export default function NavBar({ brand }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useUIStrings(brand)

  const primary = brand?.primary || '#ff3c3c'
  const name    = brand?.name    || 'POLARTRONIC'

  const NAV_LINKS = [
    { href: '#home',        label: t.nav.home,        num: '01' },
    { href: '#servicios',   label: t.nav.services,    num: '02' },
    { href: '#ecosistemas', label: t.nav.memberships, num: '03' },
    { href: '#proyectos',   label: t.nav.projects,    num: '04' },
    { href: '#testimonios', label: t.nav.clients,     num: '05' },
    { href: '#contacto',    label: t.nav.contact,     num: '06' },
  ]

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav    { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }

        .nav-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover { color: ${primary}; }

        @keyframes menuOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes menuFooterIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px 0;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          transition: padding-left 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .mobile-nav-item:last-child { border-bottom: none; }
        .mobile-nav-item:hover { padding-left: 8px; }
        .mobile-nav-item::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: ${primary};
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .mobile-nav-item:hover::after { transform: scaleY(1); }
        .mobile-nav-item:hover .mobile-nav-label { color: white; }
        .mobile-nav-item:hover .mobile-nav-num   { color: ${primary}; }
        .mobile-nav-item:hover .mobile-nav-arrow { transform: translateX(6px); opacity: 1; }

        .mobile-nav-num {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 2px;
          min-width: 24px;
          transition: color 0.3s;
        }
        .mobile-nav-label {
          font-size: clamp(1.6rem, 7vw, 2.2rem);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.75);
          flex: 1;
          transition: color 0.3s;
        }
        .mobile-nav-arrow {
          font-size: 18px;
          color: ${primary};
          opacity: 0;
          transform: translateX(0);
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          flex-shrink: 0;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, width: '100%',
        zIndex: 1000,
        height: scrolled ? 64 : 80,
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(3,3,3,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        boxSizing: 'border-box',
      }}>
        <a href="#home" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <BrandLogo brand={brand} scrolled={scrolled} />
        </a>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ gap: 28, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          className="mobile-menu-btn"
          aria-label="Menu"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${menuOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}`,
            width: 44, height: 44, borderRadius: 12,
            cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
            flexShrink: 0,
            padding: 0,
          }}
        >
          <HamburgerIcon open={menuOpen} primary={primary} />
        </button>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(3,3,3,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'menuOverlayIn 0.3s ease both',
            overflowY: 'auto',
          }}
        >
          {/* Glow decorativo de fondo */}
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%',
            width: '60%', height: '60%',
            background: `radial-gradient(ellipse, ${primary}12 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', right: '-10%',
            width: '50%', height: '50%',
            background: `radial-gradient(ellipse, ${primary}08 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Header del overlay — logo + cerrar */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6%',
            height: 80, flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <BrandLogo brand={brand} scrolled={false} />
            </a>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                width: 44, height: 44, borderRadius: 12,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <HamburgerIcon open={true} primary={primary} />
            </button>
          </div>

          {/* Links */}
          <nav style={{
            flex: 1,
            padding: '32px 6% 24px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="mobile-nav-item"
                style={{
                  animation: `menuItemIn 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 0.07}s both`,
                }}
              >
                <span className="mobile-nav-num">{l.num}</span>
                <span className="mobile-nav-label">{l.label}</span>
                <span className="mobile-nav-arrow">→</span>
              </a>
            ))}
          </nav>

          {/* Footer del overlay */}
          <div style={{
            padding: '20px 6% 40px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
            animation: 'menuFooterIn 0.6s cubic-bezier(0.23,1,0.32,1) 0.4s both',
            position: 'relative', zIndex: 1,
          }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 3,
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                marginBottom: 4,
              }}>
                {name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
                {brand?.tagline || 'Elite Digital Studio'}
              </div>
            </div>

            {/* CTA contacto directo */}
            <a
              href="#contacto"
              onClick={() => setMenuOpen(false)}
              style={{
                background: primary,
                color: 'white',
                padding: '10px 24px',
                borderRadius: 50,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                boxShadow: `0 0 24px ${primary}40`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {t.nav.contact}
            </a>
          </div>
        </div>
      )}
    </>
  )
}