import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href: '#home',         label: 'Home'       },
  { href: '#servicios',    label: 'Servicios'  },
  { href: '#ecosistemas',  label: 'Membresías' },
  { href: '#proyectos',    label: 'Proyectos'  },
  { href: '#testimonios',  label: 'Clientes'   },
  { href: '#contacto',     label: 'Contacto'   },
]

export default function NavBar({ brand }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const name    = brand?.name    || 'POLARTRONIC'
  const primary = brand?.primary || '#ff3c3c'
  const logo    = brand?.logo    || ''

  return (
    <>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
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
      `}</style>

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
        {/* Logo: imagen si existe, sino texto */}
        <a href="#home" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {logo ? (
            <img
              src={logo}
              alt={name}
              style={{
                height: scrolled ? 32 : 40,
                maxWidth: 180,
                objectFit: 'contain',
                transition: 'height 0.4s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          ) : (
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '2rem',
              color: primary,
              letterSpacing: 2,
            }}>
              {name}
            </span>
          )}
        </a>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ gap: 28, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          className="mobile-menu-btn"
          aria-label="Menu"
          style={{
            background: menuOpen ? `rgba(255,60,60,0.1)` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${menuOpen ? `rgba(255,60,60,0.4)` : 'rgba(255,255,255,0.12)'}`,
            color: menuOpen ? primary : 'rgba(255,255,255,0.8)',
            width: 40, height: 40, borderRadius: 8, cursor: 'pointer',
            fontSize: 18, alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(3,3,3,0.97)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, animation: 'menuFadeIn 0.25s ease',
          }}
        >
          <style>{`
            @keyframes menuFadeIn {
              from { opacity: 0; transform: scale(0.98); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Logo en menú móvil */}
          <a href="#home" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', marginBottom: 8 }}>
            {logo ? (
              <img src={logo} alt={name} style={{ height: 40, maxWidth: 160, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', color: primary, letterSpacing: 2 }}>
                {name}
              </span>
            )}
          </a>

          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                fontSize: 'clamp(1.6rem, 8vw, 2.2rem)', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: 3,
                padding: '10px 24px', borderRadius: 8, transition: 'all 0.2s',
                animationDelay: `${i * 0.04}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = primary
                e.currentTarget.style.background = `rgba(255,60,60,0.08)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}