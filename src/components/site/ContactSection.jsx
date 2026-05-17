/**
 * ContactSection.jsx — PhoneInput + 100% responsivo + traducción editorial
 */

import { useState } from 'react'
import { processNewLead } from '../../lib/leadHelpers'
import { useUIStrings } from '../../hooks/useUIStrings'
import { useTranslatedContent } from '../../hooks/useTranslatedContent'
import PhoneInput from '../common/PhoneInput'

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
  company:  { it:'Azienda / Progetto',    en:'Company / Project',     es:'Empresa / Proyecto',   fr:'Entreprise / Projet',   de:'Unternehmen / Projekt',   pt:'Empresa / Proyecto'   },
  azienda:  { it:'Azienda / Progetto',    en:'Company / Project',     es:'Empresa / Proyecto',   fr:'Entreprise / Projet',   de:'Unternehmen / Projekt',   pt:'Empresa / Projeto'    },
  service:  { it:'Servizio di interesse', en:'Service of interest',   es:'Servicio de interés',  fr:'Service souhaité',      de:'Gewünschter Service',     pt:'Serviço de interesse' },
  servizio: { it:'Servizio di interesse', en:'Service of interest',   es:'Servicio de interés',  fr:'Service souhaité',      de:'Gewünschter Service',     pt:'Serviço de interesse' },
  message:  { it:'Descrivi il progetto',  en:'Describe your project', es:'Describe tu proyecto', fr:'Décrivez votre projet', de:'Ihr Projekt beschreiben', pt:'Descreva seu projeto' },
  messaggio:{ it:'Descrivi il progetto',  en:'Describe your project', es:'Describe tu proyecto', fr:'Décrivez votre projet', de:'Ihr Projekt beschreiben', pt:'Descreva seu projeto' },
  notes:    { it:'Note',                  en:'Notes',                 es:'Notas',                fr:'Notes',                 de:'Anmerkungen',             pt:'Notas'                },
}

const PLACEHOLDERS = {
  name:    { it:'Mario Rossi',               en:'John Smith',               es:'Juan García',               fr:'Jean Dupont',            de:'Max Mustermann',           pt:'João Silva'           },
  email:   { it:'mario@email.com',           en:'john@email.com',           es:'juan@email.com',            fr:'jean@email.com',         de:'max@email.com',            pt:'joao@email.com'       },
  zona:    { it:'Es: Milano, Roma...',        en:'E.g: New York, London...', es:'Ej: Madrid, Barcelona...',  fr:'Ex: Paris, Lyon...',     de:'z.B: Berlin, München...', pt:'Ex: Lisboa, Porto...' },
  message: { it:'Raccontaci cosa cerchi...', en:'Tell us what you need...', es:'Cuéntanos qué necesitas...', fr:'Dites-nous ce dont vous avez besoin...', de:'Erzählen Sie was Sie brauchen...', pt:'Diga-nos o que precisa...' },
}

const SERVICE_OPTIONS = {
  it: ['Sito Web', 'E-commerce', 'Branding', 'Marketing', 'Altro'],
  en: ['Website', 'E-commerce', 'Branding', 'Marketing', 'Other'],
  es: ['Diseño Web', 'E-commerce', 'Branding', 'Marketing', 'Otro'],
  fr: ['Site Web', 'E-commerce', 'Branding', 'Marketing', 'Autre'],
  de: ['Webseite', 'E-commerce', 'Branding', 'Marketing', 'Andere'],
  pt: ['Site Web', 'E-commerce', 'Branding', 'Marketing', 'Outro'],
}

function rl(dict, lang) { return dict?.[lang] || dict?.['en'] || '' }

function translateField(field, lang) {
  const id = field.id?.toLowerCase()
  return {
    ...field,
    label:       rl(FIELD_TRANSLATIONS[id], lang) || field.label,
    placeholder: rl(PLACEHOLDERS[id], lang) || field.placeholder || '',
  }
}

function isPhoneField(field) {
  return ['phone', 'telefono', 'tel'].includes(field.id?.toLowerCase()) || field.type === 'tel'
}

export default function ContactSection({ contact, footer, brand, site }) {
  const primary = brand?.primary || '#ff3c3c'
  const t = useUIStrings(brand)

  const lang = brand?.language
    || (typeof window !== 'undefined' ? window.__SITE_LANGUAGE__ : null)
    || 'it'

  const translatedContact = useTranslatedContent(
    {
      title:    contact?.title    || t.contact.eyebrow,
      subtitle: contact?.subtitle || '',
      ctaLabel: contact?.ctaLabel || t.contact.sendBtn,
    },
    brand
  )

  const rawFields = parseFields(contact?.fields)
  const fields = (rawFields.length > 0 ? rawFields : [
    { id: 'name',    label: 'Name',    type: 'text',     required: true  },
    { id: 'email',   label: 'Email',   type: 'email',    required: true  },
    { id: 'phone',   label: 'Phone',   type: 'tel',      required: true  },
    { id: 'zona',    label: 'Zone',    type: 'text',     required: true  },
    { id: 'company', label: 'Company', type: 'text',     required: false },
    { id: 'service', label: 'Service', type: 'select',   required: false },
    { id: 'message', label: 'Message', type: 'textarea', required: false },
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
      if (isPhoneField(f) && f.required && values[f.id] && values[f.id].replace(/\D/g, '').length < 7) {
        next[f.id] = t.contact.fieldRequired
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
      const phoneField = fields.find(f => isPhoneField(f))
      const leadData = {
        name:     values.name     || values.nome     || '',
        email:    values.email    || '',
        phone:    phoneField ? values[phoneField.id] : (values.phone || values.telefono || ''),
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

  const serviceOptions = SERVICE_OPTIONS[lang] || SERVICE_OPTIONS['en']

  return (
    <section id="contacto" style={{ padding: 'clamp(60px,10vw,100px) clamp(16px,6%,80px)', background: `radial-gradient(ellipse at 50% 0%, ${primary}08 0%, transparent 60%)` }}>
      <style>{`
        .ct-input,.ct-textarea,.ct-select{
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);
          color:var(--text-main);padding:13px 16px;border-radius:10px;
          width:100%;font-size:14px;font-family:inherit;outline:none;
          transition:border-color 0.2s;box-sizing:border-box;
        }
        .ct-input:focus,.ct-textarea:focus,.ct-select:focus{border-color:${primary};}
        .ct-input::placeholder,.ct-textarea::placeholder{color:var(--text-muted);}
        .ct-input.ct-err,.ct-textarea.ct-err,.ct-select.ct-err{border-color:rgba(255,80,80,0.6);}
        .ct-textarea{resize:vertical;min-height:110px;}
        .ct-select{
          -webkit-appearance:none;appearance:none;cursor:pointer;
          background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 7L11 1' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:right 16px center;
        }
        .ct-select option{background:#111;color:white;}
        .ct-submit-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center;}
        @keyframes ctIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ctCheck{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
        @keyframes ctSpin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .ct-submit-row{flex-direction:column;}
          .ct-submit-row a,.ct-submit-row button[type="submit"]{width:100%;justify-content:center;box-sizing:border-box;}
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
          <p style={{ color: primary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
            {t.contact.eyebrow}
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: 'var(--text-main)' }}>
            {translatedContact.title}
          </h2>
          {translatedContact.subtitle && (
            <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(14px,2vw,16px)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              {translatedContact.subtitle}
            </p>
          )}
        </div>

        {success ? (
          <div style={{ borderRadius: 20, padding: 'clamp(28px,5vw,56px)', textAlign: 'center', animation: 'ctIn 0.5s cubic-bezier(0.23,1,0.32,1) both', background: `${primary}08`, border: `1px solid ${primary}30` }}>

            {/* Icono animado */}
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: `${primary}15`, border: `2px solid ${primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: `0 0 40px ${primary}20` }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke={primary} strokeWidth="1.5" strokeOpacity="0.3"/>
                <path d="M10 20L17 27L30 13" stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" style={{ animation: 'ctCheck 0.6s 0.15s cubic-bezier(0.23,1,0.32,1) both' }} />
              </svg>
            </div>

            {/* Título */}
            <h3 style={{ fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 800, marginBottom: 10, color: 'var(--text-main)' }}>
              {t.contact.successTitle}
            </h3>

            {/* Mensaje */}
            <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(13px,2vw,15px)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
              {agentMsg || t.contact.successMessage}
            </p>

            {/* Separador con color primario */}
            <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${primary}, transparent)`, margin: '0 auto 24px' }} />

            {/* Botón enviar otro */}
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                color: primary,
                border: `1px solid ${primary}50`,
                padding: '11px 28px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'inherit',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${primary}15`; e.currentTarget.style.borderColor = primary }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${primary}50` }}
            >
              {t.contact.sendAnother}
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 'clamp(20px,5vw,48px)' }}>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {fields.map(field => {
                  const err = errors[field.id] || ''
                  const ec  = err ? ' ct-err' : ''
                  const isService = ['service','servizio'].includes(field.id?.toLowerCase())
                  const isPhone   = isPhoneField(field)

                  return (
                    <div key={field.id}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: err ? 'rgba(255,130,130,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                        {field.label}
                        {field.required && <span style={{ color: primary, marginLeft: 4 }}>*</span>}
                      </label>

                      {isPhone ? (
                        <PhoneInput
                          value={values[field.id] || ''}
                          onChange={val => setValue(field.id, val)}
                          error={err}
                          primary={primary}
                        />
                      ) : field.type === 'textarea' ? (
                        <>
                          <textarea className={`ct-textarea${ec}`} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || ''} rows={4} />
                          {err && <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{err}</p>}
                        </>
                      ) : field.type === 'select' ? (
                        <>
                          <select className={`ct-select${ec}`} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)}>
                            <option value="">{t.contact.selectOpt}</option>
                            {isService
                              ? serviceOptions.map(o => <option key={o} value={o}>{o}</option>)
                              : (field.options || '').split(',').map(o => o.trim()).filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)
                            }
                          </select>
                          {err && <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{err}</p>}
                        </>
                      ) : (
                        <>
                          <input className={`ct-input${ec}`} type={field.type || 'text'} value={values[field.id] || ''} onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || ''} />
                          {err && <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{err}</p>}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {apiErr && (
                <div style={{ marginTop: 16, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 8, padding: '12px 16px', color: 'rgba(255,130,130,0.9)', fontSize: 13 }}>
                  {apiErr}
                </div>
              )}

              <div className="ct-submit-row" style={{ marginTop: 28 }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{ flex: 1, minWidth: 160, padding: '16px 32px', background: sending ? `${primary}80` : primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: sending ? 'none' : `0 0 30px ${primary}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit' }}
                >
                  {sending ? (
                    <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'ctSpin 0.7s linear infinite' }} />{t.contact.sending}</>
                  ) : translatedContact.ctaLabel}
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