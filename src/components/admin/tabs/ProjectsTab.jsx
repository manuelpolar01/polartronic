import { useState } from 'react'
import { saveProject, deleteProject } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = {
  client:      '',
  industry:    '',
  title:       '',
  description: '',
  results:     '',
  image:       '',
  url:         '#',
  order:       0,
}

export default function ProjectsTab({ data }) {
  const { projects, setProjects } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const startEdit = (item, idx) => { setForm({ ...EMPTY, ...item }); setEditing(idx) }
  const startNew  = ()          => { setForm({ ...EMPTY, order: projects.length }); setEditing('new') }
  const cancel    = ()          => { setEditing(null) }

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!form.client.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    setSaving(true)
    try {
      const id = editing !== 'new' ? projects[editing]?.id : null
      // FIX BUG 3: usar el id real devuelto por Firestore
      const result = await saveProject(id, form)
      if (editing === 'new') {
        setProjects(prev => [...prev, { ...form, id: result.id }])
      } else {
        setProjects(prev => prev.map((s, i) => i === editing ? { ...s, ...form } : s))
      }
      toast.success('Caso de éxito guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      // FIX BUG 3: eliminar solo si tiene id real
      if (item.id) await deleteProject(item.id)
      setProjects(prev => prev.filter((_, i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error al eliminar') }
    finally  { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Casos de Éxito / Portafolio</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Muestra resultados reales: cliente, industria, descripción y métricas obtenidas.
          </p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO CASO</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#ff3c3c' }}>
            {editing === 'new' ? '+ Nuevo Caso de Éxito' : `Editando: ${form.client || '…'}`}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldGroup label="Cliente / Empresa *">
              <input className="admin-input" value={form.client}
                onChange={e => set('client', e.target.value)}
                placeholder="Maison Noir" />
            </FieldGroup>
            <FieldGroup label="Industria / Categoría">
              <input className="admin-input" value={form.industry}
                onChange={e => set('industry', e.target.value)}
                placeholder="Restaurante · Salud · Moda…" />
            </FieldGroup>
          </div>

          <FieldGroup label="Título del proyecto (opcional)">
            <input className="admin-input" value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Rediseño Digital Completo" />
          </FieldGroup>

          <FieldGroup label="Descripción del trabajo realizado">
            <textarea className="admin-textarea" value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Sitio web inmersivo con sistema de reservas integrado y menú interactivo." />
          </FieldGroup>

          <FieldGroup
            label="Resultados / Métricas obtenidas"
            hint='Separar con " · " para mostrar como ítems. Ej: +300% reservas online · +45% ticket promedio'
          >
            <input className="admin-input" value={form.results}
              onChange={e => set('results', e.target.value)}
              placeholder="+300% reservas online · +45% ticket promedio" />
          </FieldGroup>

          <FieldGroup label="URL del proyecto (opcional)">
            <input className="admin-input" value={form.url}
              onChange={e => set('url', e.target.value)}
              placeholder="https://..." />
          </FieldGroup>

          <ImageUploadField label="Imagen de portada" folder="projects"
            value={form.image} onChange={url => set('image', url)} />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar Caso'}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map((proj, idx) => {
          const client      = proj.client   || proj.title    || '—'
          const industry    = proj.industry || proj.category || ''
          const description = proj.description || proj.desc  || ''
          const results     = proj.results || ''

          return (
            <div key={proj.id || idx} style={{
              borderRadius: 14, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: 0,
            }}>
              {proj.image && (
                <div style={{ width: 100, flexShrink: 0, overflow: 'hidden' }}>
                  <img src={proj.image} alt={client}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, padding: '14px 16px', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#ff3c3c', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {client}
                    </span>
                    {industry && (
                      <span style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '2px 7px', borderRadius: 10,
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {industry}
                      </span>
                    )}
                  </div>
                  {description && (
                    <div style={{
                      color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {description}
                    </div>
                  )}
                  {results && (
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 3 }}>
                      📊 {results}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(proj, idx)} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(proj, idx)} disabled={deleting === idx} style={{
                    background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
                    color: '#ff3c3c', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  }}>
                    {deleting === idx ? '…' : '🗑'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}