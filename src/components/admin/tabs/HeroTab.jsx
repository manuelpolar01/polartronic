/**
 * HeroTab.jsx — FIXED
 *
 * BUG FIX: setSite ora mergia invece di sovrascrivere l'intero oggetto site.
 * In precedenza, salvare l'hero cancellava silenziosamente brand, footer,
 * contact etc. perché `setSite(local)` sostituiva tutto.
 */

import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

export default function HeroTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(() => JSON.parse(JSON.stringify(site.hero || {})))

  const set = (key, val) => setLocal(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteConfig({ hero: local })

      // FIX: mergia solo hero, non sovrascrive tutto site
      setSite(prev => ({ ...prev, hero: { ...(prev.hero || {}), ...local } }))

      toast.success('Hero actualizado ✓')
    } catch (err) {
      console.error('[HeroTab] save error:', err)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Hero / Portada</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>
        La primera sección que ven tus visitantes.
      </p>

      <div className="section-card">
        <FieldGroup label="Badge (texto pequeño arriba)">
          <input className="admin-input" value={local.badge || ''}
            onChange={e => set('badge', e.target.value)} placeholder="Digital Creative Studio" />
        </FieldGroup>
        <FieldGroup label="Título Principal">
          <input className="admin-input" value={local.headline || ''}
            onChange={e => set('headline', e.target.value)} placeholder="ESTÉTICA QUE VENDE." />
        </FieldGroup>
        <FieldGroup label="Subtítulo">
          <textarea className="admin-textarea" value={local.sub || ''}
            onChange={e => set('sub', e.target.value)} rows={3}
            placeholder="Fusionamos el arte cinematográfico..." />
        </FieldGroup>
        <FieldGroup label="Texto del botón CTA">
          <input className="admin-input" value={local.cta || ''}
            onChange={e => set('cta', e.target.value)} placeholder="EXPLORAR ÁREAS" />
        </FieldGroup>
        <ImageUploadField label="Imagen de Fondo" folder="hero"
          value={local.bgImage || ''}
          onChange={url => set('bgImage', url)} />
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR HERO'}
      </button>
    </div>
  )
}