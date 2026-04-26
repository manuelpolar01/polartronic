/**
 * SiteConfigTab.jsx — v4 COMPLETO
 * ✅ CRUD imágenes: logo, favicon — con botón eliminar
 * ✅ Posición logo: solo-logo / logo+nombre-lado / logo-arriba-nombre / solo-nombre
 * ✅ Fix colores texto con var(--text-main)
 */

import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const LOGO_LAYOUTS = [
  {
    id: 'logo-only',
    label: 'Solo Logo',
    icon: '🖼',
    desc: 'Solo la imagen, sin texto',
    preview: (logo, name, primary) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.8)', borderRadius: 8 }}>
        {logo
          ? <img src={logo} alt={name} style={{ height: 32, maxWidth: 140, objectFit: 'contain' }} />
          : <div style={{ height: 32, width: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>LOGO</div>
        }
      </div>
    ),
  },
  {
    id: 'logo-name-side',
    label: 'Logo + Nombre (lado)',
    icon: '↔️',
    desc: 'Logo a la izquierda, nombre a la derecha',
    preview: (logo, name, primary) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(0,0,0,0.8)', borderRadius: 8 }}>
        {logo
          ? <img src={logo} alt={name} style={{ height: 28, maxWidth: 60, objectFit: 'contain' }} />
          : <div style={{ height: 28, width: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
        }
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', color: primary, letterSpacing: 2 }}>{name}</span>
      </div>
    ),
  },
  {
    id: 'logo-name-stack',
    label: 'Logo + Nombre (apilado)',
    icon: '↕️',
    desc: 'Logo arriba, nombre debajo',
    preview: (logo, name, primary) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 20px', background: 'rgba(0,0,0,0.8)', borderRadius: 8 }}>
        {logo
          ? <img src={logo} alt={name} style={{ height: 24, maxWidth: 80, objectFit: 'contain' }} />
          : <div style={{ height: 24, width: 60, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
        }
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.9rem', color: primary, letterSpacing: 2 }}>{name}</span>
      </div>
    ),
  },
  {
    id: 'name-only',
    label: 'Solo Nombre',
    icon: '✏️',
    desc: 'Solo el texto, sin imagen',
    preview: (logo, name, primary) => (
      <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.8)', borderRadius: 8 }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: primary, letterSpacing: 2 }}>{name}</span>
      </div>
    ),
  },
]

export default function SiteConfigTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(() => JSON.parse(JSON.stringify(site)))

  const set = (section, key, val) =>
    setLocal(p => ({ ...p, [section]: { ...(p[section] || {}), [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        brand: local.brand || {},
        about: local.about || {},
      }
      await saveSiteConfig(payload)
      setSite(prev => ({
        ...prev,
        brand: { ...(prev.brand || {}), ...payload.brand },
        about: { ...(prev.about || {}), ...payload.about },
      }))
      if (local.brand?.primary) {
        document.documentElement.style.setProperty('--primary', local.brand.primary)
      }
      if (local.brand?.bg) {
        document.documentElement.style.setProperty('--bg', local.brand.bg)
        document.body.style.backgroundColor = local.brand.bg
      }
      toast.success('Configurazione salvata ✓')
    } catch (err) {
      console.error('[SiteConfigTab] save error:', err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const selectedLayout = local.brand?.logoLayout || 'logo-only'
  const logo  = local.brand?.logo  || ''
  const name  = local.brand?.name  || 'POLARTRONIC'
  const primary = local.brand?.primary || '#ff3c3c'

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Marca & Colores</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>
        Configura la identidad visual de tu sitio.
      </p>

      {/* ── LOGO ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Logo</h3>

        {/* Upload + eliminar */}
        <ImageUploadField
          label="Imagen del logo"
          folder="brand"
          value={logo}
          onChange={url => set('brand', 'logo', url)}
        />

        {/* Botón eliminar logo */}
        {logo && (
          <button
            onClick={() => set('brand', 'logo', '')}
            style={{
              marginTop: 10, background: 'rgba(255,60,60,0.08)',
              border: '1px solid rgba(255,60,60,0.25)',
              color: '#ff3c3c', padding: '8px 16px',
              borderRadius: 8, cursor: 'pointer', fontSize: 12,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            🗑 Eliminar logo
          </button>
        )}

        {/* ── Selección de layout ── */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            Posición del logo en la navbar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {LOGO_LAYOUTS.map(layout => {
              const isActive = selectedLayout === layout.id
              const canShow  = layout.id !== 'logo-only' && layout.id !== 'logo-name-side' && layout.id !== 'logo-name-stack' || logo || layout.id === 'name-only'
              return (
                <button
                  key={layout.id}
                  onClick={() => set('brand', 'logoLayout', layout.id)}
                  style={{
                    border: isActive ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '12px',
                    background: isActive ? 'rgba(255,60,60,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                    opacity: (!logo && layout.id !== 'name-only') ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{layout.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'white' : 'rgba(255,255,255,0.6)' }}>
                      {layout.label}
                    </span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                    )}
                  </div>
                  {/* Preview visual */}
                  <div style={{ marginBottom: 8 }}>
                    {layout.preview(logo, name, primary)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                    {layout.desc}
                    {!logo && layout.id !== 'name-only' && (
                      <span style={{ color: 'rgba(255,60,60,0.6)', display: 'block', marginTop: 2 }}>
                        ↑ Sube un logo primero
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview navbar en tiempo real */}
        <div style={{ marginTop: 20, padding: '16px 20px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: 10 }}>Preview navbar en tiempo real</div>
          <div style={{ background: 'rgba(3,3,3,0.9)', borderRadius: 8, padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavbarLogoPreview layout={selectedLayout} logo={logo} name={name} primary={primary} />
            <div style={{ display: 'flex', gap: 20 }}>
              {['Home', 'Servicios', 'Contacto'].map(l => (
                <span key={l} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── IDENTIDAD ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Identidad de Marca</h3>
        <FieldGroup label="Nombre del Studio">
          <input className="admin-input" value={local.brand?.name || ''}
            onChange={e => set('brand', 'name', e.target.value)} placeholder="POLARTRONIC" />
        </FieldGroup>
        <FieldGroup label="Tagline / Eslogan">
          <input className="admin-input" value={local.brand?.tagline || ''}
            onChange={e => set('brand', 'tagline', e.target.value)} placeholder="Elite Digital Studio" />
        </FieldGroup>
      </div>

      {/* ── COLORES ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Colores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FieldGroup label="Color Primario">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={local.brand?.primary || '#ff3c3c'}
                onChange={e => set('brand', 'primary', e.target.value)}
                style={{ width: 48, height: 42, borderRadius: 8, border: 'none',
                  background: 'none', cursor: 'pointer', padding: 2 }} />
              <input className="admin-input" style={{ flex: 1 }}
                value={local.brand?.primary || '#ff3c3c'}
                onChange={e => set('brand', 'primary', e.target.value)} placeholder="#ff3c3c" />
            </div>
          </FieldGroup>
          <FieldGroup label="Color de Fondo">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={local.brand?.bg || '#030303'}
                onChange={e => set('brand', 'bg', e.target.value)}
                style={{ width: 48, height: 42, borderRadius: 8, border: 'none',
                  background: 'none', cursor: 'pointer', padding: 2 }} />
              <input className="admin-input" style={{ flex: 1 }}
                value={local.brand?.bg || '#030303'}
                onChange={e => set('brand', 'bg', e.target.value)} placeholder="#030303" />
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Sección About</h3>
        <FieldGroup label="Título">
          <input className="admin-input" value={local.about?.title || ''}
            onChange={e => set('about', 'title', e.target.value)} placeholder="Quiénes Somos" />
        </FieldGroup>
        <FieldGroup label="Descripción">
          <textarea className="admin-textarea" value={local.about?.text || ''}
            onChange={e => set('about', 'text', e.target.value)} rows={3} />
        </FieldGroup>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR CONFIGURACIÓN'}
      </button>
    </div>
  )
}

// Componente de preview del logo según layout
function NavbarLogoPreview({ layout, logo, name, primary }) {
  if (layout === 'logo-only') {
    return logo
      ? <img src={logo} alt={name} style={{ height: 32, maxWidth: 160, objectFit: 'contain' }} />
      : <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: primary, letterSpacing: 2 }}>{name}</span>
  }
  if (layout === 'logo-name-side') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logo && <img src={logo} alt={name} style={{ height: 28, maxWidth: 60, objectFit: 'contain' }} />}
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.5rem', color: primary, letterSpacing: 2 }}>{name}</span>
      </div>
    )
  }
  if (layout === 'logo-name-stack') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        {logo && <img src={logo} alt={name} style={{ height: 22, maxWidth: 80, objectFit: 'contain' }} />}
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1rem', color: primary, letterSpacing: 2 }}>{name}</span>
      </div>
    )
  }
  // name-only
  return <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: primary, letterSpacing: 2 }}>{name}</span>
}