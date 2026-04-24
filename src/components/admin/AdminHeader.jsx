const TAB_LABELS = {
  site:         '⚙️ Marca & Colores',
  hero:         '🖼 Hero / Portada',
  services:     '💼 Servicios',
  ecosystems:   '🎟 Membresías',
  projects:     '🗂 Proyectos',
  testimonials: '💬 Testimonios',
  contact:      '📬 Contacto & Footer',
}

export default function AdminHeader({ onLogout, onToggleSidebar, activeTab }) {
  return (
    <header
      className="admin-header-wrap"
      style={{
        height: 60, background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem', flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 100,
      }}
    >
      {/* Hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: 16,
            cursor: 'pointer', padding: '6px 10px', borderRadius: 7,
            lineHeight: 1,
          }}
        >
          ☰
        </button>
        {activeTab && (
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>Panel</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {TAB_LABELS[activeTab] || activeTab}
            </span>
          </span>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none', padding: '6px 12px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          🌐 <span className="hide-xs">Ver sitio</span>
        </a>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,60,60,0.1)',
            border: '1px solid rgba(255,60,60,0.3)',
            color: '#ff3c3c', padding: '6px 16px',
            borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Salir
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hide-xs { display: none; }
        }
      `}</style>
    </header>
  )
}