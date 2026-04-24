const TABS = [
  { id: 'site',         icon: '⚙️', label: 'Marca & Colores'  },
  { id: 'hero',         icon: '🖼', label: 'Hero / Portada'   },
  { id: 'services',     icon: '💼', label: 'Servicios'        },
  { id: 'ecosystems',   icon: '🌐', label: 'Ecosistemas'      },
  { id: 'projects',     icon: '🗂',  label: 'Proyectos'        },
  { id: 'testimonials', icon: '💬', label: 'Testimonios'      },
  { id: 'contact',      icon: '📬', label: 'Contacto & Footer'},
]

export default function AdminSidebar({ activeTab, onTabChange, open }) {
  if (!open) return null

  return (
    <aside style={{ width:240, flexShrink:0, background:'#080808',
      borderRight:'1px solid rgba(255,255,255,0.07)', height:'100vh',
      overflowY:'auto', display:'flex', flexDirection:'column', padding:'1.5rem 0' }}>

      <div style={{ padding:'0 1.5rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'1.6rem',
          color:'#ff3c3c', letterSpacing:2 }}>POLARTRONIC</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Admin Panel</div>
      </div>

      <nav style={{ padding:'1rem 0', flex:1 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:12,
              padding:'11px 1.5rem', border:'none',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              borderLeft: activeTab === tab.id ? '2px solid #ff3c3c' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(255,60,60,0.06)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
          >
            <span style={{ fontSize:16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <a href="/" target="_blank" style={{ fontSize:12, color:'rgba(255,255,255,0.35)',
          textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
          🌐 Ver sitio público ↗
        </a>
      </div>
    </aside>
  )
}