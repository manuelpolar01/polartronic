import { useState } from 'react'

export default function ProjectsSection({ projects }) {
  if (!projects?.length) return null

  return (
    <section id="proyectos" style={{ padding: '100px 6%', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{
          color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12,
        }}>
          Casos de Éxito
        </p>
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800 }}>
          Nuestro <span style={{ color: 'var(--primary)' }}>Portafolio</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
          Resultados reales para clientes reales. Cada proyecto es una historia de transformación digital.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 24,
      }}>
        {projects.map((proj, i) => (
          <ProjectCard key={proj.id || i} proj={proj} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ proj }) {
  const [hovered, setHovered] = useState(false)

  // Compatibilidad hacia atrás: si el proyecto solo tiene `title` sin `client`
  const client      = proj.client      || proj.title    || ''
  const industry    = proj.industry    || proj.category || ''
  const title       = proj.title       || ''
  const description = proj.description || proj.desc     || ''
  const results     = proj.results     || ''
  const url         = proj.url         || proj.link     || '#'

  // Parsear resultados (puede venir como "texto · texto" o texto libre)
  const resultItems = results
    ? results.split('·').map(r => r.trim()).filter(Boolean)
    : []

  return (
    <a
      href={url}
      target={url !== '#' ? '_blank' : undefined}
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        border: hovered ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.07)',
        textDecoration: 'none',
        background: hovered ? 'rgba(255,60,60,0.03)' : 'rgba(255,255,255,0.02)',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
        cursor: url !== '#' ? 'pointer' : 'default',
      }}
    >
      {/* Imagen */}
      {proj.image && (
        <div style={{ height: 200, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img
            src={proj.image}
            alt={client}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              display: 'block',
              filter: hovered ? 'brightness(0.65)' : 'brightness(0.5)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
          {/* Industry badge */}
          {industry && (
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1.5,
              padding: '4px 10px', borderRadius: 20,
            }}>
              {industry}
            </div>
          )}
          {/* External link indicator */}
          {url !== '#' && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)', fontSize: 14,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s',
            }}>
              ↗
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Client + title */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            color: 'var(--primary)', fontWeight: 800, fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
          }}>
            {client}
          </div>
          {title && title !== client && (
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3, color: 'rgba(255,255,255,0.9)' }}>
              {title}
            </h3>
          )}
        </div>

        {/* Description */}
        {description && (
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7,
            margin: '0 0 16px', flex: 1,
          }}>
            {description}
          </p>
        )}

        {/* Results */}
        {resultItems.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 14, marginTop: 'auto',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: 2, color: 'rgba(255,255,255,0.25)', marginBottom: 4,
            }}>
              Resultados
            </div>
            {resultItems.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'rgba(255,255,255,0.7)',
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: 'var(--primary)', flexShrink: 0,
                }}>▲</span>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}