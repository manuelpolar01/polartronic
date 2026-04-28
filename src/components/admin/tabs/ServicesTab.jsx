/**
 * ServicesTab.jsx — v2 CRUD + IMAGE UPLOAD
 * CRUD completo: crear / editar / eliminar / listar
 * Cada servicio: emoji icon, título, descripción, precio, imagen (upload)
 */

import { useState } from 'react'
import { saveService, deleteService } from '../../../lib/firebaseHelpers'
import FieldGroup        from '../FieldGroup'
import ImageUploadField  from '../ImageUploadField'
import toast             from 'react-hot-toast'

const EMPTY = {
  icon:  '🎨',
  title: '',
  desc:  '',
  price: '',
  image: '',
  order: 0,
}

export default function ServicesTab({ data }) {
  const { services, setServices } = data

  const [editing,  setEditing]  = useState(null)   // null | 'new' | number(index)
  const [form,     setForm]     = useState({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const startNew = () => {
    setForm({ ...EMPTY, order: services.length })
    setEditing('new')
  }

  const startEdit = (svc, idx) => {
    setForm({
      icon:  svc.icon  || '🎨',
      title: svc.title || '',
      desc:  svc.desc  || '',
      price: svc.price || '',
      image: svc.image || '',
      order: svc.order ?? idx,
    })
    setEditing(idx)
  }

  const cancel = () => {
    setEditing(null)
    setForm({ ...EMPTY })
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Il titolo è obbligatorio')
      return
    }
    setSaving(true)
    try {
      const existingId = editing !== 'new' ? services[editing]?.id : null
      const result = await saveService(existingId, form)

      if (editing === 'new') {
        setServices(prev => [...prev, { ...form, id: result.id }])
      } else {
        setServices(prev =>
          prev.map((s, i) => i === editing ? { ...s, ...form, id: s.id } : s)
        )
      }

      toast.success('Servizio salvato ✓')
      cancel()
    } catch (err) {
      console.error('[ServicesTab] save:', err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (svc, idx) => {
    setDeleting(idx)
    try {
      if (svc.id) await deleteService(svc.id)
      setServices(prev => prev.filter((_, i) => i !== idx))
      toast.success('Servizio eliminato')
    } catch (err) {
      console.error('[ServicesTab] delete:', err)
      toast.error("Errore durante l'eliminazione")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Servizi</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Ogni servizio può avere un'immagine di copertina, emoji, titolo, descrizione e prezzo.
          </p>
        </div>
        {editing === null && (
          <button className="save-btn" onClick={startNew}>+ NUOVO</button>
        )}
      </div>

      {/* FORM EDIT / NEW */}
      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#ff3c3c' }}>
            {editing === 'new' ? '+ Nuovo Servizio' : `Modifica: ${form.title || '…'}`}
          </h3>

          <div style={{ marginBottom: 20 }}>
            <ImageUploadField
              label="Immagine di copertina (opzionale)"
              folder="services"
              value={form.image}
              onChange={url => set('image', url)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <FieldGroup label="Emoji">
              <input
                className="admin-input"
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                style={{ textAlign: 'center', fontSize: 22 }}
                maxLength={4}
              />
            </FieldGroup>
            <FieldGroup label="Titolo *">
              <input
                className="admin-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Diseño Web"
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Descrizione">
            <textarea
              className="admin-textarea"
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              rows={3}
              placeholder="Descrizione del servizio..."
            />
          </FieldGroup>

          <FieldGroup label="Prezzo">
            <input
              className="admin-input"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="Da €800"
            />
          </FieldGroup>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Servizio'}
            </button>
            <button onClick={cancel} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
            }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {services.length === 0 && editing === null && (
          <div style={{
            textAlign: 'center', padding: 40,
            color: 'rgba(255,255,255,0.2)', fontSize: 14,
            border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
          }}>
            Nessun servizio. Clicca "+ NUOVO" per aggiungere il primo.
          </div>
        )}

        {services.map((svc, idx) => (
          <div key={svc.id || idx} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            {/* Thumbnail */}
            <div style={{
              width: 80, height: 64, flexShrink: 0,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {svc.image ? (
                <img src={svc.image} alt={svc.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ fontSize: 28 }}>{svc.icon || '🎨'}</span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, padding: '10px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {svc.image && svc.icon && <span style={{ fontSize: 16 }}>{svc.icon}</span>}
                <span style={{ fontWeight: 700, fontSize: 15 }}>{svc.title}</span>
              </div>
              {svc.desc && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {svc.desc}
                </div>
              )}
              {svc.price && (
                <div style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  {svc.price}
                </div>
              )}
            </div>

            {/* Azioni */}
            <div style={{ display: 'flex', gap: 8, padding: '0 14px', flexShrink: 0 }}>
              <button onClick={() => startEdit(svc, idx)} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                padding: '6px 14px', borderRadius: 6,
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
              }}>✏️ Modifica</button>
              <button onClick={() => handleDelete(svc, idx)} disabled={deleting === idx} style={{
                background: 'rgba(255,60,60,0.08)',
                border: '1px solid rgba(255,60,60,0.2)',
                color: '#ff3c3c', padding: '6px 12px',
                borderRadius: 6, cursor: deleting === idx ? 'not-allowed' : 'pointer',
                fontSize: 12, fontFamily: 'inherit',
                opacity: deleting === idx ? 0.5 : 1,
              }}>
                {deleting === idx ? '...' : '🗑'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}