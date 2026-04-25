/**
 * AdminSidebar.jsx — FIXED
 * BUG: TABS_AGGIORNATO was defined but the code referenced TABS (undefined) → crash → black screen.
 * FIX: renamed to TABS consistently throughout.
 */

import { useEffect, useState } from 'react'

const TABS = [
  { id: 'site',          icon: '⚙️', label: 'Marca & Colores'      },
  { id: 'hero',          icon: '🖼',  label: 'Hero / Portada'       },
  { id: 'services',      icon: '💼', label: 'Servicios'            },
  { id: 'ecosystems',    icon: '🎟',  label: 'Membresías'           },
  { id: 'projects',      icon: '🗂',  label: 'Proyectos'            },
  { id: 'testimonials',  icon: '💬', label: 'Testimonios'          },
  { id: 'contact',       icon: '📬', label: 'Contacto & Footer'    },
  { id: 'language',      icon: '🌐', label: 'Lingua del Sito'      },
  { id: 'leads',         icon: '📥', label: 'Inbox Lead'           },
  { id: 'agents',        icon: '👥', label: 'Agenti Commerciali'   },
  { id: 'notifications', icon: '🔔', label: 'Notifiche & Canali'   },
]

export default function AdminSidebar({ activeTab, onTabChange, open, onToggle, brand }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const logo = brand?.logo || ''
  const name = brand?.name || 'POLARTRONIC'

  const BrandMark = ({ height = 28 }) => logo ? (
    <img src={logo} alt={name} style={{ height, maxWidth: 160, objectFit: 'contain' }} />
  ) : (
    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: '#ff3c3c', letterSpacing: 2 }}>
      {name}
    </span>
  )

  /* ── MOBILE: bottom sheet ── */
  if (isMobile) {
    return (
      <>
        {open && (
          <div
            onClick={onToggle}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
          />
        )}

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
          background: '#090909',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: open ? '20px 20px 0 0' : 0,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1)',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
          </div>

          <div style={{
            padding: '4px 20px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
          }}>
            <div>
              <BrandMark height={28} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Admin Panel</div>
            </div>
            <button onClick={onToggle} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', width: 34, height: 34, borderRadius: '50%',
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          <nav style={{ overflowY: 'auto', padding: '8px 0', flex: 1 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); onToggle() }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderLeft: activeTab === tab.id ? '3px solid #ff3c3c' : '3px solid transparent',
                  background: activeTab === tab.id ? 'rgba(255,60,60,0.08)' : 'transparent',
                  color:      activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span style={{ marginLeft: 'auto', color: '#ff3c3c', fontSize: 10 }}>●</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <a href="/" target="_blank" style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              🌐 Ver sitio público ↗
            </a>
          </div>
        </div>

        {/* Bottom bar fissa */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: open ? 0 : 1050,
          background: 'rgba(8,8,8,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'stretch',
          height: 60, backdropFilter: 'blur(20px)',
          visibility: open ? 'hidden' : 'visible',
        }}>
          {TABS.slice(0, 4).map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 2px',
                borderTop: activeTab === tab.id ? '2px solid #ff3c3c' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                color: activeTab === tab.id ? '#ff3c3c' : 'rgba(255,255,255,0.35)',
              }}>
                {tab.label.split(' ')[0]}
              </span>
            </button>
          ))}
          <button
            onClick={onToggle}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 2px',
              borderTop: '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>☰</span>
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.35)' }}>Più</span>
          </button>
        </nav>
      </>
    )
  }

  /* ── DESKTOP: sidebar classico ── */
  if (!open) return null

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: '#080808',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      height: '100vh', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
    }}>
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <BrandMark height={32} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Admin Panel</div>
      </div>

      <nav style={{ padding: '1rem 0', flex: 1 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 1.5rem', border: 'none',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              borderLeft:  activeTab === tab.id ? '2px solid #ff3c3c' : '2px solid transparent',
              background:  activeTab === tab.id ? 'rgba(255,60,60,0.06)' : 'transparent',
              color:       activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <a href="/" target="_blank" style={{
          fontSize: 12, color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🌐 Ver sitio público ↗
        </a>
      </div>
    </aside>
  )
}