import { useState } from 'react'

export default function EcosystemSection({ ecosystems }) {
  const [active, setActive] = useState(null)

  if (!ecosystems?.length) return null

  const open  = (eco) => { setActive(eco); document.body.style.overflow = 'hidden' }
  const close = ()    => { setActive(null); document.body.style.overflow = '' }

  return (
    <>
      <section id="ecosistemas" style={{ padding: '100px 6%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{
            color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
          }}>
            Elige tu plan
          </p>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800 }}>
            Membresías &amp; <span style={{ color: 'var(--primary)' }}>Grupos</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 12, fontSize: 15 }}>
            Selecciona el nivel que mejor se adapta a tu negocio. Haz clic para ver todos los detalles.
          </p>
        </div>

        {/* Grid de membresías */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {ecosystems.map((eco, i) => (
            <MembershipCard key={eco.id || i} eco={eco} onOpen={open} />
          ))}
        </div>
      </section>

      {/* Modal de detalle */}
      {active && (
        <MembershipModal eco={active} onClose={close} />
      )}
    </>
  )
}

/* ─── Tarjeta de membresía ─────────────────────────────────────────── */
function MembershipCard({ eco, onOpen }) {
  const [hovered, setHovered] = useState(false)

  // Intentar parsear features si viene como string JSON o array
  let features = []
  try {
    features = Array.isArray(eco.features)
      ? eco.features
      : JSON.parse(eco.features || '[]')
  } catch { features = [] }

  const isFeatured = eco.featured === true || eco.featured === 'true'

  return (
    <div
      onClick={() => onOpen(eco)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        border: hovered || isFeatured
          ? '1px solid var(--primary)'
          : '1px solid rgba(255,255,255,0.08)',
        background: isFeatured
          ? 'linear-gradient(135deg, rgba(255,60,60,0.08) 0%, rgba(0,0,0,0.6) 100%)'
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      {/* Badge "Destacado" */}
      {isFeatured && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'var(--primary)', color: 'white',
          fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
          textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20,
        }}>
          Destacado
        </div>
      )}

      {/* Imagen si existe */}
      {eco.image && (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img
            src={eco.image} alt={eco.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: 'brightness(0.55)',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
        </div>
      )}

      <div style={{ padding: '28px 26px' }}>
        {/* Categoría / badge plan */}
        <span style={{
          color: 'var(--primary)', fontWeight: 800, fontSize: '0.72rem',
          textTransform: 'uppercase', letterSpacing: 2,
        }}>
          {eco.category || 'Membresía'}
        </span>

        {/* Nombre del plan */}
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 6px' }}>
          {eco.title}
        </h3>

        {/* Precio si existe */}
        {eco.price && (
          <div style={{
            fontSize: '1.8rem', fontWeight: 800,
            color: 'var(--primary)', marginBottom: 12, lineHeight: 1,
          }}>
            {eco.price}
            {eco.period && (
              <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                {eco.period}
              </span>
            )}
          </div>
        )}

        {/* Descripción breve */}
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
          {eco.desc}
        </p>

        {/* Lista de features (máx 3 preview) */}
        {features.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {features.slice(0, 3).map((f, i) => (
              <li key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
            {features.length > 3 && (
              <li style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                +{features.length - 3} beneficios más…
              </li>
            )}
          </ul>
        )}

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--primary)', fontWeight: 700, fontSize: 13,
          letterSpacing: 0.5,
        }}>
          Ver detalles completos
          <span style={{
            fontSize: 18, transition: 'transform 0.3s',
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
          }}>→</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal de detalle ─────────────────────────────────────────────── */
function MembershipModal({ eco, onClose }) {
  let features = []
  try {
    features = Array.isArray(eco.features)
      ? eco.features
      : JSON.parse(eco.features || '[]')
  } catch { features = [] }

  // Si tiene HTML personalizado, lo renderizamos; si no, generamos la vista por defecto
  const hasCustomHtml = eco.detailHtml && eco.detailHtml.trim().length > 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        .modal-feat-item { transition: background 0.2s; }
        .modal-feat-item:hover { background: rgba(255,60,60,0.06) !important; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 680,
          maxHeight: '90vh', overflowY: 'auto',
          background: '#0d0d0d',
          border: '1px solid rgba(255,60,60,0.3)',
          borderRadius: 24,
          animation: 'slideUp 0.3s cubic-bezier(0.23,1,0.32,1)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary) #111',
        }}
      >
        {hasCustomHtml ? (
          /* ── Modo HTML personalizado ── */
          <div>
            {/* Header con botón cerrar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              position: 'sticky', top: 0, background: '#0d0d0d', zIndex: 10,
            }}>
              <div>
                <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                  {eco.category}
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800 }}>{eco.title}</h2>
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', width: 38, height: 38, borderRadius: '50%',
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            {/* HTML personalizado inyectado */}
            <div
              style={{ padding: '28px' }}
              dangerouslySetInnerHTML={{ __html: eco.detailHtml }}
            />
          </div>
        ) : (
          /* ── Modo automático por campos ── */
          <>
            {/* Hero imagen */}
            {eco.image && (
              <div style={{ height: 220, overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
                <img src={eco.image} alt={eco.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
              </div>
            )}

            {/* Header */}
            <div style={{
              padding: '24px 28px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
            }}>
              <div>
                <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                  {eco.category || 'Membresía'}
                </span>
                <h2 style={{ margin: '6px 0', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, lineHeight: 1.1 }}>
                  {eco.title}
                </h2>
                {eco.price && (
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
                    {eco.price}
                    {eco.period && (
                      <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>
                        {eco.period}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', width: 40, height: 40, borderRadius: '50%',
                cursor: 'pointer', fontSize: 20, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* Descripción */}
            <div style={{ padding: '16px 28px 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8 }}>
                {eco.desc}
              </p>
            </div>

            {/* Lista de beneficios */}
            {features.length > 0 && (
              <div style={{ padding: '24px 28px 0' }}>
                <h4 style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 14,
                }}>
                  ¿Qué incluye?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {features.map((f, i) => (
                    <div key={i} className="modal-feat-item" style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'var(--primary)', fontWeight: 800, flexShrink: 0,
                      }}>✓</span>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Texto extra / HTML interno si no tiene detailHtml completo */}
            {eco.extraText && (
              <div style={{ padding: '20px 28px 0' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>
                  {eco.extraText}
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{ padding: '28px 28px 32px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {eco.ctaLink && (
                <a href={eco.ctaLink} target="_blank" rel="noreferrer" style={{
                  flex: 1, minWidth: 160,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '14px 28px', background: 'var(--primary)', color: 'white',
                  textDecoration: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  boxShadow: '0 0 30px rgba(255,60,60,0.3)',
                }}>
                  {eco.ctaLabel || 'UNIRSE AHORA'}
                </a>
              )}
              <button onClick={onClose} style={{
                flex: 1, minWidth: 120,
                padding: '14px 28px', background: 'transparent', color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
