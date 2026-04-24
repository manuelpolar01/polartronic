import { useState } from 'react'
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
        /* ── Admin responsive globals ── */
        @media (max-width: 767px) {
          .admin-main-content {
            padding-bottom: 80px !important; /* espacio para el bottom nav */
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