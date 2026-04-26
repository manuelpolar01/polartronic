import { useEffect } from 'react'
import { useSiteData }         from '../hooks/useSiteData'
import NavBar                  from '../components/site/NavBar'
import Hero                    from '../components/site/Hero'
import ServicesSection         from '../components/site/ServicesSection'
import EcosystemSection        from '../components/site/EcosystemSection'
import ProjectsSection         from '../components/site/ProjectsSection'
import TestimonialsSection     from '../components/site/TestimonialsSection'
import ContactSection          from '../components/site/ContactSection'
import Footer                  from '../components/site/Footer'

// Detecta si un color hex es claro u oscuro
function isLightColor(hex) {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  // Luminancia relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services } = useSiteData()

  useEffect(() => {
    if (site.brand?.primary) {
      document.documentElement.style.setProperty('--primary', site.brand.primary)
    }

    if (site.brand?.bg) {
      const bg = site.brand.bg
      document.documentElement.style.setProperty('--bg', bg)
      document.body.style.backgroundColor = bg

      // ── FIX LETRAS BLANCAS: detecta si el fondo es claro u oscuro
      // y aplica el tema correcto para que el texto siempre sea legible
      const isLight = isLightColor(bg)
      document.body.setAttribute('data-theme', isLight ? 'light' : 'dark')

      if (isLight) {
        document.documentElement.style.setProperty('--text-main',  '#0a0a0a')
        document.documentElement.style.setProperty('--text-dim',   'rgba(0,0,0,0.6)')
        document.documentElement.style.setProperty('--text-muted', 'rgba(0,0,0,0.4)')
        document.documentElement.style.setProperty('--border',     'rgba(0,0,0,0.1)')
        document.documentElement.style.setProperty('--card-bg',    '#f5f5f5')
      } else {
        document.documentElement.style.setProperty('--text-main',  '#ffffff')
        document.documentElement.style.setProperty('--text-dim',   'rgba(255,255,255,0.55)')
        document.documentElement.style.setProperty('--text-muted', 'rgba(255,255,255,0.35)')
        document.documentElement.style.setProperty('--border',     'rgba(255,255,255,0.08)')
        document.documentElement.style.setProperty('--card-bg',    '#0d0d0d')
      }
    }

    if (site.brand?.language) {
      window.__SITE_LANGUAGE__ = site.brand.language
    }
  }, [site.brand])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-main)' }}>
      <NavBar              brand={site.brand} />
      <Hero                hero={site.hero}   brand={site.brand} />
      <ServicesSection     services={services} brand={site.brand} />
      <EcosystemSection    ecosystems={ecosystems} brand={site.brand} />
      <ProjectsSection     projects={projects} brand={site.brand} />
      <TestimonialsSection testimonials={testimonials} brand={site.brand} />
      <ContactSection      contact={site.contact} footer={site.footer} brand={site.brand} site={site} />
      <Footer              site={site} />
    </div>
  )
}