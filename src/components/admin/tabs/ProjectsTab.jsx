import { useState } from 'react'
import { saveProject, deleteProject } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = {
  client:           '',
  industry:         '',
  title:            '',
  description:      '',
  results:          '',
  image:            '',
  url:              '#',
  order:            0,
  accentColor:      '#c5a059',
  proposalBg:       '#080a0c',
  proposalTagline:  '',
  ctaLink:          '/#contacto',
  ctaLabel:         'Solicitar Demo',
  footerTitle:      '¿Listo para empezar?',
  footerSub:        'Construyamos juntos la experiencia digital que tu negocio merece.',
  proposalFeatures: '[]',
  detailHtml:       '',
}

const EMPTY_FEATURE = { title: '', description: '', image: '', icon: '✦', badges: [] }

function toSlug(str = '') {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

function serializeFeatures(arr) { return JSON.stringify(arr) }

function detectHtmlType(html) {
  if (!html || !html.trim()) return 'empty'
  if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) return 'full'
  return 'fragment'
}

export default function ProjectsTab({ data }) {
  const { projects, setProjects } = data
  const [editing,         setEditing]         = useState(null)
  const [form,            setForm]            = useState(EMPTY)
  const [saving,          setSaving]          = useState(false)
  const [deleting,        setDeleting]        = useState(null)
  const [tab,             setTab]             = useState('basic')
  const [features,        setFeatures]        = useState([])
  const [editingFeature,  setEditingFeature]  = useState(null)
  const [featureForm,     setFeatureForm]     = useState(EMPTY_FEATURE)
  const [featureBadgeInput, setFeatureBadgeInput] = useState('')

  const startEdit = (item, idx) => {
    setForm({ ...EMPTY, ...item })
    setFeatures(parseFeatures(item.proposalFeatures))
    setEditing(idx)
    setTab('basic')
    setEditingFeature(null)
  }
  const startNew = () => {
    setForm({ ...EMPTY, order: projects.length })
    setFeatures([])
    setEditing('new')
    setTab('basic')
    setEditingFeature(null)
  }
  const cancel = () => { setEditing(null); setEditingFeature(null) }
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!form.client.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    setSaving(true)
    try {
      const payload = { ...form, proposalFeatures: serializeFeatures(features) }
      const id = editing !== 'new' ? projects[editing]?.id : null
      const result = await saveProject(id, payload)
      if (editing === 'new') {
        setProjects(prev => [...prev, { ...payload, id: result.id }])
      } else {
        setProjects(prev => prev.map((s, i) => i === editing ? { ...s, ...payload } : s))
      }
      toast.success('Proyecto guardado ✓')
      setEditing(null)
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (item, idx) => {
    setDeleting(idx)
    try {
      if (item.id) await deleteProject(item.id)
      setProjects(prev => prev.filter((_, i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error al eliminar') }
    finally  { setDeleting(null) }
  }

  // Feature CRUD
  const startNewFeature = () => { setFeatureForm({ ...EMPTY_FEATURE }); setFeatureBadgeInput(''); setEditingFeature('new') }
  const startEditFeature = (f, idx) => { setFeatureForm({ ...EMPTY_FEATURE, ...f, badges: f.badges || [] }); setFeatureBadgeInput((f.badges || []).join(', ')); setEditingFeature(idx) }
  const cancelFeature = () => setEditingFeature(null)
  const saveFeature = () => {
    if (!featureForm.title.trim()) { toast.error('El título es obligatorio'); return }
    const badges = featureBadgeInput.split(',').map(b => b.trim()).filter(Boolean)
    const fData  = { ...featureForm, badges }
    let updated = editingFeature === 'new' ? [...features, fData] : features.map((f, i) => i === editingFeature ? fData : f)
    setFeatures(updated); setEditingFeature(null)
  }
  const deleteFeature = (idx) => setFeatures(prev => prev.filter((_, i) => i !== idx))
  const moveFeature = (idx, dir) => {
    const arr = [...features]; const t = idx + dir
    if (t < 0 || t >= arr.length) return
    ;[arr[idx], arr[t]] = [arr[t], arr[idx]]; setFeatures(arr)
  }

  const tabStyle = (id) => ({
    padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
    background: tab === id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color:      tab === id ? 'white' : 'rgba(255,255,255,0.5)',
  })

  const slug = toSlug(form.client)
  const htmlType = detectHtmlType(form.detailHtml)
  const htmlTypeMeta = {
    empty: { label: 'Vacío — abre link externo o solo hover', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)' },
    full:  { label: '✓ Documento HTML completo', color: '#1D9E75', bg: 'rgba(29,158,117,0.08)' },
    fragment: { label: '⚠ Fragmento HTML — se envuelve automáticamente', color: '#EF9F27', bg: 'rgba(239,159,39,0.08)' },
  }[htmlType]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Proyectos & Apps</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Cada proyecto puede ser una landing HTML aislada o un link externo.
          </p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO PROYECTO</button>}
      </div>

      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff3c3c', margin: 0 }}>
              {editing === 'new' ? '+ Nuevo Proyecto' : `Editando: ${form.client || '…'}`}
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={tabStyle('basic')}    onClick={() => setTab('basic')}>📋 Básico</button>
              <button style={tabStyle('proposal')} onClick={() => setTab('proposal')}>🎨 Propuesta</button>
              <button style={tabStyle('features')} onClick={() => setTab('features')}>✦ Tarjetas</button>
              <button style={tabStyle('landing')}  onClick={() => setTab('landing')}>🌐 Landing App</button>
            </div>
          </div>

          {tab === 'basic' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Cliente / Empresa *"><input className="admin-input" value={form.client} onChange={e => set('client', e.target.value)} placeholder="King Barbers" /></FieldGroup>
                <FieldGroup label="Industria / Categoría"><input className="admin-input" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Barbería · Restaurante" /></FieldGroup>
              </div>
              <FieldGroup label="Título del proyecto"><input className="admin-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Rediseño Digital Completo" /></FieldGroup>
              <FieldGroup label="Descripción del trabajo"><textarea className="admin-textarea" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Sistema de reservas con panel admin..." /></FieldGroup>
              <FieldGroup label="Resultados / Métricas" hint='Separar con " · "'><input className="admin-input" value={form.results} onChange={e => set('results', e.target.value)} placeholder="+300% reservas" /></FieldGroup>
              <FieldGroup label="URL Externa (fallback)"><input className="admin-input" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." /></FieldGroup>
              <ImageUploadField label="Portada" folder="projects" value={form.image} onChange={url => set('image', url)} />
              {form.client && <div style={{ marginTop:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'rgba(255,255,255,0.4)' }}>🔗 URL propuesta: <span style={{ color:'var(--primary)', fontWeight:700 }}>/proposal/{slug}</span></div>}
            </>
          )}

          {tab === 'proposal' && (
            <>
              <div style={{ background:'rgba(255,200,0,0.04)', border:'1px solid rgba(255,200,0,0.15)', borderRadius:8, padding:'10px 14px', marginBottom:20, fontSize:12, color:'rgba(255,200,0,0.7)' }}>Configura el diseño visual de la propuesta estática.</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FieldGroup label="Color acento"><div style={{ display:'flex', gap:8 }}><input type="color" value={form.accentColor} onChange={e => set('accentColor', e.target.value)} style={{ width:48, height:42 }} /><input className="admin-input" value={form.accentColor} onChange={e => set('accentColor', e.target.value)} /></div></FieldGroup>
                <FieldGroup label="Fondo"><div style={{ display:'flex', gap:8 }}><input type="color" value={form.proposalBg} onChange={e => set('proposalBg', e.target.value)} style={{ width:48, height:42 }} /><input className="admin-input" value={form.proposalBg} onChange={e => set('proposalBg', e.target.value)} /></div></FieldGroup>
              </div>
              <FieldGroup label="Tagline"><textarea className="admin-textarea" value={form.proposalTagline} onChange={e => set('proposalTagline', e.target.value)} rows={2} /></FieldGroup>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FieldGroup label="Texto CTA"><input className="admin-input" value={form.ctaLabel} onChange={e => set('ctaLabel', e.target.value)} /></FieldGroup>
                <FieldGroup label="Link CTA"><input className="admin-input" value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} /></FieldGroup>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FieldGroup label="Título Footer"><input className="admin-input" value={form.footerTitle} onChange={e => set('footerTitle', e.target.value)} /></FieldGroup>
                <FieldGroup label="Sub Footer"><input className="admin-input" value={form.footerSub} onChange={e => set('footerSub', e.target.value)} /></FieldGroup>
              </div>
            </>
          )}

          {tab === 'features' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', margin:0 }}>Tarjetas de la propuesta.</p>
                {editingFeature === null && <button className="save-btn" onClick={startNewFeature} style={{ padding:'8px 16px', fontSize:12 }}>+ TARJETA</button>}
              </div>
              {editingFeature !== null && (
                <div style={{ background:'rgba(255,60,60,0.04)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:12, padding:20, marginBottom:16 }}>
                  <h4 style={{ fontSize:13, color:'#ff3c3c', marginBottom:16 }}>{editingFeature === 'new' ? '+ Nueva tarjeta' : 'Editando'}</h4>
                  <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:12 }}>
                    <FieldGroup label="Icono"><input className="admin-input" value={featureForm.icon} onChange={e => setFeatureForm(p => ({ ...p, icon: e.target.value }))} style={{ textAlign:'center', fontSize:22 }} /></FieldGroup>
                    <FieldGroup label="Título *"><input className="admin-input" value={featureForm.title} onChange={e => setFeatureForm(p => ({ ...p, title: e.target.value }))} /></FieldGroup>
                  </div>
                  <FieldGroup label="Descripción"><textarea className="admin-textarea" value={featureForm.description} onChange={e => setFeatureForm(p => ({ ...p, description: e.target.value }))} rows={3} /></FieldGroup>
                  <ImageUploadField label="Imagen tarjeta" folder="proposals" value={featureForm.image} onChange={url => setFeatureForm(p => ({ ...p, image: url }))} />
                  <FieldGroup label="Badges (coma)"><input className="admin-input" value={featureBadgeInput} onChange={e => setFeatureBadgeInput(e.target.value)} placeholder="Live, 24/7" /></FieldGroup>
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button className="save-btn" onClick={saveFeature} style={{ padding:'8px 18px', fontSize:12 }}>Guardar</button>
                    <button onClick={cancelFeature} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)', padding:'8px 18px', borderRadius:8 }}>Cancelar</button>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {features.length === 0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13, padding:'24px 0', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:10 }}>Sin tarjetas</div>}
                {features.map((f, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                      <button onClick={() => moveFeature(idx, -1)} disabled={idx === 0} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor: idx===0?'default':'pointer' }}>▲</button>
                      <button onClick={() => moveFeature(idx, 1)}  disabled={idx === features.length - 1} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor: idx===features.length-1?'default':'pointer' }}>▼</button>
                    </div>
                    {f.image ? <img src={f.image} alt="" style={{ width:48, height:48, borderRadius:8, objectFit:'cover', flexShrink:0 }} /> : <div style={{ width:48, height:48, borderRadius:8, background:'rgba(255,255,255,0.06)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{f.icon || '✦'}</div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{f.icon} {f.title}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.description}</div>
                      {f.badges?.length > 0 && <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>{f.badges.join(' · ')}</div>}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => startEditFeature(f, idx)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'5px 10px', borderRadius:6 }}>✏️</button>
                      <button onClick={() => deleteFeature(idx)} style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', color:'#ff3c3c', padding:'5px 10px', borderRadius:6 }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'landing' && (
            <>
              <div style={{ background:'rgba(55,138,221,0.06)', border:'1px solid rgba(55,138,221,0.2)', borderRadius:8, padding:'12px 14px', marginBottom:16, fontSize:12, color:'rgba(55,138,221,0.9)' }}>
                <strong>🌐 Landing App HTML:</strong> Pega aquí el código completo o fragmento. Se ejecutará en un iframe aislado con sandbox completo. Incluye un script automático que intercepta formularios y envía leads al inbox de Polartronic.
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'7px 12px', borderRadius:7, background:htmlTypeMeta.bg, border:`1px solid ${htmlTypeMeta.color}30`, fontSize:11, color:htmlTypeMeta.color }}>
                <span>{htmlType === 'empty' ? '⬜' : htmlType === 'full' ? '🟢' : '🟡'}</span> {htmlTypeMeta.label}
                {htmlType !== 'empty' && <span style={{ marginLeft:'auto', opacity:0.7 }}>{form.detailHtml.length.toLocaleString()} chars</span>}
              </div>
              <textarea
                className="admin-textarea"
                value={form.detailHtml}
                onChange={e => set('detailHtml', e.target.value)}
                rows={14}
                style={{ fontFamily:'monospace', fontSize:11, lineHeight:1.5 }}
                placeholder={`<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>...</body>\n</html>`}
              />
              {form.detailHtml.trim() && (
                <button onClick={() => { if(window.confirm('¿Eliminar HTML? Volverá al comportamiento por defecto.')) set('detailHtml', '') }} style={{ marginTop:10, background:'rgba(255,60,60,0.06)', border:'1px solid rgba(255,60,60,0.2)', color:'#ff6060', padding:'7px 14px', borderRadius:7, cursor:'pointer', fontSize:11 }}>🗑 Eliminar Landing</button>
              )}
            </>
          )}

          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar Proyecto'}</button>
            <button onClick={cancel} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)', padding:'10px 20px', borderRadius:8 }}>Cancelar</button>
            {form.client && <a href={`/proposal/${slug}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.5)', padding:'10px 18px', borderRadius:8, textDecoration:'none', fontSize:13 }}>🔗 Ver propuesta</a>}
          </div>
        </div>
      )}

      {/* LISTA PROYECTOS */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {projects.map((proj, idx) => {
          const client = proj.client || proj.title || '—'
          const slug = toSlug(client)
          const hasLanding = !!(proj.detailHtml && proj.detailHtml.trim())
          return (
            <div key={proj.id || idx} style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', display:'flex' }}>
              {proj.image && <div style={{ width:100, flexShrink:0 }}><img src={proj.image} alt={client} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} /></div>}
              <div style={{ flex:1, padding:'14px 16px', background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ color: proj.accentColor || 'var(--primary)', fontSize:12, fontWeight:800 }}>{client}</span>
                    {hasLanding && <span style={{ fontSize:10, color:'#378add', background:'rgba(55,138,221,0.1)', border:'1px solid rgba(55,138,221,0.3)', borderRadius:4, padding:'1px 6px' }}>🌐 App Online</span>}
                  </div>
                  {proj.description && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:4 }}>{proj.description}</div>}
                  <a href={hasLanding ? `#` : proj.url} onClick={e => e.stopPropagation()} style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textDecoration:'none', marginTop:4 }}>🔗 /{hasLanding ? 'app-landing' : `proposal/${slug}`}</a>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => startEdit(proj, idx)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'6px 14px', borderRadius:6, fontSize:12 }}>✏️</button>
                  <button onClick={() => handleDelete(proj, idx)} disabled={deleting === idx} style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', color:'#ff3c3c', padding:'6px 12px', borderRadius:6, fontSize:12 }}>{deleting === idx ? '…' : '🗑'}</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}