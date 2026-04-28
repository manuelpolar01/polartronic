/**
 * PublicSite.jsx — v2
 * CAMBIO: EcosystemSection ahora recibe `projects` para mostrar
 * casos de éxito del sector dentro del drawer lateral.
 */

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

function isLightColor(hex) {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

export function applyBrandColors(brand) {
  if (!brand) return
  const root = document.documentElement

  if (brand.primary) {
    root.style.setProperty('--primary', brand.primary)
  }

  if (brand.bg) {
    root.style.setProperty('--bg', brand.bg)
    document.body.style.backgroundColor = brand.bg

    const isLight = isLightColor(brand.bg)
    document.body.setAttribute('data-theme', isLight ? 'light' : 'dark')
    root.setAttribute('data-theme', isLight ? 'light' : 'dark')

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

  if (brand.language) {
    window.__SITE_LANGUAGE__ = brand.language
  }
}

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services } = useSiteData()

  useEffect(() => {
    applyBrandColors(site.brand)
  }, [site.brand])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-main)' }}>
      <NavBar              brand={site.brand} />
      <Hero                hero={site.hero}   brand={site.brand} />
      <ServicesSection     services={services} brand={site.brand} />

      {/* EcosystemSection recibe projects para mostrar casos de éxito en el drawer */}
      <EcosystemSection    ecosystems={ecosystems} brand={site.brand} projects={projects} />

      <ProjectsSection     projects={projects} brand={site.brand} site={site} />
      <TestimonialsSection testimonials={testimonials} brand={site.brand} />
      <ContactSection      contact={site.contact} footer={site.footer} brand={site.brand} site={site} />
      <Footer              site={site} />
    </div>
  )
}