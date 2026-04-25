import { useState, useEffect } from 'react'
import { useAuth }     from '../lib/useAuth'
import { useSiteData } from '../hooks/useSiteData'
import AdminSidebar    from '../components/admin/AdminSidebar'
import AdminHeader     from '../components/admin/AdminHeader'
import SiteConfigTab   from '../components/admin/tabs/SiteConfigTab'
import HeroTab         from '../components/admin/tabs/HeroTab'
import ServicesTab     from '../components/admin/tabs/ServicesTab'
import EcosystemsTab   from '../components/admin/tabs/EcosystemsTab'
import ProjectsTab     from '../components/admin/tabs/ProjectsTab'
import TestimonialsTab from '../components/admin/tabs/TestimonialsTab'
import ContactTab      from '../components/admin/tabs/ContactTab'

export default function AdminPanel() {
  const [activeTab,   setActiveTab]   = useState('site')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const data = useSiteData()

  // FIX BUG 2: aplicar colores del brand cuando cargan desde Firebase/caché
  // Antes solo se aplicaba al guardar desde SiteConfigTab, no al montar el panel
  useEffect(() => {
    if (data.site?.brand?.primary) {
      document.documentElement.style.setProperty('--primary', data.site.brand.primary)
    }
    if (data.site?.brand?.bg) {
      document.documentElement.style.setProperty('--bg', data.site.brand.bg)
      document.body.style.backgroundColor = data.site.brand.bg
    }
  }, [data.site?.brand?.primary, data.site?.brand?.bg])

  const tabs = {
    site:         <SiteConfigTab    data={data} />,
    hero:         <HeroTab          data={data} />,
    services:     <ServicesTab      data={data} />,
    ecosystems:   <EcosystemsTab    data={data} />,
    projects:     <ProjectsTab      data={data} />,
    testimonials: <TestimonialsTab  data={data} />,
    contact:      <ContactTab       data={data} />,
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .admin-main-content {
            padding-bottom: 80px !important;
          }
          .admin-header-wrap {
            padding: 0 1rem !important;
          }
          .admin-main-wrap {
            padding: 1rem !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#030303' }}>
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          brand={data.site?.brand}
        />

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <AdminHeader
            onLogout={logout}
            onToggleSidebar={() => setSidebarOpen(p => !p)}
            activeTab={activeTab}
          />

          <main
            className="admin-main-wrap"
            style={{ flex: 1, padding: '2rem', maxWidth: 900 }}
          >
            {tabs[activeTab]}
          </main>
        </div>
      </div>
    </>
  )
}