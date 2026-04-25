import { useState, useRef } from 'react'

// ─── Parser de fields ─────────────────────────────────────────────────
function parseFields(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// ─── Campos por defecto ───────────────────────────────────────────────
const DEFAULT_FIELDS = [
  { id: 'name',    label: 'Nombre',               type: 'text',     required: true,  placeholder: 'Tu nombre' },
  { id: 'email',   label: 'Email',                 type: 'email',    required: true,  placeholder: 'tu@email.com' },
  { id: 'company', label: 'Empresa / Proyecto',    type: 'text',     required: false, placeholder: 'Nombre de tu empresa' },
  { id: 'service', label: 'Servicio de interés',   type: 'select',   required: false, options: 'Diseño Web,Desarrollo,Branding Digital,Marketing Digital,Otro' },
  { id: 'message', label: 'Cuéntanos tu proyecto', type: 'textarea', required: true,  placeholder: 'Describe brevemente qué necesitas...' },
]

// ─── EmailJS via REST API — sin dependencia npm ───────────────────────
async function sendViaEmailJS(serviceId, templateId, publicKey, templateParams) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      serviceId,
      template_id:     templateId,
      user_id:         publicKey,
      template_params: templateParams,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `EmailJS HTTP ${res.status}`)
  }
}

// ─── Componente principal ─────────────────────────────────────────────
export default function ContactSection({ contact, footer, brand }) {
  const primary = brand?.primary || '#ff3c3c'

  const title    = contact?.title    || '¿Listo para el siguiente nivel?'
  const subtitle = contact?.subtitle || 'Cuéntanos tu proyecto. Si buscas lo ordinario, no somos tu agencia.'
  const ctaLabel = contact?.ctaLabel || 'ENVIAR MENSAJE'

  const successTitle   = contact?.successTitle   || '¡Mensaje enviado!'
  const successMessage = contact?.successMessage || 'Nos pondremos en contacto contigo en menos de 24 horas.'

  const serviceId  = contact?.emailjsServiceId  || ''
  const templateId = contact?.emailjsTemplateId || ''
  const publicKey  = contact?.emailjsPublicKey  || ''
  const hasEmailJS = !!(serviceId && templateId && publicKey)

  const fields = parseFields(contact?.fields).length > 0
    ? parseFields(contact?.fields)
    : DEFAULT_FIELDS

  const [values,   setValues]   = useState(() =>
    Object.fromEntries(fields.map(f => [f.id, '']))
  )
  const [errors,   setErrors]   = useState({})
  const [sending,  setSending]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [apiError, setApiError] = useState('')
  const formRef = useRef(null)

  const setValue = (id, val) => {
    setValues(p => ({ ...p, [id]: val }))
    if (errors[id]) setErrors(p => ({ ...p, [id]: '' }))
  }

  const validate = () => {
    const next = {}
    fields.forEach(f => {
      if (f.required && !values[f.id]?.trim()) {
        next[f.id] = `${f.label} es obligatorio`
      }
      if (f.type === 'email' && values[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
        next[f.id] = 'Email inválido'
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSending(true)
    setApiError('')
    try {
      if (hasEmailJS) {
        await sendViaEmailJS(serviceId, templateId, publicKey, values)
      } else {
        await new Promise(r => setTimeout(r, 800))
      }
      setSuccess(true)
    } catch {
      setApiError('Hubo un error al enviar. Por favor intenta de nuevo o contáctanos por WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setValues(Object.fromEntries(fields.map(f => [f.id, ''])))
    setErrors({})
    setApiError('')
  }

  return (
    <section id="contacto" style={{
      padding: '100px 6%',
      background: `radial-gradient(ellipse at 50% 0%, ${primary}08 0%, transparent 60%)`,
    }}>
      <style>{`
        .ct-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 13px 16px;
          border-radius: 10px;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ct-input:focus { border-color: ${primary}; background: rgba(255,255,255,0.06); }
        .ct-input::placeholder { color: rgba(255,255,255,0.25); }
        .ct-input.ct-err { border-color: rgba(255,80,80,0.6); }
        .ct-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 13px 16px;
          border-radius: 10px;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          resize: vertical;
          min-height: 110px;
          box-sizing: border-box;
        }
        .ct-textarea:focus { border-color: ${primary}; background: rgba(255,255,255,0.06); }
        .ct-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .ct-textarea.ct-err { border-color: rgba(255,80,80,0.6); }
        .ct-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 13px 16px;
          border-radius: 10px;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          box-sizing: border-box;
        }
        .ct-select:focus { border-color: ${primary}; }
        .ct-select option { background: #111; color: white; }
        .ct-select.ct-err { border-color: rgba(255,80,80,0.6); }
        @keyframes ctIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ctCheck {
          from { stroke-dashoffset: 60; opacity: 0; }
          to   { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes ctSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{
            color: primary, fontSize: '0.75rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14,
          }}>Hablemos</p>
          <h2 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            {title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            {subtitle}
          </p>
        </div>

        {/* ── Éxito ── */}
        {success ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${primary}40`,
            borderRadius: 20, padding: '60px 40px', textAlign: 'center',
            animation: 'ctIn 0.5s cubic-bezier(0.23,1,0.32,1) both',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `${primary}15`, border: `2px solid ${primary}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px', boxShadow: `0 0 40px ${primary}25`,
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18L15 25L28 11" stroke={primary} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="60"
                  style={{ animation: 'ctCheck 0.5s 0.2s cubic-bezier(0.23,1,0.32,1) both' }} />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, color: 'white' }}>
              {successTitle}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 32px' }}>
              {successMessage}
            </p>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 24px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          /* ── Formulario ── */
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 48px)',
          }}>
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {fields.map(field => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id] || ''}
                    error={errors[field.id] || ''}
                    onChange={val => setValue(field.id, val)}
                    primary={primary}
                  />
                ))}
              </div>

              {apiError && (
                <div style={{
                  marginTop: 16,
                  background: 'rgba(255,60,60,0.08)',
                  border: '1px solid rgba(255,60,60,0.25)',
                  borderRadius: 8, padding: '12px 16px',
                  color: 'rgba(255,130,130,0.9)', fontSize: 13, lineHeight: 1.5,
                }}>
                  {apiError}
                </div>
              )}

              <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    flex: 1, minWidth: 180,
                    padding: '16px 32px',
                    background: sending ? `${primary}80` : primary,
                    color: 'white', border: 'none', borderRadius: 10,
                    fontWeight: 800, fontSize: '0.9rem',
                    letterSpacing: 1.5, textTransform: 'uppercase',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: sending ? 'none' : `0 0 30px ${primary}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!sending) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 12px 40px ${primary}55`
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = sending ? 'none' : `0 0 30px ${primary}35`
                  }}
                >
                  {sending ? (
                    <>
                      <span style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'ctSpin 0.7s linear infinite',
                      }} />
                      Enviando…
                    </>
                  ) : ctaLabel}
                </button>

                {footer?.whatsapp && footer.whatsapp !== '#' && (
                  <a
                    href={footer.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '16px 24px',
                      background: 'transparent', color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                      textDecoration: 'none', fontWeight: 700, fontSize: 13,
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>

              <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                Tu información es privada y nunca será compartida con terceros.
              </p>
            </form>
          </div>
        )}

        {footer?.email && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
              o escríbenos directamente a{' '}
            </span>
            <a href={`mailto:${footer.email}`} style={{ color: primary, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              {footer.email}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Renderizador de campo ────────────────────────────────────────────
function FieldRenderer({ field, value, error, onChange, primary }) {
  const errClass = error ? ' ct-err' : ''

  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: error ? 'rgba(255,130,130,0.8)' : 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7,
      }}>
        {field.label}
        {field.required && <span style={{ color: primary, marginLeft: 4 }}>*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className={`ct-textarea${errClass}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
          rows={4}
        />
      ) : field.type === 'select' ? (
        <select
          className={`ct-select${errClass}`}
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">Seleccionar…</option>
          {(field.options || '').split(',').map(o => o.trim()).filter(Boolean).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          className={`ct-input${errClass}`}
          type={field.type || 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
        />
      )}

      {error && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>
          {error}
        </p>
      )}
    </div>
  )
}