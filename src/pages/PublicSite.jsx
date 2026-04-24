import { useState, useEffect } from 'react'
import { useSiteData } from '../hooks/useSiteData'
import NavBar       from '../components/site/NavBar'
import Hero         from '../components/site/Hero'
import ServicesSection from '../components/site/ServicesSection'
import EcosystemSection from '../components/site/EcosystemSection'
import ProjectsSection  from '../components/site/ProjectsSection'
import TestimonialsSection from '../components/site/TestimonialsSection'
import ContactSection   from '../components/site/ContactSection'
import Footer       from '../components/site/Footer'

export default function PublicSite() {
  const { site, ecosystems, projects, testimonials, services, loading } = useSiteData()

  // Aplicar colores del brand dinámicamente
  useEffect(() => {
    if (site.brand?.primary) {
      document.documentElement.style.setProperty('--primary', site.brand.primary)
    }
    if (site.brand?.bg) {
      document.documentElement.style.setProperty('--bg', site.brand.bg)
      document.body.style.backgroundColor = site.brand.bg
    }
  }, [site.brand])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#030303' }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(255,60,60,0.3)',
        borderTopColor:'#ff3c3c', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)' }}>
      <NavBar  brand={site.brand} />
      <Hero    hero={site.hero}   brand={site.brand} />
      <ServicesSection services={services} />
      <EcosystemSection ecosystems={ecosystems} />
      <ProjectsSection  projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection  footer={site.footer} brand={site.brand} />
      <Footer  site={site} />
    </div>
  )
}
