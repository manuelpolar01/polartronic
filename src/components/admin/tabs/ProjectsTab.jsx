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
  // ── Proposal fields ──
  accentColor:      '#c5a059',
  proposalBg:       '#080a0c',
  proposalTagline:  '',
  ctaLink:          '/#contacto',
  ctaLabel:         'Solicitar Demo',
  footerTitle:      '¿Listo para empezar?',
  footerSub:        'Construyamos juntos la experiencia digital que tu negocio merece.',
  proposalFeatures: '[]',
}

const EMPTY_FEATURE = {
  title:       '',
  description: '',
  image:       '',
  icon:        '✦',
  badges:      [],
}

function toSlug(str = '') {
  return str.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function parseFeatures(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

function serializeFeatures(arr) {
  return JSON.stringify(arr)
}

export default function ProjectsTab({ data }) {
  const { projects, setProjects } = data
  const [editing,         setEditing]         = useState(null)
  const [form,            setForm]             = useState(EMPTY)
  const [saving,          setSaving]           = useState(false)
  const [deleting,        setDeleting]         = useState(null)
  const [tab,             setTab]              = useState('basic')
  const [features,        setFeatures]         = useState([])
  const [editingFeature,  setEditingFeature]   = useState(null)
  const [featureForm,     setFeatureForm]      = useState(EMPTY_FEATURE)
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

  const cancel = () => {
    setEditing(null)
    setEditingFeature(null)
  }

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

  // ── Feature CRUD ──────────────────────────────────────────────────
  const startNewFeature = () => {
    setFeatureForm({ ...EMPTY_FEATURE })
    setFeatureBadgeInput('')
    setEditingFeature('new')
  }

  const startEditFeature = (f, idx) => {
    setFeatureForm({ ...EMPTY_FEATURE, ...f, badges: f.badges || [] })
    setFeatureBadgeInput((f.badges || []).join(', '))
    setEditingFeature(idx)
  }

  const cancelFeature = () => setEditingFeature(null)

  const saveFeature = () => {
    if (!featureForm.title.trim()) { toast.error('El título es obligatorio'); return }
    const badges = featureBadgeInput.split(',').map(b => b.trim()).filter(Boolean)
    const fData  = { ...featureForm, badges }
    let updated
    if (editingFeature === 'new') {
      updated = [...features, fData]
    } else {
      updated = features.map((f, i) => i === editingFeature ? fData : f)
    }
    setFeatures(updated)
    setEditingFeature(null)
  }

  const deleteFeature = (idx) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx))
  }

  const moveFeature = (idx, dir) => {
    const arr = [...features]
    const t   = idx + dir
    if (t < 0 || t >= arr.length) return
    ;[arr[idx], arr[t]] = [arr[t], arr[idx]]
    setFeatures(arr)
  }

  // ── Tab styles ────────────────────────────────────────────────────
  const tabStyle = (id) => ({
    padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
    background: tab === id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color:      tab === id ? 'white' : 'rgba(255,255,255,0.5)',
  })

  const slug = toSlug(form.client)

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Proyectos & Propuestas</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Cada proyecto genera automáticamente una página de propuesta visual en <code style={{ color: 'var(--primary)', fontSize: 12 }}>/proposal/:slug</code>
          </p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVO PROYECTO</button>}
      </div>

      {/* ─── Formulario ─── */}
      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          {/* Header form */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff3c3c', margin: 0 }}>
              {editing === 'new' ? '+ Nuevo Proyecto' : `Editando: ${form.client || '…'}`}
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={tabStyle('basic')}    onClick={() => setTab('basic')}>📋 Básico</button>
              <button style={tabStyle('proposal')} onClick={() => setTab('proposal')}>🎨 Propuesta</button>
              <button style={tabStyle('features')} onClick={() => setTab('features')}>✦ Tarjetas</button>
            </div>
          </div>

          {/* ── Tab: Básico ── */}
          {tab === 'basic' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Cliente / Empresa *">
                  <input className="admin-input" value={form.client}
                    onChange={e => set('client', e.target.value)}
                    placeholder="King Barbers" />
                </FieldGroup>
                <FieldGroup label="Industria / Categoría">
                  <input className="admin-input" value={form.industry}
                    onChange={e => set('industry', e.target.value)}
                    placeholder="Barbería · Restaurante · Moda…" />
                </FieldGroup>
              </div>

              <FieldGroup label="Título del proyecto (opcional)">
                <input className="admin-input" value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Rediseño Digital Completo" />
              </FieldGroup>

              <FieldGroup label="Descripción del trabajo realizado">
                <textarea className="admin-textarea" value={form.description}
                  onChange={e => set('description', e.target.value)} rows={3}
                  placeholder="Sistema de reservas con panel admin, notificaciones WhatsApp y landing premium." />
              </FieldGroup>

              <FieldGroup
                label="Resultados / Métricas"
                hint='Separar con " · " para mostrar como pills. Ej: +300% reservas · -60% no-shows'
              >
                <input className="admin-input" value={form.results}
                  onChange={e => set('results', e.target.value)}
                  placeholder="+300% reservas · -60% no-shows" />
              </FieldGroup>

              <FieldGroup label="URL del proyecto (opcional)">
                <input className="admin-input" value={form.url}
                  onChange={e => set('url', e.target.value)}
                  placeholder="https://..." />
              </FieldGroup>

              <ImageUploadField label="Imagen de portada" folder="projects"
                value={form.image} onChange={url => set('image', url)} />

              {/* Slug preview */}
              {form.client && (
                <div style={{
                  marginTop: 12, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px',
                  fontSize: 12, color: 'rgba(255,255,255,0.4)',
                }}>
                  🔗 URL de propuesta:{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    /proposal/{slug}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Propuesta ── */}
          {tab === 'proposal' && (
            <>
              <div style={{
                background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.15)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                fontSize: 12, color: 'rgba(255,200,0,0.7)', lineHeight: 1.7,
              }}>
                Configura el diseño visual de la página de propuesta que verá tu cliente en <strong>/proposal/{slug || 'slug'}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Color de acento">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.accentColor || '#c5a059'}
                      onChange={e => set('accentColor', e.target.value)}
                      style={{ width: 48, height: 42, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', padding: 2 }} />
                    <input className="admin-input" style={{ flex: 1 }}
                      value={form.accentColor || '#c5a059'}
                      onChange={e => set('accentColor', e.target.value)}
                      placeholder="#c5a059" />
                  </div>
                </FieldGroup>
                <FieldGroup label="Color de fondo">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.proposalBg || '#080a0c'}
                      onChange={e => set('proposalBg', e.target.value)}
                      style={{ width: 48, height: 42, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', padding: 2 }} />
                    <input className="admin-input" style={{ flex: 1 }}
                      value={form.proposalBg || '#080a0c'}
                      onChange={e => set('proposalBg', e.target.value)}
                      placeholder="#080a0c" />
                  </div>
                </FieldGroup>
              </div>

              <FieldGroup label="Tagline / Subtítulo del hero">
                <textarea className="admin-textarea" value={form.proposalTagline}
                  onChange={e => set('proposalTagline', e.target.value)} rows={2}
                  placeholder="La experiencia digital que tu barbería merece." />
              </FieldGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Texto del botón CTA">
                  <input className="admin-input" value={form.ctaLabel}
                    onChange={e => set('ctaLabel', e.target.value)}
                    placeholder="Solicitar Demo" />
                </FieldGroup>
                <FieldGroup label="Link del botón CTA">
                  <input className="admin-input" value={form.ctaLink}
                    onChange={e => set('ctaLink', e.target.value)}
                    placeholder="/#contacto" />
                </FieldGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Título del footer">
                  <input className="admin-input" value={form.footerTitle}
                    onChange={e => set('footerTitle', e.target.value)}
                    placeholder="¿Listo para empezar?" />
                </FieldGroup>
                <FieldGroup label="Subtítulo del footer">
                  <input className="admin-input" value={form.footerSub}
                    onChange={e => set('footerSub', e.target.value)}
                    placeholder="Construyamos juntos…" />
                </FieldGroup>
              </div>
            </>
          )}

          {/* ── Tab: Tarjetas ── */}
          {tab === 'features' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Las tarjetas aparecen en la sección principal de la propuesta. Máximo 4 recomendado.
                </p>
                {editingFeature === null && (
                  <button className="save-btn" onClick={startNewFeature} style={{ padding: '8px 16px', fontSize: 12 }}>
                    + TARJETA
                  </button>
                )}
              </div>

              {/* Form tarjeta */}
              {editingFeature !== null && (
                <div style={{
                  background: 'rgba(255,60,60,0.04)', border: '1px solid rgba(255,60,60,0.2)',
                  borderRadius: 12, padding: 20, marginBottom: 16,
                }}>
                  <h4 style={{ fontSize: 13, color: '#ff3c3c', marginBottom: 16, fontWeight: 700 }}>
                    {editingFeature === 'new' ? '+ Nueva tarjeta' : 'Editando tarjeta'}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12 }}>
                    <FieldGroup label="Icono">
                      <input className="admin-input" value={featureForm.icon}
                        onChange={e => setFeatureForm(p => ({ ...p, icon: e.target.value }))}
                        style={{ textAlign: 'center', fontSize: 22 }} />
                    </FieldGroup>
                    <FieldGroup label="Título *">
                      <input className="admin-input" value={featureForm.title}
                        onChange={e => setFeatureForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="El Trono Virtual" />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Descripción">
                    <textarea className="admin-textarea" value={featureForm.description}
                      onChange={e => setFeatureForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      placeholder="Agendamiento inteligente en tiempo real. Permite al cliente reservar en menos de 30 segundos." />
                  </FieldGroup>

                  <ImageUploadField label="Imagen de la tarjeta" folder="proposals"
                    value={featureForm.image}
                    onChange={url => setFeatureForm(p => ({ ...p, image: url }))} />

                  <FieldGroup label="Badges (separados por coma)" hint="Ej: Sincronización Live, Recordatorios, 24/7">
                    <input className="admin-input" value={featureBadgeInput}
                      onChange={e => setFeatureBadgeInput(e.target.value)}
                      placeholder="Sincronización Live, Recordatorios" />
                  </FieldGroup>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="save-btn" onClick={saveFeature} style={{ padding: '8px 18px', fontSize: 12 }}>
                      Guardar tarjeta
                    </button>
                    <button onClick={cancelFeature} style={{
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.5)', padding: '8px 18px',
                      borderRadius: 8, cursor: 'pointer', fontSize: 12,
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista tarjetas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {features.length === 0 && (
                  <div style={{
                    textAlign: 'center', color: 'rgba(255,255,255,0.2)',
                    fontSize: 13, padding: '24px 0',
                    border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10,
                  }}>
                    Sin tarjetas aún. Haz clic en "+ TARJETA" para añadir.
                  </div>
                )}
                {features.map((f, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    {/* Orden */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => moveFeature(idx, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10, padding: 0 }}>▲</button>
                      <button onClick={() => moveFeature(idx, 1)}  disabled={idx === features.length - 1} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: idx === features.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: 0 }}>▼</button>
                    </div>
                    {/* Preview imagen */}
                    {f.image && (
                      <img src={f.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    {!f.image && (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {f.icon || '✦'}
                      </div>
                    )}
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                        {f.icon} {f.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.description}
                      </div>
                      {f.badges?.length > 0 && (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                          {f.badges.join(' · ')}
                        </div>
                      )}
                    </div>
                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEditFeature(f, idx)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>✏️</button>
                      <button onClick={() => deleteFeature(idx)} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: '#ff3c3c', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Acciones form */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar Proyecto'}
            </button>
            <button onClick={cancel} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '10px 20px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
            }}>
              Cancelar
            </button>
            {form.client && (
              <a
                href={`/proposal/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)', padding: '10px 18px',
                  borderRadius: 8, textDecoration: 'none', fontSize: 13,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
              >
                🔗 Ver propuesta
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── Lista de proyectos ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map((proj, idx) => {
          const client      = proj.client   || proj.title    || '—'
          const industry    = proj.industry || proj.category || ''
          const description = proj.description || proj.desc  || ''
          const results     = proj.results || ''
          const slug        = toSlug(client)
          const accent      = proj.accentColor || 'var(--primary)'
          const featCount   = parseFeatures(proj.proposalFeatures).length

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
                    <span style={{ color: accent, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {client}
                    </span>
                    {industry && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 7px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {industry}
                      </span>
                    )}
                    {featCount > 0 && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                        {featCount} tarjeta{featCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {description && (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {description}
                    </div>
                  )}
                  {results && (
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 3 }}>
                      📊 {results}
                    </div>
                  )}
                  {/* Link propuesta */}
                  <a
                    href={`/proposal/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 11, color: accent, textDecoration: 'none', marginTop: 4, display: 'inline-block', opacity: 0.7 }}
                  >
                    🔗 /proposal/{slug}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(proj, idx)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(proj, idx)} disabled={deleting === idx} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: '#ff3c3c', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
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