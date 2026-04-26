import { useUIStrings } from '../../hooks/useUIStrings'

export default function ServicesSection({ services, brand }) {
  if (!services?.length) return null
  const primary = brand?.primary || 'var(--primary)'
  const t = useUIStrings(brand)

  return (
    <section id="servicios" style={{ padding: '100px 6%', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          {t.services.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-main)' }}>
          {t.services.heading} <span style={{ color: primary }}>{t.services.headingAccent}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
        {services.map((svc, i) => (
          <div key={svc.id || i}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '32px 28px', transition: 'all 0.4s',
              cursor: 'default', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${primary}60`
              e.currentTarget.style.transform   = 'translateY(-8px)'
              e.currentTarget.style.background  = `${primary}08`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.transform   = 'translateY(0)'
              e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
            }}>
            <div style={{ fontSize: 36, marginBottom: 18 }}>{svc.icon}</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-main)' }}>
              {svc.title}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              {svc.desc}
            </p>
            <div style={{ color: primary, fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>
              {svc.price}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}