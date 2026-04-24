import { useState } from 'react'
import { saveTestimonial, deleteTestimonial } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

const EMPTY = { name:'', role:'', text:'', avatar:'', order:0 }

export default function TestimonialsTab({ data }) {
  const { testimonials, setTestimonials } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const startEdit = (item, idx) => { setForm({...item}); setEditing(idx) }
  const startNew  = ()          => { setForm({...EMPTY, order:testimonials.length}); setEditing('new') }
  const cancel    = ()          => { setEditing(null) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.text.trim()) { toast.error('Nombre y texto son obligatorios'); return }
    setSaving(true)
    try {
      const id = editing !== 'new' ? testimonials[editing]?.id : null
      await saveTestimonial(id, form)
      if (editing === 'new') {
        setTestimonials(prev => [...prev, {...form, id:Date.now().toString()}])
      } else {
        setTestimonials(prev => prev.map((s,i) => i === editing ? {...s,...form} : s))
      }
      toast.success('Testimonio guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      if (item.id && !item.id.startsWith('t')) await deleteTestimonial(item.id)
      setTestimonials(prev => prev.filter((_,i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error') }
    finally  { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Testimonios</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Lo que dicen tus clientes.</p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border:'1px solid rgba(255,60,60,0.3)' }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16, color:'#ff3c3c' }}>
            {editing === 'new' ? 'Nuevo Testimonio' : 'Editando Testimonio'}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FieldGroup label="Nombre">
              <input className="admin-input" value={form.name}
                onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="María G." />
            </FieldGroup>
            <FieldGroup label="Cargo / Empresa">
              <input className="admin-input" value={form.role}
                onChange={e => setForm(p=>({...p,role:e.target.value}))} placeholder="CEO, Maison Noir" />
            </FieldGroup>
          </div>
          <FieldGroup label="Testimonio">
            <textarea className="admin-textarea" value={form.text}
              onChange={e => setForm(p=>({...p,text:e.target.value}))} rows={3}
              placeholder="Polartronic transformó nuestra presencia digital..." />
          </FieldGroup>
          <FieldGroup label="URL Avatar (opcional)">
            <input className="admin-input" value={form.avatar}
              onChange={e => setForm(p=>({...p,avatar:e.target.value}))} placeholder="https://..." />
          </FieldGroup>
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
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

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {testimonials.map((t, idx) => (
          <div key={t.id||idx} style={{ background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:18,
            display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:'rgba(255,60,60,0.15)', overflow:'hidden',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {t.avatar ? <img src={t.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700 }}>{t.name}</div>
              <div style={{ color:'#ff3c3c', fontSize:12, marginBottom:6 }}>{t.role}</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, fontStyle:'italic', lineHeight:1.6 }}>
                "{t.text}"
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button onClick={() => startEdit(t,idx)}
                style={{ background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)',
                  padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:11 }}>✏️</button>
              <button onClick={() => handleDelete(t,idx)} disabled={deleting===idx}
                style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)',
                  color:'#ff3c3c', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:11 }}>
                {deleting===idx?'...':'🗑'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
