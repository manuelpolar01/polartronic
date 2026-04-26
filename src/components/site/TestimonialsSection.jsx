import { useUIStrings } from '../../hooks/useUIStrings'

export default function TestimonialsSection({ testimonials, brand }) {
  if (!testimonials?.length) return null
  const primary = brand?.primary || 'var(--primary)'
  const t = useUIStrings(brand)

  return (
    <section id="testimonios" style={{ padding: '100px 6%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          {t.testimonials.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.testimonials.heading} <span style={{ color: primary }}>{t.testimonials.headingAccent}</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
        {testimonials.map((item, i) => (
          <div key={item.id || i} style={{ background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px',
            transition: 'all 0.3s' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${primary}50`
              e.currentTarget.style.background  = `${primary}06`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
            }}>
            <div style={{ color: primary, fontSize: 32, marginBottom: 16, lineHeight: 1 }}>"</div>
            <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.8,
              fontStyle: 'italic', marginBottom: 20 }}>{item.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%',
                background: `${primary}20`, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0 }}>
                {item.avatar
                  ? <img src={item.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '👤'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{item.name}</div>
                <div style={{ color: primary, fontSize: 12 }}>{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}