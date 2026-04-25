import { useState } from 'react'
import { saveEcosystem, deleteEcosystem } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = {
  category:   '',
  title:      '',
  desc:       '',
  image:      '',
  price:      '',
  period:     '',
  featured:   false,
  features:   '[]',
  ctaLabel:   '',
  ctaLink:    '',
  detailHtml: '',
  extraText:  '',
  order:      0,
}

const arrToStr = (val) => {
  if (Array.isArray(val)) return val.join('\n')
  try {
    const parsed = JSON.parse(val || '[]')
    return Array.isArray(parsed) ? parsed.join('\n') : val
  } catch { return val || '' }
}

const strToArr = (val) => JSON.stringify(
  val.split('\n').map(s => s.trim()).filter(Boolean)
)

export default function EcosystemsTab({ data }) {
  const { ecosystems, setEcosystems } = data
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [featText, setFeatText] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [tab,      setTab]      = useState('basic')

  const startEdit = (item, idx) => {
    setForm({ ...EMPTY, ...item })
    setFeatText(arrToStr(item.features))
    setEditing(idx)
    setTab('basic')
  }
  const startNew = () => {
    setForm({ ...EMPTY, order: ecosystems.length })
    setFeatText('')
    setEditing('new')
    setTab('basic')
  }
  const cancel = () => setEditing(null)

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      const payload = { ...form, features: strToArr(featText) }
      const id = editing !== 'new' ? ecosystems[editing]?.id : null
      // FIX BUG 3: usar el id real devuelto por Firestore
      const result = await saveEcosystem(id, payload)
      if (editing === 'new') {
        setEcosystems(prev => [...prev, { ...payload, id: result.id }])
      } else {
        setEcosystems(prev => prev.map((s, i) => i === editing ? { ...s, ...payload } : s))
      }
      toast.success('Membresía guardada ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      // FIX BUG 3: eliminar solo si tiene id real
      if (item.id) await deleteEcosystem(item.id)
      setEcosystems(prev => prev.filter((_, i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error al eliminar') }
    finally  { setDeleting(null) }
  }

  const tabStyle = (id) => ({
    padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
    background: tab === id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color:      tab === id ? 'white' : 'rgba(255,255,255,0.5)',
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Membresías & Grupos</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Cada tarjeta abre un modal de detalle al hacer clic en el sitio.
          </p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVA MEMBRESÍA</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff3c3c', margin: 0 }}>
              {editing === 'new' ? '+ Nueva Membresía' : `Editando: ${form.title || '…'}`}
            </h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={tabStyle('basic')}   onClick={() => setTab('basic')}>Básico</button>
              <button style={tabStyle('content')} onClick={() => setTab('content')}>Contenido</button>
              <button style={tabStyle('cta')}     onClick={() => setTab('cta')}>CTA & HTML</button>
            </div>
          </div>

          {tab === 'basic' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Categoría / Nivel">
                  <input className="admin-input" value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Ej: Plan Básico / Grupo A" />
                </FieldGroup>
                <FieldGroup label="Nombre del Plan">
                  <input className="admin-input" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ej: Starter, Pro, Elite…" />
                </FieldGroup>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Precio (ej: $99 / Gratis)">
                  <input className="admin-input" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="$99" />
                </FieldGroup>
                <FieldGroup label="Período (ej: /mes)">
                  <input className="admin-input" value={form.period}
                    onChange={e => setForm(p => ({ ...p, period: e.target.value }))}
                    placeholder="/mes" />
                </FieldGroup>
              </div>
              <FieldGroup label="Descripción breve">
                <textarea className="admin-textarea" value={form.desc}
                  onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                  rows={2} placeholder="Resumen que aparece en la tarjeta…" />
              </FieldGroup>
              <FieldGroup label="¿Plan destacado?">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!form.featured}
                    onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    Mostrar badge "Destacado" en esta tarjeta
                  </span>
                </label>
              </FieldGroup>
              <ImageUploadField label="Imagen de fondo" folder="ecosystems"
                value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
            </>
          )}

          {tab === 'content' && (
            <>
              <FieldGroup label="Beneficios incluidos (una línea por ítem)">
                <textarea
                  className="admin-textarea"
                  value={featText}
                  onChange={e => setFeatText(e.target.value)}
                  rows={8}
                  placeholder={"Acceso a canal privado\nSesión mensual 1:1\nMaterial exclusivo descargable\nSoporte por WhatsApp"}
                />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>
                  Cada línea es un ítem con ✓. En el sitio se muestran los primeros 3 en la tarjeta y todos en el modal.
                </p>
              </FieldGroup>
              <FieldGroup label="Texto adicional (opcional, aparece en el modal)">
                <textarea className="admin-textarea" value={form.extraText}
                  onChange={e => setForm(p => ({ ...p, extraText: e.target.value }))}
                  rows={3} placeholder="Texto descriptivo adicional…" />
              </FieldGroup>
            </>
          )}

          {tab === 'cta' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Texto del botón CTA">
                  <input className="admin-input" value={form.ctaLabel}
                    onChange={e => setForm(p => ({ ...p, ctaLabel: e.target.value }))}
                    placeholder="UNIRSE AHORA" />
                </FieldGroup>
                <FieldGroup label="Link del botón CTA">
                  <input className="admin-input" value={form.ctaLink}
                    onChange={e => setForm(p => ({ ...p, ctaLink: e.target.value }))}
                    placeholder="https://wa.me/..." />
                </FieldGroup>
              </div>
              <FieldGroup
                label="HTML personalizado del modal (avanzado, opcional)"
                hint="Si pegas HTML aquí, reemplaza la vista automática del modal. Deja vacío para usar la vista automática."
              >
                <textarea
                  className="admin-textarea"
                  value={form.detailHtml}
                  onChange={e => setForm(p => ({ ...p, detailHtml: e.target.value }))}
                  rows={10}
                  placeholder={'<div style="color:white; padding:16px">\n  <h2>Título</h2>\n</div>'}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
              </FieldGroup>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : '💾 Guardar Membresía'}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {ecosystems.map((eco, idx) => {
          let fCount = 0
          try { fCount = (Array.isArray(eco.features) ? eco.features : JSON.parse(eco.features || '[]')).length } catch {}
          return (
            <div key={eco.id || idx} style={{
              borderRadius: 14, overflow: 'hidden',
              border: eco.featured ? '1px solid rgba(255,60,60,0.35)' : '1px solid rgba(255,255,255,0.08)',
              background: eco.featured ? 'rgba(255,60,60,0.04)' : 'transparent',
              position: 'relative',
            }}>
              {eco.featured && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 1,
                  background: 'var(--primary)', color: 'white',
                  fontSize: 9, fontWeight: 800, letterSpacing: 1,
                  textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20,
                }}>★ Destacado</div>
              )}
              {eco.image && (
                <img src={eco.image} alt={eco.title}
                  style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block', filter: 'brightness(0.6)' }} />
              )}
              <div style={{ padding: 14, background: 'rgba(0,0,0,0.7)' }}>
                <div style={{ color: '#ff3c3c', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{eco.category}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{eco.title}</div>
                {eco.price && (
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 14, marginTop: 2 }}>
                    {eco.price}{eco.period && <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}> {eco.period}</span>}
                  </div>
                )}
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
                  {fCount > 0 ? `${fCount} beneficio${fCount > 1 ? 's' : ''}` : 'Sin beneficios aún'}
                  {eco.ctaLink ? ' · Con CTA' : ''}
                  {eco.detailHtml ? ' · HTML custom' : ''}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => startEdit(eco, idx)} style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: 6, borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  }}>✏️ Editar</button>
                  <button onClick={() => handleDelete(eco, idx)} disabled={deleting === idx} style={{
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