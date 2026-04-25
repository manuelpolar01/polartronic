import { useEffect } from 'react'
import { useSiteData } from '../hooks/useSiteData'
import NavBar              from '../components/site/NavBar'
import Hero                from '../components/site/Hero'
import ServicesSection     from '../components/site/ServicesSection'
import EcosystemSection    from '../components/site/EcosystemSection'
import ProjectsSection     from '../components/site/ProjectsSection'
import TestimonialsSection from '../components/site/TestimonialsSection'
import ContactSection      from '../components/site/ContactSection'
import Footer              from '../components/site/Footer'

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services } = useSiteData()

  // Aplicar colores del brand dinámicamente (se re-aplica cuando Firebase hidrata)
  useEffect(() => {
    if (site.brand?.primary) {
      document.documentElement.style.setProperty('--primary', site.brand.primary)
    }
    if (site.brand?.bg) {
      document.documentElement.style.setProperty('--bg', site.brand.bg)
      document.body.style.backgroundColor = site.brand.bg
    }
  }, [site.brand])

  // Render inmediato — sin loading gate.
  // Los datos vienen de localStorage (si hay caché) o de los defaults.
  // Firebase hidrata en background y React re-renderiza suavemente.
  return (
    <div style={{ background: 'var(--bg)' }}>
      <NavBar              brand={site.brand} />
      <Hero                hero={site.hero}   brand={site.brand} />
      <ServicesSection     services={services} />
      <EcosystemSection    ecosystems={ecosystems} />
      <ProjectsSection     projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection      contact={site.contact} footer={site.footer} brand={site.brand} />
      <Footer              site={site} />
    </div>
  )
}