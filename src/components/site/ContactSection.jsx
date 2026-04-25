/**
 * ContactSection.jsx — AGGIORNATO con sistema lead completo
 * ─────────────────────────────────────────────────────────────────────────
 * Novità rispetto alla versione precedente:
 *  1. Integra processNewLead() → salva su Firestore + invia tutte le notifiche
 *  2. Campo "zona/città" obbligatorio per l'assegnazione automatica agente
 *  3. Schermata di conferma professionale con messaggio dinamico configurabile
 *  4. Fallback graceful se Firestore non disponibile
 */

import { useState, useRef } from 'react'
import { processNewLead } from '../../lib/leadHelpers'

function parseFields(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// Campi default con campo zona incluso
const DEFAULT_FIELDS = [
  { id: 'name',     label: 'Nome e Cognome',       type: 'text',     required: true,  placeholder: 'Mario Rossi' },
  { id: 'email',    label: 'Email',                 type: 'email',    required: true,  placeholder: 'mario@email.com' },
  { id: 'phone',    label: 'Telefono',              type: 'tel',      required: true,  placeholder: '+39 333 1234567' },
  { id: 'zona',     label: 'Città / Zona',          type: 'text',     required: true,  placeholder: 'Es: Milano, Roma, Napoli...' },
  { id: 'servizio', label: 'Servizio di interesse', type: 'select',   required: false, options: 'Sito Web,E-commerce,Branding,Marketing,Altro' },
  { id: 'message',  label: 'Descrivi il tuo progetto', type: 'textarea', required: false, placeholder: 'Raccontaci cosa stai cercando...' },
]

export default function ContactSection({ contact, footer, brand, site }) {
  const primary = brand?.primary || '#ff3c3c'

  const title    = contact?.title    || 'Hai un progetto in mente?'
  const subtitle = contact?.subtitle || 'Raccontaci di cosa hai bisogno. Un nostro consulente ti contatterà al più presto.'
  const ctaLabel = contact?.ctaLabel || 'INVIA RICHIESTA'

  const successTitle   = contact?.successTitle   || 'Richiesta ricevuta!'
  const successMessage = contact?.successMessage
    || 'Un agente commerciale vicino alla tua zona ti contatterà entro 24 ore.'

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
  const [agentMsg, setAgentMsg] = useState('')

  const setValue = (id, val) => {
    setValues(p => ({ ...p, [id]: val }))
    if (errors[id]) setErrors(p => ({ ...p, [id]: '' }))
  }

  const validate = () => {
    const next = {}
    fields.forEach(f => {
      if (f.required && !values[f.id]?.trim()) {
        next[f.id] = 'Campo obbligatorio'
      }
      if (f.type === 'email' && values[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
        next[f.id] = 'Email non valida'
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
      // Mappa i campi del form al formato lead standard
      const leadData = {
        name:     values.name    || values.nome    || '',
        email:    values.email   || '',
        phone:    values.phone   || values.telefono || values.tel || '',
        zona:     values.zona    || values.city     || values.citta || '',
        servizio: values.servizio || values.service  || '',
        message:  values.message  || values.messaggio || values.notes || '',
        // Tutti i campi raw per completezza
        rawFields: { ...values },
      }

      const results = await processNewLead(leadData, site)

      // Messaggio personalizzato se abbiamo trovato un agente
      if (results.agente) {
        setAgentMsg(
          `Il nostro consulente ${results.agente.nome} — esperto della zona di ${leadData.zona} — ti contatterà a breve.`
        )
      }

      setSuccess(true)
    } catch (err) {
      console.error('[ContactSection]', err)
      setApiError('Si è verificato un errore. Prova a contattarci direttamente via WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setAgentMsg('')
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
          color: white; padding: 13px 16px; border-radius: 10px;
          width: 100%; font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ct-input:focus { border-color: ${primary}; background: rgba(255,255,255,0.06); }
        .ct-input::placeholder { color: rgba(255,255,255,0.25); }
        .ct-input.ct-err { border-color: rgba(255,80,80,0.6); }
        .ct-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 13px 16px; border-radius: 10px;
          width: 100%; font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
          resize: vertical; min-height: 110px; box-sizing: border-box;
        }
        .ct-textarea:focus { border-color: ${primary}; }
        .ct-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .ct-textarea.ct-err { border-color: rgba(255,80,80,0.6); }
        .ct-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 13px 16px; border-radius: 10px;
          width: 100%; font-size: 14px; font-family: inherit;
          outline: none; cursor: pointer;
          -webkit-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 7L11 1' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 16px center;
          box-sizing: border-box;
        }
        .ct-select:focus { border-color: ${primary}; }
        .ct-select option { background: #111; color: white; }
        .ct-select.ct-err { border-color: rgba(255,80,80,0.6); }
        @keyframes ctIn { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes ctCheck { from { stroke-dashoffset:60; } to { stroke-dashoffset:0; } }
        @keyframes ctSpin { to { transform:rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
            Contattaci
          </p>
          <h2 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            {title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            {subtitle}
          </p>
        </div>

        {/* Schermata successo */}
        {success ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${primary}40`,
            borderRadius: 20, padding: 'clamp(32px,5vw,56px)',
            textAlign: 'center',
            animation: 'ctIn 0.5s cubic-bezier(0.23,1,0.32,1) both',
          }}>
            {/* Checkmark */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `${primary}15`, border: `2px solid ${primary}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px', boxShadow: `0 0 40px ${primary}20`,
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18L15 25L28 11" stroke={primary} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="60"
                  style={{ animation: 'ctCheck 0.5s 0.2s cubic-bezier(0.23,1,0.32,1) both' }} />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
              {successTitle}
            </h3>

            {/* Messaggio agente personalizzato */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '16px 20px',
              margin: '20px auto', maxWidth: 440,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                {agentMsg || successMessage}
              </p>
            </div>

            {/* Step informativi */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 24,
              margin: '24px 0 32px', flexWrap: 'wrap',
            }}>
              {[
                { step: '1', label: 'Richiesta ricevuta' },
                { step: '2', label: 'Agente assegnato' },
                { step: '3', label: 'Ti contatta entro 24h' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i === 0 ? primary : `${primary}20`,
                    color: i === 0 ? 'white' : `${primary}80`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, margin: '0 auto 6px',
                  }}>
                    {i === 0 ? '✓' : s.step}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 24px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              Invia un'altra richiesta
            </button>
          </div>
        ) : (
          /* Form */
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 48px)',
          }}>
            <form onSubmit={handleSubmit} noValidate>
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
                  marginTop: 16, background: 'rgba(255,60,60,0.08)',
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
                      Invio in corso...
                    </>
                  ) : ctaLabel}
                </button>

                {footer?.whatsapp && footer.whatsapp !== '#' && (
                  <a
                    href={footer.whatsapp}
                    target="_blank" rel="noreferrer"
                    style={{
                      padding: '16px 24px', background: 'transparent',
                      color: 'rgba(255,255,255,0.5)',
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
                I tuoi dati sono protetti e non verranno ceduti a terzi. Risponderemo entro 24 ore.
              </p>
            </form>
          </div>
        )}

        {footer?.email && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>oppure scrivici a </span>
            <a href={`mailto:${footer.email}`} style={{ color: primary, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              {footer.email}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

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
        <textarea className={`ct-textarea${errClass}`} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ''} rows={4} />
      ) : field.type === 'select' ? (
        <select className={`ct-select${errClass}`} value={value}
          onChange={e => onChange(e.target.value)}>
          <option value="">Seleziona...</option>
          {(field.options || '').split(',').map(o => o.trim()).filter(Boolean).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input className={`ct-input${errClass}`}
          type={field.type || 'text'} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ''} />
      )}

      {error && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{error}</p>
      )}
    </div>
  )
}