/**
 * SiteConfigTab.jsx — FIXED
 *
 * BUG FIXES:
 * 1. setSite ora mergia correttamente il nuovo stato con quello precedente
 *    invece di sovrascrivere l'intero oggetto site.
 * 2. Lo stato locale `local` viene inizializzato con un deep clone di `site`
 *    per evitare mutazioni accidentali dell'oggetto originale.
 * 3. Dopo il salvataggio, sia setSite che local vengono sincronizzati.
 */

import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

export default function SiteConfigTab({ data }) {
  const { site, setSite } = data

  // FIX: deep clone per non mutare l'originale
  const [saving, setSaving] = useState(false)
  const [local, setLocal]   = useState(() => JSON.parse(JSON.stringify(site)))

  const set = (section, key, val) =>
    setLocal(p => ({ ...p, [section]: { ...(p[section] || {}), [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      // FIX: salva solo le sezioni gestite da questo tab
      const payload = {
        brand: local.brand || {},
        about: local.about || {},
      }
      await saveSiteConfig(payload)

      // FIX: merge con lo stato globale, non sovrascrittura
      setSite(prev => ({
        ...prev,
        brand: { ...(prev.brand || {}), ...payload.brand },
        about: { ...(prev.about || {}), ...payload.about },
      }))

      // Applica colori immediatamente
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

        {local.brand?.logo && (
          <div style={{
            marginTop: 16, padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              Preview en navbar
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: 'rgba(3,3,3,0.8)', borderRadius: 8, padding: '10px 20px',
            }}>
              <img src={local.brand.logo} alt="Logo preview"
                style={{ height: 36, maxWidth: 160, objectFit: 'contain' }} />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>← navbar</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.6 }}>
              Per rimuovere il logo, clicca il pulsante ✕ sull'immagine qui sopra.
            </p>
          </div>
        )}
      </div>

      {/* ── Identidad ── */}
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

      {/* ── Colores ── */}
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