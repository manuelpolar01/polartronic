/**
 * PublicSite.jsx — v3 ANTI-FOUC
 * ─────────────────────────────────────────────────────────────────────────
 * Si loading=true y no hay cache → muestra spinner mínimo (fondo negro,
 * spinner del color primario del anti-FOUC script).
 * En cuanto llegan los datos reales de Firebase → render completo.
 * NUNCA se muestran los datos demo hardcoded durante la carga.
 */

import { useEffect } from 'react'
import { useSiteData }          from '../hooks/useSiteData'
import NavBar                   from '../components/site/NavBar'
import Hero                     from '../components/site/Hero'
import ServicesSection          from '../components/site/ServicesSection'
import EcosystemSection         from '../components/site/EcosystemSection'
import ProjectsSection          from '../components/site/ProjectsSection'
import TestimonialsSection      from '../components/site/TestimonialsSection'
import ContactSection           from '../components/site/ContactSection'
import Footer                   from '../components/site/Footer'

// ─── Aplica colores de marca al DOM ──────────────────────────────────
function isLightColor(hex = '') {
  const h = hex.replace('#', '')
  if (h.length < 6) return false
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

export function applyBrandColors(brand) {
  if (!brand) return
  const root = document.documentElement

  if (brand.primary) root.style.setProperty('--primary', brand.primary)

  if (brand.bg) {
    root.style.setProperty('--bg', brand.bg)
    document.body.style.backgroundColor = brand.bg

    const isLight = isLightColor(brand.bg)
    const theme   = isLight ? 'light' : 'dark'
    document.body.setAttribute('data-theme', theme)
    root.setAttribute('data-theme', theme)

    if (isLight) {
      root.style.setProperty('--text-main',  '#0a0a0a')
      root.style.setProperty('--text-dim',   'rgba(0,0,0,0.6)')
      root.style.setProperty('--text-muted', 'rgba(0,0,0,0.4)')
      root.style.setProperty('--border',     'rgba(0,0,0,0.1)')
      root.style.setProperty('--card-bg',    '#f5f5f5')
    } else {
      root.style.setProperty('--text-main',  '#ffffff')
      root.style.setProperty('--text-dim',   'rgba(255,255,255,0.55)')
      root.style.setProperty('--text-muted', 'rgba(255,255,255,0.35)')
      root.style.setProperty('--border',     'rgba(255,255,255,0.08)')
      root.style.setProperty('--card-bg',    '#0d0d0d')
    }
  }

  if (brand.language) window.__SITE_LANGUAGE__ = brand.language
}

// ─── Spinner minimalista ─────────────────────────────────────────────
// Usa los CSS vars ya aplicados por el anti-FOUC script del index.html
// El fondo ya es correcto gracias al anti-FOUC → sin flash
function SiteLoader() {
  const primary = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary').trim() || '#ff3c3c'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 20,
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: '50%',
        border: `3px solid rgba(255,255,255,0.08)`,
        borderTopColor: primary,
        animation: 'siteSpin 0.75s linear infinite',
      }} />
      <style>{`@keyframes siteSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────
export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services, loading, hasData } = useSiteData()

  // Aplicar colores de marca en cuanto llegan (o desde cache)
  useEffect(() => {
    if (site?.brand) applyBrandColors(site.brand)
  }, [site?.brand])

  // Mostrar spinner solo si estamos cargando Y no tenemos datos todavía
  if (loading && !hasData) {
    return <SiteLoader />
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-main)' }}>
      <NavBar brand={site.brand} />
      <Hero   hero={site.hero}   brand={site.brand} />
      <ServicesSection
        services={services}
        brand={site.brand}
      />
      <EcosystemSection
        ecosystems={ecosystems}
        brand={site.brand}
        projects={projects}
      />
      <ProjectsSection
        projects={projects}
        brand={site.brand}
        site={site}
      />
      <TestimonialsSection
        testimonials={testimonials}
        brand={site.brand}
      />
      <ContactSection
        contact={site.contact}
        footer={site.footer}
        brand={site.brand}
        site={site}
      />
      <Footer site={site} />
    </div>
  )
}