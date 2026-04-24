import { useState } from 'react'
import { saveProject, deleteProject } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = { title:'', category:'', image:'', link:'#', order:0 }

export default function ProjectsTab({ data }) {
  const { projects, setProjects } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const startEdit = (item, idx) => { setForm({...item}); setEditing(idx) }
  const startNew  = ()          => { setForm({...EMPTY, order:projects.length}); setEditing('new') }
  const cancel    = ()          => { setEditing(null) }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      const id = editing !== 'new' ? projects[editing]?.id : null
      await saveProject(id, form)
      if (editing === 'new') {
        setProjects(prev => [...prev, {...form, id: Date.now().toString()}])
      } else {
        setProjects(prev => prev.map((s,i) => i === editing ? {...s,...form} : s))
      }
      toast.success('Proyecto guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      if (item.id && !item.id.startsWith('p')) await deleteProject(item.id)
      setProjects(prev => prev.filter((_,i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error') }
    finally  { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Proyectos</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Portfolio de trabajos realizados.</p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border:'1px solid rgba(255,60,60,0.3)' }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'#ff3c3c' }}>
            {editing === 'new' ? 'Nuevo Proyecto' : 'Editando Proyecto'}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FieldGroup label="Título">
              <input className="admin-input" value={form.title}
                onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="Maison Noir" />
            </FieldGroup>
            <FieldGroup label="Categoría">
              <input className="admin-input" value={form.category}
                onChange={e => setForm(p=>({...p,category:e.target.value}))} placeholder="Restaurante" />
            </FieldGroup>
          </div>
          <FieldGroup label="Link del proyecto">
            <input className="admin-input" value={form.link}
              onChange={e => setForm(p=>({...p,link:e.target.value}))} placeholder="https://..." />
          </FieldGroup>
          <ImageUploadField label="Imagen" folder="projects"
            value={form.image} onChange={url => setForm(p=>({...p,image:url}))} />
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
            <button onClick={cancel} style={{ background:'transparent',
              border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)',
              padding:'10px 20px', borderRadius:8, cursor:'pointer', fontSize:13 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
        {projects.map((proj, idx) => (
          <div key={proj.id||idx} style={{ borderRadius:12, overflow:'hidden',
            border:'1px solid rgba(255,255,255,0.08)' }}>
            {proj.image && (
              <img src={proj.image} alt={proj.title}
                style={{ width:'100%', height:130, objectFit:'cover', display:'block' }} />
            )}
            <div style={{ padding:14, background:'rgba(0,0,0,0.8)' }}>
              <div style={{ color:'#ff3c3c', fontSize:11, fontWeight:800, letterSpacing:1 }}>{proj.category}</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{proj.title}</div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={() => startEdit(proj,idx)}
                  style={{ flex:1, background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)',
                    padding:'6px', borderRadius:6, cursor:'pointer', fontSize:12 }}>✏️ Editar</button>
                <button onClick={() => handleDelete(proj,idx)} disabled={deleting===idx}
                  style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)',
                    color:'#ff3c3c', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                  {deleting===idx?'...':'🗑'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
