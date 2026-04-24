import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

export default function ContactTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(site)

  const set = (section, key, val) =>
    setLocal(p => ({ ...p, [section]: { ...p[section], [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteConfig({ footer: local.footer })
      setSite(local)
      toast.success('Contacto actualizado ✓')
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:6 }}>Contacto & Footer</h2>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:24 }}>
        Información de contacto y textos del pie de página.
      </p>

      <div className="section-card">
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'rgba(255,255,255,0.6)',
          textTransform:'uppercase', letterSpacing:1 }}>Datos de Contacto</h3>
        <FieldGroup label="Email">
          <input className="admin-input" value={local.footer?.email || ''}
            onChange={e => set('footer','email',e.target.value)}
            placeholder="hello@polartronic.com" type="email" />
        </FieldGroup>
        <FieldGroup label="Link de WhatsApp">
          <input className="admin-input" value={local.footer?.whatsapp || ''}
            onChange={e => set('footer','whatsapp',e.target.value)}
            placeholder="https://wa.me/549..." />
        </FieldGroup>
        <FieldGroup label="Link de Instagram">
          <input className="admin-input" value={local.footer?.instagram || ''}
            onChange={e => set('footer','instagram',e.target.value)}
            placeholder="https://instagram.com/..." />
        </FieldGroup>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'rgba(255,255,255,0.6)',
          textTransform:'uppercase', letterSpacing:1 }}>Textos del Footer</h3>
        <FieldGroup label="Copyright">
          <input className="admin-input" value={local.footer?.copy || ''}
            onChange={e => set('footer','copy',e.target.value)}
            placeholder="© 2026 Polartronic Studio..." />
        </FieldGroup>
        <FieldGroup label="Tagline Footer">
          <input className="admin-input" value={local.footer?.sub || ''}
            onChange={e => set('footer','sub',e.target.value)}
            placeholder="Diseño Web & Branding de Alto Impacto." />
        </FieldGroup>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR CONTACTO'}
      </button>
    </div>
  )
}
