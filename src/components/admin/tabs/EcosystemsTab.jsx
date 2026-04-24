import { useState } from 'react'
import { saveEcosystem, deleteEcosystem } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = { category:'', title:'', desc:'', image:'', order:0 }

export default function EcosystemsTab({ data }) {
  const { ecosystems, setEcosystems } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const startEdit = (item, idx) => { setForm({ ...item }); setEditing(idx) }
  const startNew  = ()          => { setForm({ ...EMPTY, order: ecosystems.length }); setEditing('new') }
  const cancel    = ()          => { setEditing(null) }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      const id = editing !== 'new' ? ecosystems[editing]?.id : null
      await saveEcosystem(id, form)
      if (editing === 'new') {
        setEcosystems(prev => [...prev, { ...form, id: Date.now().toString() }])
      } else {
        setEcosystems(prev => prev.map((s,i) => i === editing ? { ...s, ...form } : s))
      }
      toast.success('Ecosistema guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      if (item.id && !item.id.startsWith('e')) await deleteEcosystem(item.id)
      setEcosystems(prev => prev.filter((_,i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error') }
    finally  { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Ecosistemas</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Las tarjetas de nicho del sitio.</p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border:'1px solid rgba(255,60,60,0.3)' }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'#ff3c3c' }}>
            {editing === 'new' ? 'Nuevo Ecosistema' : 'Editando Ecosistema'}
          </h3>
          <FieldGroup label="Categoría (texto pequeño)">
            <input className="admin-input" value={form.category}
              onChange={e => setForm(p=>({...p,category:e.target.value}))}
              placeholder="Gourmet & Nightlife" />
          </FieldGroup>
          <FieldGroup label="Título">
            <input className="admin-input" value={form.title}
              onChange={e => setForm(p=>({...p,title:e.target.value}))}
              placeholder="Restaurantes" />
          </FieldGroup>
          <FieldGroup label="Descripción">
            <textarea className="admin-textarea" value={form.desc}
              onChange={e => setForm(p=>({...p,desc:e.target.value}))} rows={2} />
          </FieldGroup>
          <ImageUploadField label="Imagen de Fondo" folder="ecosystems"
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

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {ecosystems.map((eco, idx) => (
          <div key={eco.id||idx} style={{ borderRadius:12, overflow:'hidden',
            border:'1px solid rgba(255,255,255,0.08)', position:'relative' }}>
            {eco.image && (
              <img src={eco.image} alt={eco.title}
                style={{ width:'100%', height:140, objectFit:'cover', display:'block', filter:'brightness(0.6)' }} />
            )}
            <div style={{ padding:14, background:'rgba(0,0,0,0.8)' }}>
              <div style={{ color:'#ff3c3c', fontSize:11, fontWeight:800,
                textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{eco.category}</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{eco.title}</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{eco.desc}</div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={() => startEdit(eco, idx)}
                  style={{ flex:1, background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)',
                    padding:'6px', borderRadius:6, cursor:'pointer', fontSize:12 }}>✏️ Editar</button>
                <button onClick={() => handleDelete(eco, idx)} disabled={deleting===idx}
                  style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)',
                    color:'#ff3c3c', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                  {deleting===idx ? '...' : '🗑'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
