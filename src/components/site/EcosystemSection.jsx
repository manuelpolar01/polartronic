import { useState } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'

function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function EcosystemModal({ eco, primary, onClose, t }) {
  const features = parseFeatures(eco.features)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d0d', border: `1px solid ${primary}30`,
          borderRadius: 20, maxWidth: 560, width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '2rem', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'white', width: 32, height: 32, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {eco.image && (
          <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <img src={eco.image} alt={eco.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ color: primary, fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
          {eco.category}
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'white' }}>{eco.title}</h3>

        {eco.price && (
          <div style={{ color: primary, fontWeight: 800, fontSize: '1.4rem', marginBottom: 12 }}>
            {eco.price}
            {eco.period && (
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
                {' '}{eco.period}
              </span>
            )}
          </div>
        )}

        {eco.desc && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            {eco.desc}
          </p>
        )}

        {eco.detailHtml ? (
          <div dangerouslySetInnerHTML={{ __html: eco.detailHtml }} />
        ) : (
          <>
            {features.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
                  {t.ecosystems.benefits}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                      <span style={{ color: primary, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {eco.extraText && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}>
                {eco.extraText}
              </p>
            )}
          </>
        )}

        {eco.ctaLabel && eco.ctaLink && (
          <a
            href={eco.ctaLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', textAlign: 'center',
              background: primary, color: 'white',
              padding: '14px 32px', borderRadius: 10,
              fontWeight: 800, fontSize: '0.9rem',
              letterSpacing: 1.5, textTransform: 'uppercase',
              textDecoration: 'none', marginTop: 24,
            }}
          >
            {eco.ctaLabel}
          </a>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 16, width: '100%',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', padding: '10px',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}
        >
          {t.ecosystems.close}
        </button>
      </div>
    </div>
  )
}

export default function EcosystemSection({ ecosystems, brand }) {
  const [selected, setSelected] = useState(null)
  const t = useUIStrings(brand)

  if (!ecosystems?.length) return null

  const selectedEco = selected !== null ? ecosystems[selected] : null
  const primary = brand?.primary || '#ff3c3c'

  return (
    <section id="ecosistemas" style={{ padding: '100px 6%' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{
          color: primary, fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
        }}>
          {t.ecosystems.eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.ecosystems.eyebrow.split(' ').slice(0, -1).join(' ')}{' '}
          <span style={{ color: primary }}>{t.ecosystems.heading}</span>
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {ecosystems.map((eco, idx) => {
          const features = parseFeatures(eco.features).slice(0, 3)
          return (
            <div
              key={eco.id || idx}
              onClick={() => setSelected(idx)}
              style={{
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                border: eco.featured
                  ? `1px solid ${primary}50`
                  : '1px solid rgba(255,255,255,0.08)',
                background: eco.featured
                  ? `${primary}08`
                  : 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s', position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = `${primary}60`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = eco.featured
                  ? `${primary}50`
                  : 'rgba(255,255,255,0.08)'
              }}
            >
              {eco.featured && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 1,
                  background: primary, color: 'white',
                  fontSize: 9, fontWeight: 800, letterSpacing: 1,
                  textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20,
                }}>
                  {t.ecosystems.featured}
                </div>
              )}

              {eco.image && (
                <div style={{ height: 140, overflow: 'hidden' }}>
                  <img
                    src={eco.image}
                    alt={eco.title}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: 'brightness(0.55)', transition: 'transform 0.4s',
                    }}
                  />
                </div>
              )}

              <div style={{ padding: '18px 20px' }}>
                <div style={{
                  color: primary, fontSize: 10, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4,
                }}>
                  {eco.category}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
                  {eco.title}
                </h3>

                {eco.price && (
                  <div style={{ color: primary, fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>
                    {eco.price}
                    {eco.period && (
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
                        {' '}{eco.period}
                      </span>
                    )}
                  </div>
                )}

                {eco.desc && (
                  <p style={{
                    color: 'var(--text-dim)', fontSize: 13,
                    lineHeight: 1.6, margin: '0 0 12px',
                  }}>
                    {eco.desc}
                  </p>
                )}

                {features.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                        <span style={{ color: primary, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{
                  marginTop: 14, fontSize: 11,
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {t.ecosystems.close === 'Close' ? 'See details' :
                   t.ecosystems.close === 'Chiudi' ? 'Vedi dettaglio' :
                   t.ecosystems.close === 'Cerrar' ? 'Ver detalle' :
                   t.ecosystems.close === 'Fermer' ? 'Voir détail' :
                   t.ecosystems.close === 'Schließen' ? 'Details' :
                   'Ver detalhe'} →
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedEco && (
        <EcosystemModal
          eco={selectedEco}
          primary={primary}
          onClose={() => setSelected(null)}
          t={t}
        />
      )}
    </section>
  )
}