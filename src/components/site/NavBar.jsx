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
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [activeLink,  setActiveLink]  = useState('#home')
  const t       = useUIStrings(brand)
  const primary = brand?.primary || '#ff3c3c'

  const NAV_LINKS = [
    { href: '#home',        label: t.nav.home        },
    { href: '#about',       label: t.nav.about       },
    { href: '#servicios',   label: t.nav.services    },
    { href: '#ecosistemas', label: t.nav.memberships },
    { href: '#proyectos',   label: t.nav.projects    },
    { href: '#testimonios', label: t.nav.clients     },
    { href: '#contacto',    label: t.nav.contact     },
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

  const handleLinkClick = (href) => {
    setActiveLink(href)
    setMenuOpen(false)
  }

  return (
    <>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav     { display: none !important; }
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

        @keyframes glassMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glassItemIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .glass-menu-item {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.5px;
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
          border-left: 2px solid transparent;
          transition: all 0.2s cubic-bezier(0.23,1,0.32,1);
          color: rgba(255,255,255,0.45);
          position: relative;
        }
        .glass-menu-item.active {
          color: white;
          border-left-color: ${primary};
          background: rgba(255,60,60,0.05);
          padding-left: 22px;
        }
        .glass-menu-item:hover:not(.active) {
          color: rgba(255,255,255,0.8);
          border-left-color: rgba(255,60,60,0.3);
          padding-left: 22px;
          background: rgba(255,255,255,0.02);
        }
      `}</style>

      {/* ── HEADER FIJO ── */}
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
        {/* Logo */}
        <a href="#home" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <BrandLogo brand={brand} scrolled={scrolled} />
        </a>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ gap: 28, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        {/* Botón hamburguesa — ÚNICO botón de apertura/cierre en mobile */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          className="mobile-menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          style={{
            background: menuOpen ? `rgba(255,60,60,0.12)` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${menuOpen ? `rgba(255,60,60,0.4)` : 'rgba(255,255,255,0.12)'}`,
            width: 44, height: 44,
            borderRadius: 10,
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            flexShrink: 0,
            padding: 0,
            // Siempre visible encima del panel
            position: 'relative',
            zIndex: 1201,
          }}
        >
          <HamburgerIcon open={menuOpen} primary={primary} />
        </button>
      </header>

      {/* ── MOBILE MENU PANEL ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1098,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel glass — SIN botón ✕ propio, el header lo gestiona */}
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 1099,
            background: 'rgba(8,8,12,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
            animation: 'glassMenuIn 0.3s cubic-bezier(0.23,1,0.32,1) both',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>

            {/* Línea de acento top */}
            <div style={{
              height: 2,
              background: `linear-gradient(90deg, ${primary}, ${primary}40, transparent)`,
            }} />

            {/* Spacer que ocupa el alto del header fijo para que los links no queden debajo */}
            <div style={{ height: scrolled ? 64 : 80 }} />

            {/* Links */}
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_LINKS.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => handleLinkClick(l.href)}
                  className={`glass-menu-item${activeLink === l.href ? ' active' : ''}`}
                  style={{
                    animation: `glassItemIn 0.35s cubic-bezier(0.23,1,0.32,1) ${i * 0.05}s both`,
                  }}
                >
                  {l.label}
                  {activeLink === l.href && (
                    <span style={{
                      marginLeft: 'auto',
                      width: 6, height: 6, borderRadius: '50%',
                      background: primary,
                      flexShrink: 0,
                    }} />
                  )}
                </a>
              ))}
            </nav>

            {/* Footer CTA — solo el botón de contacto, sin ✕ redundante */}
            <div style={{
              padding: '14px 20px 20px',
              borderTop: '0.5px solid rgba(255,255,255,0.06)',
            }}>
              <a
                href="#contacto"
                onClick={() => handleLinkClick('#contacto')}
                style={{
                  display: 'block',
                  padding: '14px',
                  background: primary, color: 'white',
                  borderRadius: 10, fontWeight: 800,
                  fontSize: 13, letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  textDecoration: 'none', textAlign: 'center',
                  boxShadow: `0 4px 20px ${primary}35`,
                }}
              >
                {t.nav.contact} →
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}