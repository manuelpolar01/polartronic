/**
 * EcosystemsTab.jsx — v2 (detailHtml mejorado)
 * ─────────────────────────────────────────────────────────────────────────
 * CAMBIOS QUIRÚRGICOS respecto a la versión anterior:
 *
 *  1. Campo "detailHtml" del tab CTA & HTML:
 *     - Texto de ayuda actualizado: explica que puede ser HTML completo
 *       (como el de King Barbes) o un fragmento, con ejemplos.
 *     - Indicador visual de tipo de contenido detectado:
 *       "Documento completo" / "Fragmento HTML" / "Vacío (modal automático)"
 *     - Botón de "Plantilla HTML completa" que inserta una estructura
 *       base tipo King Barbes para que el admin pueda editar.
 *
 *  TODO LO DEMÁS INTACTO:
 *  - CRUD completo (crear, editar, eliminar)
 *  - Tabs básico / contenido / cta
 *  - ImageUploadField (upload a Firestore)
 *  - features como textarea línea-por-línea
 *  - saveEcosystem / deleteEcosystem de firebaseHelpers
 *  - FieldGroup, toast
 */

import { useState } from 'react'
import { saveEcosystem, deleteEcosystem } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import ImageUploadField from '../ImageUploadField'
import toast from 'react-hot-toast'

const EMPTY = {
  category: '', title: '', desc: '', image: '',
  price: '', period: '', featured: false,
  features: '[]',
  ctaLabel: '', ctaLink: '',
  detailHtml: '',
  extraText: '',
  order: 0,
}

// Convierte array JS → string de textarea (una línea por ítem)
const arrToStr = (val) => {
  if (Array.isArray(val)) return val.join('\n')
  try {
    const parsed = JSON.parse(val || '[]')
    return Array.isArray(parsed) ? parsed.join('\n') : val
  } catch { return val || '' }
}

// Convierte string textarea → JSON array string para guardar
const strToArr = (val) => JSON.stringify(
  val.split('\n').map(s => s.trim()).filter(Boolean)
)

// Detecta qué tipo de HTML está en el campo
function detectHtmlType(html) {
  if (!html || !html.trim()) return 'empty'
  if (/<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)) return 'full'
  return 'fragment'
}

// Plantilla HTML completa de ejemplo (estilo King Barbes)
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nombre del Plan</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #333; background: #fff; }
        h1, h2 { font-family: 'Playfair Display', serif; }
        nav { background: #1a1a1a; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        nav .logo { color: #d4af37; font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; }
        .hero { background: linear-gradient(135deg, rgba(26,26,26,0.9), rgba(26,26,26,0.7)), url('TU_IMAGEN_URL') center/cover; min-height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; color: white; padding: 4rem 2rem; }
        .hero h1 { font-size: clamp(2rem,5vw,3.5rem); margin-bottom: 1rem; }
        .hero h2 { color: #d4af37; font-size: 1rem; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 1rem; }
        .hero p { color: #e0e0e0; max-width: 600px; margin: 0 auto 2rem; }
        .cta { display: inline-block; padding: 1rem 2.5rem; background: #d4af37; color: #1a1a1a; text-decoration: none; font-weight: 700; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
        .cta:hover { background: #1a1a1a; color: #d4af37; }
        section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .service-card { background: #f8f8f8; padding: 2rem; border-radius: 12px; text-align: center; border-bottom: 3px solid transparent; transition: all 0.3s; }
        .service-card:hover { border-bottom-color: #d4af37; transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .service-card h3 { margin: 1rem 0 0.5rem; }
        .section-title { text-align: center; margin-bottom: 2.5rem; }
        .section-title h2 { font-size: 2rem; }
        .features-list { list-style: none; display: grid; gap: 1rem; margin-top: 1.5rem; }
        .features-list li { display: flex; align-items: flex-start; gap: 0.8rem; }
        .features-list li::before { content: '✓'; color: #d4af37; font-weight: 700; flex-shrink: 0; }
        footer { background: #1a1a1a; color: white; text-align: center; padding: 2rem; }
        footer .logo { color: #d4af37; font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; }
    </style>
</head>
<body>

<nav>
    <div class="logo">NOMBRE DEL PLAN</div>
</nav>

<section class="hero" style="min-height:60vh; background: linear-gradient(135deg,rgba(26,26,26,0.9),rgba(26,26,26,0.7)); display:flex; align-items:center; justify-content:center; text-align:center; color:white; padding:4rem 2rem;">
    <div>
        <h2 style="color:#d4af37; text-transform:uppercase; letter-spacing:3px; font-size:1rem; margin-bottom:1rem;">Tu Categoría Aquí</h2>
        <h1 style="font-family:'Playfair Display',serif; font-size:clamp(2rem,5vw,3.5rem); margin-bottom:1rem;">Título Principal del Plan</h1>
        <p style="color:#e0e0e0; max-width:600px; margin:0 auto 2rem;">Descripción detallada de lo que ofrece este plan. Explica el valor único y los beneficios principales para el cliente.</p>
        <a href="#contacto" class="cta">Solicitar Información</a>
    </div>
</section>

<section>
    <div class="section-title">
        <h2>Qué Incluye</h2>
        <p>Todo lo que necesitas en un solo plan</p>
    </div>
    <div class="services-grid">
        <div class="service-card">
            <div style="font-size:2.5rem">📱</div>
            <h3>Beneficio 1</h3>
            <p>Descripción breve del primer beneficio principal de este plan.</p>
        </div>
        <div class="service-card">
            <div style="font-size:2.5rem">💼</div>
            <h3>Beneficio 2</h3>
            <p>Descripción breve del segundo beneficio principal de este plan.</p>
        </div>
        <div class="service-card">
            <div style="font-size:2.5rem">🚀</div>
            <h3>Beneficio 3</h3>
            <p>Descripción breve del tercer beneficio principal de este plan.</p>
        </div>
    </div>
</section>

<section style="background:#f8f8f8; padding:4rem 2rem;">
    <div style="max-width:700px; margin:0 auto;">
        <h2 style="font-family:'Playfair Display',serif; text-align:center; margin-bottom:1.5rem;">Características Completas</h2>
        <ul class="features-list">
            <li>Característica completa número 1</li>
            <li>Característica completa número 2</li>
            <li>Característica completa número 3</li>
            <li>Característica completa número 4</li>
            <li>Característica completa número 5</li>
        </ul>
    </div>
</section>

<section id="contacto" style="text-align:center; padding:4rem 2rem;">
    <h2 style="font-family:'Playfair Display',serif; margin-bottom:1rem;">¿Listo para Empezar?</h2>
    <p style="color:#666; margin-bottom:2rem;">Contáctanos y te ayudaremos a elegir el mejor plan para tu negocio.</p>
    <a href="TU_LINK_AQUI" class="cta">Contactar Ahora</a>
</section>

<footer>
    <div class="logo">NOMBRE DEL PLAN</div>
    <p style="color:#aaa; margin-top:1rem; font-size:0.9rem;">© 2024 — Todos los derechos reservados</p>
</footer>

</body>
</html>`

export default function EcosystemsTab({ data }) {
  const { ecosystems, setEcosystems } = data
  const [editing,   setEditing]  = useState(null)
  const [form,      setForm]     = useState(EMPTY)
  const [featText,  setFeatText] = useState('')
  const [saving,    setSaving]   = useState(false)
  const [deleting,  setDeleting] = useState(null)
  const [tab,       setTab]      = useState('basic')

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
      await saveEcosystem(id, payload)
      if (editing === 'new') {
        setEcosystems(prev => [...prev, { ...payload, id: Date.now().toString() }])
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
      if (item.id && !item.id.startsWith('e')) await deleteEcosystem(item.id)
      setEcosystems(prev => prev.filter((_, i) => i !== idx))
      toast.success('Eliminado')
    } catch { toast.error('Error') }
    finally  { setDeleting(null) }
  }

  const tabStyle = (id) => ({
    padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
    background: tab === id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color:      tab === id ? 'white' : 'rgba(255,255,255,0.5)',
  })

  // Para el indicador de tipo HTML
  const htmlType = detectHtmlType(form.detailHtml)
  const htmlTypeMeta = {
    empty:    { label: 'Vacío — usa modal automático', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)' },
    full:     { label: '✓ Documento HTML completo detectado', color: '#1D9E75', bg: 'rgba(29,158,117,0.08)' },
    fragment: { label: '⚠ Fragmento HTML — se envolverá automáticamente', color: '#EF9F27', bg: 'rgba(239,159,39,0.08)' },
  }[htmlType]

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Membresías & Grupos</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Cada tarjeta puede abrir una landing page HTML completa o un modal automático.
          </p>
        </div>
        {editing === null && <button className="save-btn" onClick={startNew}>+ NUEVA MEMBRESÍA</button>}
      </div>

      {/* ─── Formulario de edición ─── */}
      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff3c3c', margin: 0 }}>
              {editing === 'new' ? '+ Nueva Membresía' : `Editando: ${form.title || '…'}`}
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={tabStyle('basic')}   onClick={() => setTab('basic')}>Básico</button>
              <button style={tabStyle('content')} onClick={() => setTab('content')}>Contenido</button>
              <button style={tabStyle('cta')}     onClick={() => setTab('cta')}>CTA & Landing</button>
            </div>
          </div>

          {/* ── Tab: Básico ── */}
          {tab === 'basic' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FieldGroup label="Categoría / Nivel">
                  <input className="admin-input" value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Ej: Plan Básico / Grupo A" />
                </FieldGroup>
                <FieldGroup label="Nombre del Plan *">
                  <input className="admin-input" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Starter, Pro, Elite…" />
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
              <FieldGroup label="Descripción breve (aparece en la tarjeta)">
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
              <ImageUploadField label="Imagen de la tarjeta" folder="ecosystems"
                value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
            </>
          )}

          {/* ── Tab: Contenido (fallback modal) ── */}
          {tab === 'content' && (
            <>
              <div style={{
                background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.12)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                fontSize: 12, color: 'rgba(255,200,0,0.7)', lineHeight: 1.7,
              }}>
                Este contenido se usa como <strong>fallback</strong> cuando no hay Landing HTML configurada.
                Si hay HTML en la pestaña "CTA & Landing", este contenido se ignora.
              </div>
              <FieldGroup label="Beneficios incluidos (una línea por ítem)">
                <textarea
                  className="admin-textarea"
                  value={featText}
                  onChange={e => setFeatText(e.target.value)}
                  rows={8}
                  placeholder={"Acceso a canal privado\nSesión mensual 1:1\nMaterial exclusivo\nSoporte WhatsApp"}
                />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>
                  Cada línea es un ítem con ✓. En la tarjeta se muestran los primeros 3 y todos en el modal.
                </p>
              </FieldGroup>
              <FieldGroup label="Texto adicional (aparece en el modal fallback)">
                <textarea className="admin-textarea" value={form.extraText}
                  onChange={e => setForm(p => ({ ...p, extraText: e.target.value }))}
                  rows={3} placeholder="Texto descriptivo adicional…" />
              </FieldGroup>
            </>
          )}

          {/* ── Tab: CTA & Landing HTML ── */}
          {tab === 'cta' && (
            <>
              {/* CTA buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
                <FieldGroup label="Texto del botón CTA">
                  <input className="admin-input" value={form.ctaLabel}
                    onChange={e => setForm(p => ({ ...p, ctaLabel: e.target.value }))}
                    placeholder="UNIRSE AHORA" />
                </FieldGroup>
                <FieldGroup label="Link del botón CTA">
                  <input className="admin-input" value={form.ctaLink}
                    onChange={e => setForm(p => ({ ...p, ctaLink: e.target.value }))}
                    placeholder="https://wa.me/... o https://..." />
                </FieldGroup>
              </div>

              {/* Separador */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                margin: '20px 0 16px',
              }} />

              {/* Landing HTML */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                      🌐 Landing Page HTML (abre fullscreen al clicar la tarjeta)
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                      Pega aquí un HTML completo (como el de King Barbes) o un fragmento.
                      Se renderiza en un iframe aislado con su propio CSS y JS.
                    </div>
                  </div>
                  {/* Botón insertar plantilla */}
                  <button
                    onClick={() => {
                      if (!form.detailHtml.trim() || window.confirm('¿Reemplazar el contenido actual con la plantilla?')) {
                        setForm(p => ({ ...p, detailHtml: HTML_TEMPLATE }))
                      }
                    }}
                    style={{
                      background: 'rgba(127,119,221,0.1)',
                      border: '1px solid rgba(127,119,221,0.3)',
                      color: '#AFA9EC',
                      padding: '7px 14px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    📋 Insertar Plantilla
                  </button>
                </div>

                {/* Indicador de tipo detectado */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  padding: '7px 12px',
                  borderRadius: 7,
                  background: htmlTypeMeta.bg,
                  border: `1px solid ${htmlTypeMeta.color}30`,
                  fontSize: 11,
                  color: htmlTypeMeta.color,
                  fontWeight: 600,
                }}>
                  <span style={{ fontSize: 13 }}>
                    {htmlType === 'empty' ? '⬜' : htmlType === 'full' ? '🟢' : '🟡'}
                  </span>
                  {htmlTypeMeta.label}
                  {htmlType !== 'empty' && (
                    <span style={{ marginLeft: 'auto', fontWeight: 400, opacity: 0.7 }}>
                      {form.detailHtml.length.toLocaleString()} caracteres
                    </span>
                  )}
                </div>

                {/* Textarea del HTML */}
                <textarea
                  className="admin-textarea"
                  value={form.detailHtml}
                  onChange={e => setForm(p => ({ ...p, detailHtml: e.target.value }))}
                  rows={14}
                  placeholder={`<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  ...\n</head>\n<body>\n  <!-- Tu contenido aquí -->\n</body>\n</html>`}
                  style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5 }}
                />

                {/* Nota aclaratoria */}
                <div style={{
                  marginTop: 10,
                  background: 'rgba(55,138,221,0.04)',
                  border: '1px solid rgba(55,138,221,0.12)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 11,
                  color: 'rgba(55,138,221,0.7)',
                  lineHeight: 1.7,
                }}>
                  <strong>Cómo funciona:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                    <li>Si hay HTML → al clicar la tarjeta se abre una ventana fullscreen con tu página</li>
                    <li>El HTML se renderiza en un iframe aislado: su CSS y JS no afectan al sitio principal</li>
                    <li>Puedes incrustar cualquier página HTML (King Barbes, landings, catálogos, iframes, etc.)</li>
                    <li>Si está vacío → se abre el modal clásico con la lista de beneficios</li>
                    <li>Las tarjetas con Landing muestran el badge <strong style={{ color: '#378add' }}>🌐 Landing</strong></li>
                  </ul>
                </div>

                {/* Botón limpiar */}
                {form.detailHtml.trim() && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar el HTML de la landing? La tarjeta volverá al modal automático.')) {
                        setForm(p => ({ ...p, detailHtml: '' }))
                      }
                    }}
                    style={{
                      marginTop: 10,
                      background: 'rgba(255,60,60,0.06)',
                      border: '1px solid rgba(255,60,60,0.2)',
                      color: '#ff6060',
                      padding: '7px 14px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    🗑 Eliminar Landing HTML
                  </button>
                )}
              </div>
            </>
          )}

          {/* Acciones */}
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

      {/* ─── Lista de membresías ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {ecosystems.map((eco, idx) => {
          let fCount = 0
          try { fCount = (Array.isArray(eco.features) ? eco.features : JSON.parse(eco.features || '[]')).length } catch {}
          const hasLanding = !!(eco.detailHtml && eco.detailHtml.trim())
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
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {fCount > 0 && <span>{fCount} beneficio{fCount > 1 ? 's' : ''}</span>}
                  {eco.ctaLink && <span>· Con CTA</span>}
                  {hasLanding && (
                    <span style={{
                      color: '#378add',
                      background: 'rgba(55,138,221,0.12)',
                      border: '1px solid rgba(55,138,221,0.25)',
                      borderRadius: 6,
                      padding: '0 6px',
                      fontSize: 10,
                      fontWeight: 700,
                    }}>
                      🌐 Landing HTML
                    </span>
                  )}
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