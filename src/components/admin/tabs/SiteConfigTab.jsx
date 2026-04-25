import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

export default function SiteConfigTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(site)

  const set = (section, key, val) =>
    setLocal(p => ({ ...p, [section]: { ...p[section], [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteConfig(local)
      setSite(local)
      document.documentElement.style.setProperty('--primary', local.brand?.primary || '#ff3c3c')
      if (local.brand?.bg) {
        document.documentElement.style.setProperty('--bg', local.brand.bg)
        document.body.style.backgroundColor = local.brand.bg
      }
      toast.success('Configuración guardada ✓')
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Marca & Colores</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>
        Configura la identidad visual de tu sitio.
      </p>

      {/* ── Logo ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Logo</h3>

        <ImageUploadField
          label="Logo del sitio (reemplaza el texto del nombre)"
          folder="brand"
          value={local.brand?.logo || ''}
          onChange={url => set('brand', 'logo', url)}
        />

        {/* Preview */}
        {local.brand?.logo && (
          <div style={{
            marginTop: 16,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              Preview en navbar
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: 'rgba(3,3,3,0.8)', borderRadius: 8, padding: '10px 20px',
            }}>
              <img
                src={local.brand.logo}
                alt="Logo preview navbar"
                style={{ height: 36, maxWidth: 160, objectFit: 'contain' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>← navbar</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: '#060606', borderRadius: 8, padding: '10px 20px',
            }}>
              <img
                src={local.brand.logo}
                alt="Logo preview footer"
                style={{ height: 44, maxWidth: 180, objectFit: 'contain' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>← footer</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.6 }}>
              Si tienes logo, el texto del nombre se oculta en navbar y footer.<br />
              Para restaurar el texto, borra la URL del logo (botón ✕ de la imagen).
            </p>
          </div>
        )}

        {!local.brand?.logo && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10, lineHeight: 1.6 }}>
            Si no subes logo, se usará el nombre en texto (Bebas Neue). Recomendado: PNG transparente, mín. 400px de ancho.
          </p>
        )}
      </div>

      {/* ── Identidad ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Identidad de Marca</h3>
        <FieldGroup label="Nombre del Studio (usado si no hay logo)">
          <input className="admin-input" value={local.brand?.name || ''}
            onChange={e => set('brand', 'name', e.target.value)} placeholder="POLARTRONIC" />
        </FieldGroup>
        <FieldGroup label="Tagline / Eslogan">
          <input className="admin-input" value={local.brand?.tagline || ''}
            onChange={e => set('brand', 'tagline', e.target.value)} placeholder="Elite Digital Studio" />
        </FieldGroup>
      </div>

      {/* ── Colores ── */}
      <div className="section-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1 }}>Colores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FieldGroup label="Color Primario (acento)">
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

      {/* ── About ── */}
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