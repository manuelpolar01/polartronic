/**
 * HeroTab.jsx — v3 CAROUSEL
 * Full CRUD for hero slides.
 * Each slide: badge, headline, sub, cta, bgImage (upload)
 */

import { useState } from 'react'
import { saveSiteConfig }  from '../../../lib/firebaseHelpers'
import FieldGroup          from '../FieldGroup'
import ImageUploadField    from '../ImageUploadField'
import toast               from 'react-hot-toast'

const EMPTY_SLIDE = {
  badge:    '',
  headline: '',
  sub:      '',
  cta:      '',
  bgImage:  '',
}

export default function HeroTab({ data }) {
  const { site, setSite } = data

  // Migrate legacy single-slide to array
  const initSlides = () => {
    const hero = site.hero || {}
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      return JSON.parse(JSON.stringify(hero.slides))
    }
    // Convert legacy fields to first slide
    return [{
      badge:   hero.badge   || '',
      headline:hero.headline|| '',
      sub:     hero.sub     || '',
      cta:     hero.cta     || '',
      bgImage: hero.bgImage || '',
    }]
  }

  const [slides,  setSlides]  = useState(initSlides)
  const [editing, setEditing] = useState(null)   // null | 'new' | index
  const [form,    setForm]    = useState(EMPTY_SLIDE)
  const [saving,  setSaving]  = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const startNew  = () => { setForm({ ...EMPTY_SLIDE }); setEditing('new') }
  const startEdit = (slide, idx) => { setForm({ ...EMPTY_SLIDE, ...slide }); setEditing(idx) }
  const cancel    = () => setEditing(null)

  const handleSave = async () => {
    if (!form.headline.trim()) { toast.error('Il titolo è obbligatorio'); return }
    setSaving(true)
    try {
      const updated = editing === 'new'
        ? [...slides, { ...form }]
        : slides.map((s, i) => i === editing ? { ...form } : s)
      await saveSiteConfig({ hero: { slides: updated } })
      setSlides(updated)
      setSite(prev => ({ ...prev, hero: { ...(prev.hero || {}), slides: updated } }))
      toast.success('Slide salvata ✓')
      setEditing(null)
    } catch (err) {
      console.error('[HeroTab]', err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idx) => {
    if (slides.length === 1) { toast.error('Devi avere almeno una slide'); return }
    const updated = slides.filter((_, i) => i !== idx)
    try {
      await saveSiteConfig({ hero: { slides: updated } })
      setSlides(updated)
      setSite(prev => ({ ...prev, hero: { ...(prev.hero || {}), slides: updated } }))
      toast.success('Slide eliminata')
    } catch { toast.error('Errore') }
  }

  const move = async (idx, dir) => {
    const arr = [...slides]
    const t   = idx + dir
    if (t < 0 || t >= arr.length) return
    ;[arr[idx], arr[t]] = [arr[t], arr[idx]]
    try {
      await saveSiteConfig({ hero: { slides: arr } })
      setSlides(arr)
      setSite(prev => ({ ...prev, hero: { ...(prev.hero || {}), slides: arr } }))
    } catch { toast.error('Errore') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Hero / Carosello</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            {slides.length} slide{slides.length > 1 ? 's' : ''} · Il carosello scorre automaticamente ogni 6 secondi.
          </p>
        </div>
        {editing === null && (
          <button className="save-btn" onClick={startNew}>+ NUOVA SLIDE</button>
        )}
      </div>

      {/* Edit / New form */}
      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#ff3c3c' }}>
            {editing === 'new' ? '+ Nuova Slide' : `Slide ${editing + 1}`}
          </h3>

          <FieldGroup label="Badge (testo piccolo sopra)">
            <input className="admin-input" value={form.badge}
              onChange={e => set('badge', e.target.value)}
              placeholder="Digital Creative Studio" />
          </FieldGroup>

          <FieldGroup label="Titolo principale *">
            <input className="admin-input" value={form.headline}
              onChange={e => set('headline', e.target.value)}
              placeholder="ESTÉTICA QUE VENDE." />
          </FieldGroup>

          <FieldGroup label="Sottotitolo">
            <textarea className="admin-textarea" value={form.sub}
              onChange={e => set('sub', e.target.value)}
              rows={3}
              placeholder="Fusionamos el arte cinematográfico..." />
          </FieldGroup>

          <FieldGroup label="Testo bottone CTA">
            <input className="admin-input" value={form.cta}
              onChange={e => set('cta', e.target.value)}
              placeholder="EXPLORAR ÁREAS" />
          </FieldGroup>

          <ImageUploadField
            label="Immagine di sfondo"
            folder="hero"
            value={form.bgImage}
            onChange={url => set('bgImage', url)}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Slide'}
            </button>
            <button onClick={cancel} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '10px 20px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
            }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Slides list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slides.map((slide, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: 14, alignItems: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Thumbnail */}
            <div style={{
              width: 110, height: 70, flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden',
            }}>
              {slide.bgImage ? (
                <img src={slide.bgImage} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>🖼</div>
              )}
              {/* Slide number badge */}
              <div style={{
                position: 'absolute', bottom: 4, left: 6,
                background: 'rgba(0,0,0,0.7)', color: 'white',
                fontSize: 9, fontWeight: 800, letterSpacing: 1,
                padding: '2px 6px', borderRadius: 4,
              }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, padding: '12px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                {slide.headline || '(senza titolo)'}
              </div>
              {slide.badge && (
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {slide.badge}
                </div>
              )}
              {slide.sub && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {slide.sub}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, padding: '0 14px', flexShrink: 0 }}>
              {/* Move up/down */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px' }}>▲</button>
                <button onClick={() => move(idx, 1)} disabled={idx === slides.length - 1}
                  style={{ background: 'none', border: 'none', color: idx === slides.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)', cursor: idx === slides.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px' }}>▼</button>
              </div>
              <button onClick={() => startEdit(slide, idx)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', padding: '6px 12px',
                borderRadius: 6, cursor: 'pointer', fontSize: 11,
              }}>✏️</button>
              <button onClick={() => handleDelete(idx)} style={{
                background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
                color: '#ff3c3c', padding: '6px 10px',
                borderRadius: 6, cursor: 'pointer', fontSize: 11,
              }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div style={{
        marginTop: 20, background: 'rgba(55,138,221,0.04)',
        border: '1px solid rgba(55,138,221,0.15)',
        borderRadius: 10, padding: '12px 16px',
        fontSize: 12, color: 'rgba(55,138,221,0.7)', lineHeight: 1.7,
      }}>
        <strong>Carosello:</strong> Le slide scorrono automaticamente ogni 6 secondi.
        Il visitatore può navigare con le frecce o i punti. Puoi avere da 1 a N slides.
        Con una sola slide, le frecce sono nascoste.
      </div>
    </div>
  )
}