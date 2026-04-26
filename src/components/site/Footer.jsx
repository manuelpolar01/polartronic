import { useUIStrings } from '../../hooks/useUIStrings'

export default function Footer({ site }) {
  const { brand, footer } = site
  const primary = brand?.primary || '#ff3c3c'
  const name    = brand?.name    || 'POLARTRONIC'
  const logo    = brand?.logo    || ''
  const t = useUIStrings(brand)

  return (
    <footer style={{ background: '#060606', padding: '80px 6% 40px',
      borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr)', gap: 50, marginBottom: 50 }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: 16 }}>
            {logo ? (
              <img
                src={logo}
                alt={name}
                style={{ height: 48, maxWidth: 200, objectFit: 'contain' }}
              />
            ) : (
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem',
                color: primary, letterSpacing: 2,
              }}>
                {name}
              </div>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, fontSize: 14 }}>
            Creamos el estándar del futuro digital. Si buscas lo ordinario, no somos tu agencia.
          </p>
        </div>

        {/* Nav */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20,
            textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)' }}>
            {t.footer.navigation}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '#home',        label: t.nav.home       },
              { href: '#servicios',   label: t.nav.services   },
              { href: '#ecosistemas', label: t.nav.memberships },
              { href: '#proyectos',   label: t.nav.projects   },
            ].map(l => (
              <li key={l.href}>
                <a href={l.href} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                  fontSize: 14, transition: '0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = primary; e.currentTarget.style.paddingLeft = '5px' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.paddingLeft = '0' }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20,
            textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)' }}>
            {t.footer.services}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Diseño Web', 'Desarrollo', 'Branding', 'Marketing'].map(s => (
              <li key={s}>
                <a href="#servicios" style={{ color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none', fontSize: 14 }}>{s}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20,
            textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)' }}>
            {t.footer.contact}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {footer?.email && (
              <li><a href={`mailto:${footer.email}`}
                style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14 }}>
                {footer.email}</a></li>
            )}
            {footer?.whatsapp && footer.whatsapp !== '#' && (
              <li><a href={footer.whatsapp} target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14 }}>
                {t.footer.whatsapp}</a></li>
            )}
            {footer?.instagram && footer.instagram !== '#' && (
              <li><a href={footer.instagram} target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14 }}>
                {t.footer.instagram}</a></li>
            )}
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 30,
        display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.25)',
        fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
        <span>{footer?.copy || `© 2026 ${name}. Todos los derechos reservados.`}</span>
        <span>{footer?.sub  || 'Diseño Web & Branding de Alto Impacto.'}</span>
      </div>
    </footer>
  )
}