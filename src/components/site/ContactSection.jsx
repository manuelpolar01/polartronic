import { useState } from 'react'
import { processNewLead } from '../../lib/leadHelpers'
import { useUIStrings } from '../../hooks/useUIStrings'

function parseFields(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

const FIELD_TRANSLATIONS = {
  name:     { it:'Nome e Cognome',        en:'Full Name',             es:'Nombre completo',      fr:'Nom complet',           de:'Vollständiger Name',      pt:'Nome completo'        },
  nome:     { it:'Nome e Cognome',        en:'Full Name',             es:'Nombre completo',      fr:'Nom complet',           de:'Vollständiger Name',      pt:'Nome completo'        },
  email:    { it:'Email',                 en:'Email',                 es:'Email',                fr:'E-mail',                de:'E-Mail',                  pt:'E-mail'               },
  phone:    { it:'Telefono',              en:'Phone',                 es:'Teléfono',             fr:'Téléphone',             de:'Telefon',                 pt:'Telefone'             },
  telefono: { it:'Telefono',              en:'Phone',                 es:'Teléfono',             fr:'Téléphone',             de:'Telefon',                 pt:'Telefone'             },
  zona:     { it:'Città / Zona',          en:'City / Area',           es:'Ciudad / Zona',        fr:'Ville / Zone',          de:'Stadt / Gebiet',          pt:'Cidade / Zona'        },
  city:     { it:'Città / Zona',          en:'City / Area',           es:'Ciudad / Zona',        fr:'Ville / Zone',          de:'Stadt / Gebiet',          pt:'Cidade / Zona'        },
  company:  { it:'Azienda / Progetto',    en:'Company / Project',     es:'Empresa / Proyecto',   fr:'Entreprise / Projet',   de:'Unternehmen / Projekt',   pt:'Empresa / Projeto'    },
  azienda:  { it:'Azienda / Progetto',    en:'Company / Project',     es:'Empresa / Proyecto',   fr:'Entreprise / Projet',   de:'Unternehmen / Projekt',   pt:'Empresa / Projeto'    },
  service:  { it:'Servizio di interesse', en:'Service of interest',   es:'Servicio de interés',  fr:'Service souhaité',      de:'Gewünschter Service',     pt:'Serviço de interesse' },
  servizio: { it:'Servizio di interesse', en:'Service of interest',   es:'Servicio de interés',  fr:'Service souhaité',      de:'Gewünschter Service',     pt:'Serviço de interesse' },
  message:  { it:'Descrivi il progetto',  en:'Describe your project', es:'Describe tu proyecto', fr:'Décrivez votre projet', de:'Ihr Projekt beschreiben', pt:'Descreva seu projeto' },
  messaggio:{ it:'Descrivi il progetto',  en:'Describe your project', es:'Describe tu proyecto', fr:'Décrivez votre projet', de:'Ihr Projekt beschreiben', pt:'Descreva seu projeto' },
  notes:    { it:'Note',                  en:'Notes',                 es:'Notas',                fr:'Notes',                 de:'Anmerkungen',             pt:'Notas'                },
}

const PLACEHOLDERS = {
  name:    { it:'Mario Rossi',         en:'John Smith',               es:'Juan García',              fr:'Jean Dupont',           de:'Max Mustermann',          pt:'João Silva'           },
  email:   { it:'mario@email.com',     en:'john@email.com',           es:'juan@email.com',           fr:'jean@email.com',        de:'max@email.com',           pt:'joao@email.com'       },
  phone:   { it:'+39 333 1234567',     en:'+1 555 123 4567',          es:'+34 600 123 456',          fr:'+33 6 12 34 56 78',     de:'+49 151 12345678',        pt:'+351 912 345 678'     },
  zona:    { it:'Es: Milano, Roma...',  en:'E.g: New York, London...',es:'Ej: Madrid, Barcelona...', fr:'Ex: Paris, Lyon...',    de:'z.B: Berlin, München...', pt:'Ex: Lisboa, Porto...' },
  message: { it:'Raccontaci cosa cerchi...', en:'Tell us what you need...', es:'Cuéntanos qué necesitas...', fr:'Dites-nous ce dont vous avez besoin...', de:'Erzählen Sie was Sie brauchen...', pt:'Diga-nos o que precisa...' },
}

// Traducción de opciones del select de servicio
const SERVICE_OPTIONS = {
  it: ['Sito Web', 'E-commerce', 'Branding', 'Marketing', 'Altro'],
  en: ['Website', 'E-commerce', 'Branding', 'Marketing', 'Other'],
  es: ['Diseño Web', 'E-commerce', 'Branding', 'Marketing', 'Otro'],
  fr: ['Site Web', 'E-commerce', 'Branding', 'Marketing', 'Autre'],
  de: ['Webseite', 'E-commerce', 'Branding', 'Marketing', 'Andere'],
  pt: ['Site Web', 'E-commerce', 'Branding', 'Marketing', 'Outro'],
}

// Traducción del botón enviar
const SEND_BTN = {
  it: 'INVIA MESSAGGIO',
  en: 'SEND MESSAGE',
  es: 'ENVIAR MENSAJE',
  fr: 'ENVOYER',
  de: 'SENDEN',
  pt: 'ENVIAR MENSAGEM',
}

function rl(dict, lang) {
  return dict?.[lang] || dict?.['en'] || ''
}

function translateField(field, lang) {
  const id = field.id?.toLowerCase()
  return {
    ...field,
    label:       rl(FIELD_TRANSLATIONS[id], lang) || field.label,
    placeholder: rl(PLACEHOLDERS[id], lang)        || field.placeholder || '',
  }
}

function resolveLang(brand) {
  if (typeof window !== 'undefined' && window.__SITE_LANGUAGE__) return window.__SITE_LANGUAGE__
  return brand?.language || 'it'
}

export default function ContactSection({ contact, footer, brand, site }) {
  const primary = brand?.primary || '#ff3c3c'
  const t       = useUIStrings(brand)
  const lang    = resolveLang(brand)

  const title        = contact?.title        || t.contact.eyebrow
  const subtitle     = contact?.subtitle     || ''
  const ctaLabel     = contact?.ctaLabel     || SEND_BTN[lang] || t.contact.sendBtn
  const successTitle = contact?.successTitle || '✓'
  const successMsg   = contact?.successMessage || ''

  const rawFields = parseFields(contact?.fields)
  const fields = (rawFields.length > 0 ? rawFields : [
    { id:'name',     label:'Name',    type:'text',     required:true  },
    { id:'email',    label:'Email',   type:'email',    required:true  },
    { id:'phone',    label:'Phone',   type:'tel',      required:true  },
    { id:'zona',     label:'Zone',    type:'text',     required:true  },
    { id:'company',  label:'Company', type:'text',     required:false },
    { id:'service',  label:'Service', type:'select',   required:false },
    { id:'message',  label:'Message', type:'textarea', required:false },
  ]).map(f => translateField(f, lang))

  const [values,   setValues]  = useState(() => Object.fromEntries(fields.map(f => [f.id, ''])))
  const [errors,   setErrors]  = useState({})
  const [sending,  setSending] = useState(false)
  const [success,  setSuccess] = useState(false)
  const [apiErr,   setApiErr]  = useState('')
  const [agentMsg, setAgentMsg]= useState('')

  const setValue = (id, val) => {
    setValues(p => ({ ...p, [id]: val }))
    if (errors[id]) setErrors(p => ({ ...p, [id]: '' }))
  }

  const validate = () => {
    const next = {}
    fields.forEach(f => {
      if (f.required && !values[f.id]?.trim()) next[f.id] = t.contact.fieldRequired
      if (f.type === 'email' && values[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
        next[f.id] = t.contact.emailInvalid
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSending(true); setApiErr('')
    try {
      const leadData = {
        name:     values.name     || values.nome     || '',
        email:    values.email    || '',
        phone:    values.phone    || values.telefono || '',
        zona:     values.zona     || values.city     || '',
        servizio: values.servizio || values.service  || '',
        message:  values.message  || values.messaggio || '',
        rawFields: { ...values },
      }
      const results = await processNewLead(leadData, site)
      if (results.agente) setAgentMsg(`${results.agente.nome} — ${leadData.zona}`)
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setApiErr(t.contact.errorRetry)
    } finally {
      setSending(false)
    }
  }

  const handleReset = () => {
    setSuccess(false); setAgentMsg('')
    setValues(Object.fromEntries(fields.map(f => [f.id, ''])))
    setErrors({}); setApiErr('')
  }

  // Opciones del select traducidas
  const serviceOptions = SERVICE_OPTIONS[lang] || SERVICE_OPTIONS['en']

  return (
    <section id="contacto" style={{ padding: '100px 6%', background: `radial-gradient(ellipse at 50% 0%, ${primary}08 0%, transparent 60%)` }}>
      <style>{`
        .ct-input,.ct-textarea,.ct-select{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);color:var(--text-main);padding:13px 16px;border-radius:10px;width:100%;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box;}
        .ct-input:focus,.ct-textarea:focus,.ct-select:focus{border-color:${primary};}
        .ct-input::placeholder,.ct-textarea::placeholder{color:var(--text-muted);}
        .ct-input.ct-err,.ct-textarea.ct-err,.ct-select.ct-err{border-color:rgba(255,80,80,0.6);}
        .ct-textarea{resize:vertical;min-height:110px;}
        .ct-select{-webkit-appearance:none;appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 7L11 1' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;}
        .ct-select option{background:#111;color:white;}
        @keyframes ctIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ctCheck{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
        @keyframes ctSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
            {t.contact.eyebrow}
          </p>
          <h2 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: 'var(--text-main)' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--text-dim)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              {subtitle}
            </p>
          )}
        </div>

        {success ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${primary}40`, borderRadius: 20, padding: 'clamp(32px,5vw,56px)', textAlign: 'center', animation: 'ctIn 0.5s cubic-bezier(0.23,1,0.32,1) both' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${primary}15`, border: `2px solid ${primary}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18L15 25L28 11" stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" style={{ animation: 'ctCheck 0.5s 0.2s cubic-bezier(0.23,1,0.32,1) both' }} />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{successTitle}</h3>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', margin: '20px auto', maxWidth: 440 }}>
              <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{agentMsg || successMsg}</p>
            </div>
            <button onClick={handleReset} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', marginTop: 12 }}>
              {t.contact.sendAnother}
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 'clamp(24px,5vw,48px)' }}>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {fields.map(field => {
                  const err = errors[field.id] || ''
                  const ec  = err ? ' ct-err' : ''
                  const isService = ['service','servizio'].includes(field.id?.toLowerCase())
                  return (
                    <div key={field.id}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: err ? 'rgba(255,130,130,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                        {field.label}
                        {field.required && <span style={{ color: primary, marginLeft: 4 }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea className={`ct-textarea${ec}`} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || ''} rows={4} />
                      ) : field.type === 'select' ? (
                        <select className={`ct-select${ec}`} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)}>
                          <option value="">{t.contact.selectOpt}</option>
                          {/* Si es el campo service/servizio, usa opciones traducidas; si no, usa las del campo */}
                          {isService
                            ? serviceOptions.map(o => <option key={o} value={o}>{o}</option>)
                            : (field.options || '').split(',').map(o => o.trim()).filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)
                          }
                        </select>
                      ) : (
                        <input className={`ct-input${ec}`} type={field.type || 'text'} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || ''} />
                      )}
                      {err && <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{err}</p>}
                    </div>
                  )
                })}
              </div>

              {apiErr && (
                <div style={{ marginTop: 16, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 8, padding: '12px 16px', color: 'rgba(255,130,130,0.9)', fontSize: 13 }}>
                  {apiErr}
                </div>
              )}

              <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="submit" disabled={sending} style={{ flex: 1, minWidth: 180, padding: '16px 32px', background: sending ? `${primary}80` : primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: sending ? 'none' : `0 0 30px ${primary}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit' }}>
                  {sending ? (
                    <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'ctSpin 0.7s linear infinite' }} />{t.contact.sending}</>
                  ) : ctaLabel}
                </button>
                {footer?.whatsapp && footer.whatsapp !== '#' && (
                  <a href={footer.whatsapp} target="_blank" rel="noreferrer"
                    style={{ padding: '16px 24px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                    💬 {t.contact.whatsappBtn}
                  </a>
                )}
              </div>
              <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.contact.privacy}</p>
            </form>
          </div>
        )}

        {footer?.email && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.contact.orEmail} </span>
            <a href={`mailto:${footer.email}`} style={{ color: primary, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>{footer.email}</a>
          </div>
        )}
      </div>
    </section>
  )
}