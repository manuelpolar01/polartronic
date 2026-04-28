import { useUIStrings } from '../../hooks/useUIStrings'

export default function ServicesSection({ services, brand }) {
  if (!services?.length) return null
  const primary = brand?.primary || 'var(--primary)'
  const t = useUIStrings(brand)

  return (
    <section id="servicios" style={{ padding: '100px 6%', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{
          color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
        }}>
          {t.services.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-main)' }}>
          {t.services.heading} <span style={{ color: primary }}>{t.services.headingAccent}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
        {services.map((svc, i) => (
          <ServiceCard key={svc.id || i} svc={svc} primary={primary} />
        ))}
      </div>
    </section>
  )
}

function ServiceCard({ svc, primary }) {
  const hasImage = !!(svc.image && svc.image.trim())

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${primary}60`
        e.currentTarget.style.transform   = 'translateY(-8px)'
        e.currentTarget.style.background  = `${primary}08`
        e.currentTarget.style.boxShadow   = `0 20px 40px rgba(0,0,0,0.4)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {/* Imagen de copertina */}
      {hasImage && (
        <div style={{ height: 160, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img
            src={svc.image}
            alt={svc.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: 'brightness(0.65)',
              transition: 'transform 0.5s ease, filter 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06)'
              e.currentTarget.style.filter    = 'brightness(0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.filter    = 'brightness(0.65)'
            }}
          />
          {/* Emoji badge sobre la imagen */}
          {svc.icon && (
            <div style={{
              position: 'absolute', bottom: 12, left: 16,
              fontSize: 26,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              width: 48, height: 48, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${primary}40`,
            }}>
              {svc.icon}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '24px 24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Emoji solo si no hay imagen */}
        {!hasImage && svc.icon && (
          <div style={{ fontSize: 36, marginBottom: 18 }}>{svc.icon}</div>
        )}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-main)' }}>
          {svc.title}
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
          {svc.desc}
        </p>
        {svc.price && (
          <div style={{
            color: primary, fontWeight: 700, fontSize: 13,
            letterSpacing: 0.5,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {svc.price}
          </div>
        )}
      </div>
    </div>
  )
}