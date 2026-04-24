import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href:'#home',         label:'Home'      },
  { href:'#servicios',    label:'Servicios' },
  { href:'#ecosistemas',  label:'Áreas'     },
  { href:'#proyectos',    label:'Proyectos' },
  { href:'#testimonios',  label:'Clientes'  },
  { href:'#contacto',     label:'Contacto'  },
]

export default function NavBar({ brand }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const name    = brand?.name || 'POLARTRONIC'
  const primary = brand?.primary || '#ff3c3c'

  return (
    <header style={{
      position:'fixed', top:0, width:'100%', zIndex:1000,
      height: scrolled ? 70 : 85,
      padding:'0 6%',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background: scrolled ? 'rgba(3,3,3,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition:'all 0.5s cubic-bezier(0.23,1,0.32,1)',
    }}>
      <a href="#home" style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2.2rem',
        color: primary, textDecoration:'none', letterSpacing:2 }}>
        {name}
      </a>

      {/* Desktop nav */}
      <nav style={{ display:'flex', gap:30, listStyle:'none' }} className="desktop-nav">
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} style={{ color:'rgba(255,255,255,0.6)',
            textDecoration:'none', fontSize:'0.85rem', fontWeight:600,
            textTransform:'uppercase', letterSpacing:1, transition:'0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color=primary; e.currentTarget.style.opacity='1' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.6)' }}>
            {l.label}
          </a>
        ))}
        <a href="/admin" style={{ padding:'8px 20px', background:primary,
          color:'white', textDecoration:'none', borderRadius:5,
          fontSize:'0.8rem', fontWeight:700, letterSpacing:1 }}>
          ADMIN
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button onClick={() => setMenuOpen(p=>!p)}
        style={{ display:'none', background:'none', border:'none', color:'white',
          fontSize:24, cursor:'pointer' }} className="mobile-menu-btn">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position:'fixed', top:70, left:0, right:0, bottom:0,
          background:'rgba(3,3,3,0.98)', backdropFilter:'blur(20px)',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:32, zIndex:999 }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ color:'white', textDecoration:'none', fontSize:'1.5rem',
                fontWeight:800, textTransform:'uppercase', letterSpacing:2 }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
