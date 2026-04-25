/**
 * PublicSite.jsx — updated
 *
 * Sets window.__SITE_LANGUAGE__ as soon as brand.language is known,
 * so all useUIStrings() calls across the tree pick it up without
 * requiring explicit prop drilling through every component.
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

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services } = useSiteData()

  // Apply brand colours + language globally
  useEffect(() => {
    if (site.brand?.primary) {
      document.documentElement.style.setProperty('--primary', site.brand.primary)
    }
    if (site.brand?.bg) {
      document.documentElement.style.setProperty('--bg', site.brand.bg)
      document.body.style.backgroundColor = site.brand.bg
    }
    // ── NEW: propagate language to window so useUIStrings picks it up
    if (site.brand?.language) {
      window.__SITE_LANGUAGE__ = site.brand.language
    }
  }, [site.brand])

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* brand is passed to every component so useUIStrings can read brand.language */}
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