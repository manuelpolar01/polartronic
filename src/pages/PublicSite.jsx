/**
 * PublicSite.jsx — con AboutSection integrada
 */

import { useEffect }            from 'react'
import { useSiteData }          from '../hooks/useSiteData'
import NavBar                   from '../components/site/NavBar'
import Hero                     from '../components/site/Hero'
import AboutSection             from '../components/site/AboutSection'
import ServicesSection          from '../components/site/ServicesSection'
import EcosystemSection         from '../components/site/EcosystemSection'
import ProjectsSection          from '../components/site/ProjectsSection'
import TestimonialsSection      from '../components/site/TestimonialsSection'
import ContactSection           from '../components/site/ContactSection'
import Footer                   from '../components/site/Footer'

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

  // Prioridad: 1) admin configuró idioma  2) navegador del visitante  3) italiano por defecto
  const SUPPORTED = ['it', 'en', 'es', 'fr', 'de', 'pt']
  if (brand.language) {
    window.__SITE_LANGUAGE__ = brand.language
  } else {
    const browserLang = (navigator.language || 'it').slice(0, 2).toLowerCase()
    window.__SITE_LANGUAGE__ = SUPPORTED.includes(browserLang) ? browserLang : 'it'
  }
}

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

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services, loading, hasData } = useSiteData()

  useEffect(() => {
    if (site?.brand) applyBrandColors(site.brand)
  }, [site?.brand])

  if (loading && !hasData) {
    return <SiteLoader />
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-main)' }}>
      <NavBar brand={site.brand} />

      {/* 1 — Portada */}
      <Hero hero={site.hero} brand={site.brand} />

      {/* 2 — Quiénes somos */}
      <AboutSection brand={site.brand} about={site.about} />

      {/* 3 — Servicios */}
      <ServicesSection services={services} brand={site.brand} />

      {/* 4 — Ecosistemas / Membresías */}
      <EcosystemSection
        ecosystems={ecosystems}
        brand={site.brand}
        projects={projects}
      />

      {/* 5 — Proyectos */}
      <ProjectsSection
        projects={projects}
        brand={site.brand}
        site={site}
      />

      {/* 6 — Testimonios */}
      <TestimonialsSection
        testimonials={testimonials}
        brand={site.brand}
      />

      {/* 7 — Contacto */}
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