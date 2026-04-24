import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
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
      // Aplicar colores inmediatamente
      document.documentElement.style.setProperty('--primary', local.brand?.primary || '#ff3c3c')
      toast.success('Configuración guardada ✓')
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:6 }}>Marca & Colores</h2>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:24 }}>
        Configura la identidad visual de tu sitio.
      </p>

      <div className="section-card">
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'rgba(255,255,255,0.6)',
          textTransform:'uppercase', letterSpacing:1 }}>Identidad de Marca</h3>
        <FieldGroup label="Nombre del Studio">
          <input className="admin-input" value={local.brand?.name || ''}
            onChange={e => set('brand','name',e.target.value)} placeholder="POLARTRONIC" />
        </FieldGroup>
        <FieldGroup label="Tagline / Eslogan">
          <input className="admin-input" value={local.brand?.tagline || ''}
            onChange={e => set('brand','tagline',e.target.value)} placeholder="Elite Digital Studio" />
        </FieldGroup>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'rgba(255,255,255,0.6)',
          textTransform:'uppercase', letterSpacing:1 }}>Colores</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <FieldGroup label="Color Primario (acento)">
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="color" value={local.brand?.primary || '#ff3c3c'}
                onChange={e => set('brand','primary',e.target.value)}
                style={{ width:48, height:42, borderRadius:8, border:'none',
                  background:'none', cursor:'pointer', padding:2 }} />
              <input className="admin-input" style={{ flex:1 }}
                value={local.brand?.primary || '#ff3c3c'}
                onChange={e => set('brand','primary',e.target.value)} placeholder="#ff3c3c" />
            </div>
          </FieldGroup>
          <FieldGroup label="Color de Fondo">
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="color" value={local.brand?.bg || '#030303'}
                onChange={e => set('brand','bg',e.target.value)}
                style={{ width:48, height:42, borderRadius:8, border:'none',
                  background:'none', cursor:'pointer', padding:2 }} />
              <input className="admin-input" style={{ flex:1 }}
                value={local.brand?.bg || '#030303'}
                onChange={e => set('brand','bg',e.target.value)} placeholder="#030303" />
            </div>
          </FieldGroup>
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'rgba(255,255,255,0.6)',
          textTransform:'uppercase', letterSpacing:1 }}>Sección About</h3>
        <FieldGroup label="Título">
          <input className="admin-input" value={local.about?.title || ''}
            onChange={e => set('about','title',e.target.value)} placeholder="Quiénes Somos" />
        </FieldGroup>
        <FieldGroup label="Descripción">
          <textarea className="admin-textarea" value={local.about?.text || ''}
            onChange={e => set('about','text',e.target.value)} rows={3} />
        </FieldGroup>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR CONFIGURACIÓN'}
      </button>
    </div>
  )
}
