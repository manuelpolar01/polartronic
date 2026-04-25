import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

// Tipos de campo soportados
const FIELD_TYPES = ['text', 'email', 'tel', 'select', 'textarea']

// Campo vacío para el constructor de formulario
const EMPTY_FIELD = {
  id:          '',
  label:       '',
  type:        'text',
  required:    false,
  placeholder: '',
  options:     '', // solo para select, separado por comas
}

// Parsear fields desde JSON string a array
function parseFields(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// Serializar array de fields a JSON string
function serializeFields(arr) {
  return JSON.stringify(arr)
}

export default function ContactTab({ data }) {
  const { site, setSite } = data
  const [saving, setSaving] = useState(false)

  // Estado local del footer
  const [localFooter, setLocalFooter] = useState(site.footer || {})

  // Estado local del contact config
  const [localContact, setLocalContact] = useState({
    title:             site.contact?.title             || '¿Listo para el siguiente nivel?',
    subtitle:          site.contact?.subtitle          || 'Cuéntanos tu proyecto. Si buscas lo ordinario, no somos tu agencia.',
    ctaLabel:          site.contact?.ctaLabel          || 'ENVIAR MENSAJE',
    successTitle:      site.contact?.successTitle      || '¡Mensaje enviado!',
    successMessage:    site.contact?.successMessage    || 'Nos pondremos en contacto contigo en menos de 24 horas.',
    emailjsServiceId:  site.contact?.emailjsServiceId  || '',
    emailjsTemplateId: site.contact?.emailjsTemplateId || '',
    emailjsPublicKey:  site.contact?.emailjsPublicKey  || '',
    fields:            site.contact?.fields            || '[]',
  })

  // Fields como array para el editor visual
  const [fields, setFields] = useState(parseFields(site.contact?.fields))
  const [editingField, setEditingField] = useState(null) // null | index | 'new'
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD)

  // Tab activo del panel de contacto
  const [tab, setTab] = useState('info') // 'info' | 'form' | 'emailjs'

  const setFooter  = (key, val) => setLocalFooter(p  => ({ ...p, [key]: val }))
  const setContact = (key, val) => setLocalContact(p => ({ ...p, [key]: val }))

  // ── Gestión de campos del formulario ──────────────────────────────
  const startEditField = (field, idx) => { setFieldForm({ ...EMPTY_FIELD, ...field }); setEditingField(idx) }
  const startNewField  = ()            => { setFieldForm({ ...EMPTY_FIELD }); setEditingField('new') }
  const cancelField    = ()            => { setEditingField(null) }

  const saveField = () => {
    if (!fieldForm.id.trim() || !fieldForm.label.trim()) {
      toast.error('ID y etiqueta son obligatorios')
      return
    }
    // Validar ID único
    const idExists = fields.some((f, i) => f.id === fieldForm.id && i !== editingField)
    if (idExists) { toast.error('El ID del campo ya existe'); return }

    let updated
    if (editingField === 'new') {
      updated = [...fields, { ...fieldForm }]
    } else {
      updated = fields.map((f, i) => i === editingField ? { ...fieldForm } : f)
    }
    setFields(updated)
    setLocalContact(p => ({ ...p, fields: serializeFields(updated) }))
    setEditingField(null)
  }

  const deleteField = (idx) => {
    const updated = fields.filter((_, i) => i !== idx)
    setFields(updated)
    setLocalContact(p => ({ ...p, fields: serializeFields(updated) }))
  }

  const moveField = (idx, dir) => {
    const updated = [...fields]
    const target = idx + dir
    if (target < 0 || target >= updated.length) return
    ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
    setFields(updated)
    setLocalContact(p => ({ ...p, fields: serializeFields(updated) }))
  }

  // ── Guardar todo ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        footer:  localFooter,
        contact: { ...localContact, fields: serializeFields(fields) },
      }
      await saveSiteConfig(payload)
      setSite(prev => ({ ...prev, footer: localFooter, contact: payload.contact }))
      toast.success('Contacto actualizado ✓')
    } catch { toast.error('Error al guardar') }
    finally  { setSaving(false) }
  }

  // ── Estilos de sub-tabs ───────────────────────────────────────────
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Contacto & Footer</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Configura el formulario de contacto, integración EmailJS y datos del footer.
          </p>
        </div>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={tabStyle('info')}    onClick={() => setTab('info')}>📬 Footer</button>
          <button style={tabStyle('form')}    onClick={() => setTab('form')}>📋 Formulario</button>
          <button style={tabStyle('emailjs')} onClick={() => setTab('emailjs')}>✉️ EmailJS</button>
        </div>
      </div>

      {/* ── Tab: Footer / Contacto ── */}
      {tab === 'info' && (
        <>
          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Datos de Contacto
            </h3>
            <FieldGroup label="Email de contacto">
              <input className="admin-input" value={localFooter.email || ''}
                onChange={e => setFooter('email', e.target.value)}
                placeholder="hello@polartronic.com" type="email" />
            </FieldGroup>
            <FieldGroup label="Link de WhatsApp">
              <input className="admin-input" value={localFooter.whatsapp || ''}
                onChange={e => setFooter('whatsapp', e.target.value)}
                placeholder="https://wa.me/549..." />
            </FieldGroup>
            <FieldGroup label="Link de Instagram">
              <input className="admin-input" value={localFooter.instagram || ''}
                onChange={e => setFooter('instagram', e.target.value)}
                placeholder="https://instagram.com/..." />
            </FieldGroup>
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Textos del Footer
            </h3>
            <FieldGroup label="Copyright">
              <input className="admin-input" value={localFooter.copy || ''}
                onChange={e => setFooter('copy', e.target.value)}
                placeholder="© 2026 Polartronic Studio..." />
            </FieldGroup>
            <FieldGroup label="Tagline footer">
              <input className="admin-input" value={localFooter.sub || ''}
                onChange={e => setFooter('sub', e.target.value)}
                placeholder="Diseño Web & Branding de Alto Impacto." />
            </FieldGroup>
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Textos de la Sección Contacto
            </h3>
            <FieldGroup label="Título">
              <input className="admin-input" value={localContact.title}
                onChange={e => setContact('title', e.target.value)}
                placeholder="¿Listo para el siguiente nivel?" />
            </FieldGroup>
            <FieldGroup label="Subtítulo">
              <textarea className="admin-textarea" value={localContact.subtitle}
                onChange={e => setContact('subtitle', e.target.value)}
                rows={2} placeholder="Cuéntanos tu proyecto..." />
            </FieldGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FieldGroup label="Texto del botón enviar">
                <input className="admin-input" value={localContact.ctaLabel}
                  onChange={e => setContact('ctaLabel', e.target.value)}
                  placeholder="ENVIAR MENSAJE" />
              </FieldGroup>
            </div>
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Pantalla de Éxito (post-envío)
            </h3>
            <FieldGroup label="Título de éxito">
              <input className="admin-input" value={localContact.successTitle}
                onChange={e => setContact('successTitle', e.target.value)}
                placeholder="¡Mensaje enviado!" />
            </FieldGroup>
            <FieldGroup label="Mensaje de éxito">
              <textarea className="admin-textarea" value={localContact.successMessage}
                onChange={e => setContact('successMessage', e.target.value)}
                rows={2} placeholder="Nos pondremos en contacto en menos de 24 horas." />
            </FieldGroup>
          </div>
        </>
      )}

      {/* ── Tab: Constructor de formulario ── */}
      {tab === 'form' && (
        <>
          <div className="section-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                  Campos del formulario
                </h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                  Arrastra para reordenar. Los campos se mostrarán en el sitio en este orden.
                </p>
              </div>
              {editingField === null && (
                <button className="save-btn" onClick={startNewField} style={{ padding: '8px 16px', fontSize: 12 }}>
                  + CAMPO
                </button>
              )}
            </div>

            {/* Editor de campo */}
            {editingField !== null && (
              <div style={{ background: 'rgba(255,60,60,0.04)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, color: '#ff3c3c', margin: '0 0 14px' }}>
                  {editingField === 'new' ? '+ Nuevo campo' : 'Editando campo'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <FieldGroup label="ID único (sin espacios)">
                    <input className="admin-input" value={fieldForm.id}
                      onChange={e => setFieldForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                      placeholder="nombre_campo" />
                  </FieldGroup>
                  <FieldGroup label="Tipo de campo">
                    <select
                      className="admin-input"
                      value={fieldForm.type}
                      onChange={e => setFieldForm(p => ({ ...p, type: e.target.value }))}
                      style={{ cursor: 'pointer' }}
                    >
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </FieldGroup>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <FieldGroup label="Etiqueta visible">
                    <input className="admin-input" value={fieldForm.label}
                      onChange={e => setFieldForm(p => ({ ...p, label: e.target.value }))}
                      placeholder="Nombre completo" />
                  </FieldGroup>
                  <FieldGroup label="Placeholder">
                    <input className="admin-input" value={fieldForm.placeholder}
                      onChange={e => setFieldForm(p => ({ ...p, placeholder: e.target.value }))}
                      placeholder="Texto de ayuda..." />
                  </FieldGroup>
                </div>
                {fieldForm.type === 'select' && (
                  <FieldGroup label="Opciones (separadas por coma)">
                    <input className="admin-input" value={fieldForm.options}
                      onChange={e => setFieldForm(p => ({ ...p, options: e.target.value }))}
                      placeholder="Diseño Web,Desarrollo,Branding,Otro" />
                  </FieldGroup>
                )}
                <FieldGroup label="¿Campo requerido?">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!fieldForm.required}
                      onChange={e => setFieldForm(p => ({ ...p, required: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      Marcar como campo obligatorio
                    </span>
                  </label>
                </FieldGroup>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="save-btn" onClick={saveField} style={{ padding: '8px 18px', fontSize: 12 }}>
                    Guardar campo
                  </button>
                  <button onClick={cancelField} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.5)', padding: '8px 18px',
                    borderRadius: 8, cursor: 'pointer', fontSize: 12,
                  }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de campos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {fields.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13, padding: '20px 0' }}>
                  No hay campos definidos. Haz clic en "+ CAMPO" para agregar.
                </div>
              )}
              {fields.map((field, idx) => (
                <div key={field.id || idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '10px 12px',
                }}>
                  {/* Orden */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => moveField(idx, -1)} disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10, padding: 0 }}>▲</button>
                    <button onClick={() => moveField(idx, 1)}  disabled={idx === fields.length - 1}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: idx === fields.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: 0 }}>▼</button>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{field.label}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', color: '#ff3c3c', fontWeight: 700 }}>
                        {field.type}
                      </span>
                      {field.required && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,200,0,0.1)', color: '#ffc800', fontWeight: 700 }}>
                          requerido
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>id: {field.id}</span>
                    </div>
                    {field.placeholder && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                        placeholder: {field.placeholder}
                      </div>
                    )}
                    {field.type === 'select' && field.options && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                        opciones: {field.options}
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEditField(field, idx)} style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    }}>✏️</button>
                    <button onClick={() => deleteField(idx)} style={{
                      background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
                      color: '#ff3c3c', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Tab: EmailJS ── */}
      {tab === 'emailjs' && (
        <div className="section-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: 'rgba(255,255,255,0.7)' }}>
              Integración EmailJS
            </h3>
            <div style={{
              background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)',
              borderRadius: 8, padding: '12px 16px', fontSize: 12, color: 'rgba(255,200,0,0.8)',
              lineHeight: 1.7,
            }}>
              <strong>Cómo configurar EmailJS:</strong>
              <ol style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Ve a <strong>emailjs.com</strong> y crea una cuenta gratuita.</li>
                <li>Crea un <strong>Email Service</strong> (Gmail, Outlook, etc.) y copia el <em>Service ID</em>.</li>
                <li>Crea un <strong>Email Template</strong> con los campos <code style={{ background: 'rgba(0,0,0,0.4)', padding: '1px 5px', borderRadius: 3 }}>{'{{campo_id}}'}</code> de tu formulario.</li>
                <li>En <em>Account → API Keys</em> copia tu <strong>Public Key</strong>.</li>
                <li>Instala EmailJS: <code style={{ background: 'rgba(0,0,0,0.4)', padding: '1px 5px', borderRadius: 3 }}>npm install @emailjs/browser</code></li>
              </ol>
            </div>
          </div>

          <FieldGroup label="Service ID">
            <input className="admin-input" value={localContact.emailjsServiceId}
              onChange={e => setContact('emailjsServiceId', e.target.value)}
              placeholder="service_xxxxxxx" />
          </FieldGroup>
          <FieldGroup label="Template ID">
            <input className="admin-input" value={localContact.emailjsTemplateId}
              onChange={e => setContact('emailjsTemplateId', e.target.value)}
              placeholder="template_xxxxxxx" />
          </FieldGroup>
          <FieldGroup label="Public Key">
            <input className="admin-input" value={localContact.emailjsPublicKey}
              onChange={e => setContact('emailjsPublicKey', e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxx" />
          </FieldGroup>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '12px 16px', marginTop: 8,
            fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Plantilla de template sugerida:</strong>
            <pre style={{ margin: '8px 0 0', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.4)' }}>
{`De: {{nombre}} <{{email}}>
Empresa: {{empresa}}
Servicio: {{servicio_de_interes}}
Mensaje:
{{cuéntanos_tu_proyecto}}`}
            </pre>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              Los nombres de variable son los IDs de los campos definidos en la pestaña "Formulario".
            </p>
          </div>
        </div>
      )}

      {/* Botón guardar global */}
      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 GUARDAR CONTACTO'}
      </button>
    </div>
  )
}