import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

export default function HeroTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(site)

  const set = (key, val) =>
    setLocal(p => ({ ...p, hero: { ...p.hero, [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteConfig({ hero: local.hero })
      setSite(local)
      toast.success('Hero actualizado ✓')
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:6 }}>Hero / Portada</h2>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:24 }}>
        La primera sección que ven tus visitantes.
      </p>

      <div className="section-card">
        <FieldGroup label="Badge (texto pequeño arriba)">
          <input className="admin-input" value={local.hero?.badge || ''}
            onChange={e => set('badge', e.target.value)} placeholder="Digital Creative Studio" />
        </FieldGroup>
        <FieldGroup label="Título Principal">
          <input className="admin-input" value={local.hero?.headline || ''}
            onChange={e => set('headline', e.target.value)} placeholder="ESTÉTICA QUE VENDE." />
        </FieldGroup>
        <FieldGroup label="Subtítulo">
          <textarea className="admin-textarea" value={local.hero?.sub || ''}
            onChange={e => set('sub', e.target.value)} rows={3}
            placeholder="Fusionamos el arte cinematográfico..." />
        </FieldGroup>
        <FieldGroup label="Texto del botón CTA">
          <input className="admin-input" value={local.hero?.cta || ''}
            onChange={e => set('cta', e.target.value)} placeholder="EXPLORAR ÁREAS" />
        </FieldGroup>
        <ImageUploadField label="Imagen de Fondo" folder="hero"
          value={local.hero?.bgImage || ''}
          onChange={url => set('bgImage', url)} />
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR HERO'}
      </button>
    </div>
  )
}
