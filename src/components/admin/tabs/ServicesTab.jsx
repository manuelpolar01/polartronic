import { useState } from 'react'
import { saveService, deleteService } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

const EMPTY = { icon: '🎨', title: '', desc: '', price: '', order: 0 }

export default function ServicesTab({ data }) {
  const { services, setServices } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const startEdit = (svc, idx) => { setForm({ ...svc }); setEditing(idx) }
  const startNew  = ()         => { setForm({ ...EMPTY, order: services.length }); setEditing('new') }
  const cancel    = ()         => { setEditing(null) }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      const id = editing !== 'new' ? services[editing]?.id : null
      // FIX BUG 3: usar el id real devuelto por Firestore
      const result = await saveService(id, form)
      if (editing === 'new') {
        setServices(prev => [...prev, { ...form, id: result.id }])
      } else {
        setServices(prev => prev.map((s, i) => i === editing ? { ...s, ...form } : s))
      }
      toast.success('Servicio guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (svc, idx) => {
    setDeleting(idx)
    try {
      // FIX BUG 3: eliminar solo si tiene id real (string de Firestore, no vacío)
      if (svc.id) await deleteService(svc.id)
      setServices(prev => prev.filter((_, i) => i !== idx))
      toast.success('Servicio eliminado')
    } catch { toast.error('Error al eliminar') }
    finally  { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Servicios</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Los servicios que ofrece tu studio.</p>
        </div>
        {editing === null && (
          <button className="save-btn" onClick={startNew}>+ NUEVO</button>
        )}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#ff3c3c' }}>
            {editing === 'new' ? 'Nuevo Servicio' : 'Editando Servicio'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <FieldGroup label="Emoji">
              <input className="admin-input" value={form.icon}
                onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                style={{ textAlign: 'center', fontSize: 22 }} />
            </FieldGroup>
            <FieldGroup label="Título">
              <input className="admin-input" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Diseño Web" />
            </FieldGroup>
          </div>
          <FieldGroup label="Descripción">
            <textarea className="admin-textarea" value={form.desc}
              onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} rows={2} />
          </FieldGroup>
          <FieldGroup label="Precio">
            <input className="admin-input" value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="Desde $800" />
          </FieldGroup>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
            <button onClick={cancel} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '10px 20px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {services.map((svc, idx) => (
          <div key={svc.id || idx} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{svc.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{svc.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{svc.desc}</div>
              <div style={{ color: '#ff3c3c', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{svc.price}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(svc, idx)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', padding: '6px 14px',
                borderRadius: 6, cursor: 'pointer', fontSize: 12,
              }}>✏️ Editar</button>
              <button onClick={() => handleDelete(svc, idx)} disabled={deleting === idx} style={{
                background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
                color: '#ff3c3c', padding: '6px 14px', borderRadius: 6,
                cursor: 'pointer', fontSize: 12,
              }}>
                {deleting === idx ? '...' : '🗑 Borrar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}