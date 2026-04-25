/**
 * NotificationsTab.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Configurazione completa di tutti i canali di notifica dal pannello admin:
 *  - EmailJS (email conferma al cliente + alert interno)
 *  - CallMeBot WhatsApp (gratuito, per agenti)
 *  - Twilio SMS (opzionale)
 *  - Template messaggi con variabili dinamiche
 */

import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

const DEFAULT_TEMPLATES = {
  emailCliente: `Ciao {{nome}},

grazie per averci contattato!

Abbiamo ricevuto la tua richiesta riguardo a: {{servizio}}.

Un nostro consulente della zona di {{zona}} ti contatterà entro 24 ore al numero {{telefono}}.

Nel frattempo, puoi rispondere a questa email per qualsiasi domanda.

A presto,
Il team {{nomeSito}}`,

  whatsappAgente: `🔔 *Nuovo lead — {{nomeSito}}*

👤 *Nome:* {{nome}}
📍 *Zona:* {{zona}}
🛠 *Servizio:* {{servizio}}
📞 *Telefono:* {{telefono}}
✉️ *Email:* {{email}}

💬 *Messaggio:*
{{messaggio}}

📅 Ricevuto: {{data}}

Rispondi direttamente a questo numero oppure via email.`,

  smsAdmin: `Nuovo lead da {{nome}} — Zona: {{zona}} — Tel: {{telefono}} — {{servizio}}`,
}

const VARIABILI = ['{{nome}}', '{{email}}', '{{telefono}}', '{{zona}}', '{{servizio}}', '{{messaggio}}', '{{data}}', '{{nomeSito}}']

export default function NotificationsTab({ data }) {
  const { site, setSite } = data

  const notif = site?.notifications || {}

  const [config, setConfig] = useState({
    emailjs: {
      serviceId:   notif.emailjs?.serviceId   || '',
      templateIdCliente:  notif.emailjs?.templateIdCliente  || '',
      templateIdInterno:  notif.emailjs?.templateIdInterno  || '',
      publicKey:   notif.emailjs?.publicKey   || '',
      attivo:      notif.emailjs?.attivo      ?? false,
    },
    whatsapp: {
      apiKey:      notif.whatsapp?.apiKey     || '',
      number:      notif.whatsapp?.number     || '',
      attivo:      notif.whatsapp?.attivo     ?? false,
    },
    sms: {
      accountSid:  notif.sms?.accountSid      || '',
      authToken:   notif.sms?.authToken       || '',
      fromNumber:  notif.sms?.fromNumber      || '',
      toNumber:    notif.sms?.toNumber        || '',
      attivo:      notif.sms?.attivo          ?? false,
    },
    templates: {
      emailCliente:    notif.templates?.emailCliente    || DEFAULT_TEMPLATES.emailCliente,
      whatsappAgente:  notif.templates?.whatsappAgente  || DEFAULT_TEMPLATES.whatsappAgente,
      smsAdmin:        notif.templates?.smsAdmin        || DEFAULT_TEMPLATES.smsAdmin,
    },
    notificaAdmin: notif.notificaAdmin || '',
  })

  const [tab,    setTab]    = useState('emailjs')
  const [saving, setSaving] = useState(false)

  const setEmailjs  = (k, v) => setConfig(p => ({ ...p, emailjs:   { ...p.emailjs,   [k]: v } }))
  const setWhatsapp = (k, v) => setConfig(p => ({ ...p, whatsapp:  { ...p.whatsapp,  [k]: v } }))
  const setSms      = (k, v) => setConfig(p => ({ ...p, sms:       { ...p.sms,       [k]: v } }))
  const setTemplate = (k, v) => setConfig(p => ({ ...p, templates: { ...p.templates, [k]: v } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteConfig({ notifications: config })
      setSite(prev => ({ ...prev, notifications: config }))
      toast.success('Configurazione notifiche salvata ✓')
    } catch (err) {
      console.error(err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (id) => ({
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
    background: tab === id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color:      tab === id ? 'white' : 'rgba(255,255,255,0.5)',
  })

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{description}</div>}
      </div>
      <label style={{ cursor: 'pointer', userSelect: 'none' }}>
        <div style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: checked ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
          }} />
          <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
        </div>
      </label>
    </div>
  )

  const VarBadges = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
      {VARIABILI.map(v => (
        <span key={v} style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 4,
          background: 'rgba(127,119,221,0.12)', color: '#AFA9EC',
          fontFamily: 'monospace', cursor: 'default',
        }} title="Copia questa variabile nel template">
          {v}
        </span>
      ))}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
          🔔 Notifiche & Canali
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          Configura come e dove ricevere i lead. Puoi attivare più canali contemporaneamente.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabStyle('emailjs')}   onClick={() => setTab('emailjs')}>✉️ Email</button>
        <button style={tabStyle('whatsapp')}  onClick={() => setTab('whatsapp')}>💬 WhatsApp</button>
        <button style={tabStyle('sms')}       onClick={() => setTab('sms')}>📱 SMS</button>
        <button style={tabStyle('templates')} onClick={() => setTab('templates')}>📝 Messaggi</button>
      </div>

      {/* ── Tab: EmailJS ── */}
      {tab === 'emailjs' && (
        <>
          <ToggleSwitch
            checked={config.emailjs.attivo}
            onChange={v => setEmailjs('attivo', v)}
            label="Email attiva"
            description="Invia email di conferma al cliente e alert al team quando arriva un lead"
          />

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Credenziali EmailJS
            </h3>
            <div style={{
              background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.15)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 12, color: 'rgba(255,200,0,0.7)', lineHeight: 1.7,
            }}>
              Vai su <strong>emailjs.com</strong> → crea un account gratuito → aggiungi un Email Service
              (Gmail consigliato) → crea 2 template (uno per il cliente, uno per il team interno).
            </div>
            <FieldGroup label="Service ID">
              <input className="admin-input" value={config.emailjs.serviceId}
                onChange={e => setEmailjs('serviceId', e.target.value)}
                placeholder="service_xxxxxxx" />
            </FieldGroup>
            <FieldGroup label="Template ID — Email al cliente (conferma ricezione)">
              <input className="admin-input" value={config.emailjs.templateIdCliente}
                onChange={e => setEmailjs('templateIdCliente', e.target.value)}
                placeholder="template_cliente_xxx" />
            </FieldGroup>
            <FieldGroup label="Template ID — Email interna (alert al team)">
              <input className="admin-input" value={config.emailjs.templateIdInterno}
                onChange={e => setEmailjs('templateIdInterno', e.target.value)}
                placeholder="template_interno_xxx" />
            </FieldGroup>
            <FieldGroup label="Public Key">
              <input className="admin-input" value={config.emailjs.publicKey}
                onChange={e => setEmailjs('publicKey', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxx" />
            </FieldGroup>
            <FieldGroup label="Email di notifica interna (riceve l'alert di ogni nuovo lead)">
              <input className="admin-input" type="email" value={config.notificaAdmin}
                onChange={e => setConfig(p => ({ ...p, notificaAdmin: e.target.value }))}
                placeholder="admin@tuaazienda.com" />
            </FieldGroup>
          </div>
        </>
      )}

      {/* ── Tab: WhatsApp ── */}
      {tab === 'whatsapp' && (
        <>
          <ToggleSwitch
            checked={config.whatsapp.attivo}
            onChange={v => setWhatsapp('attivo', v)}
            label="WhatsApp attivo"
            description="Notifica agli agenti via WhatsApp usando CallMeBot (gratuito)"
          />

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Configurazione CallMeBot (gratuito)
            </h3>
            <div style={{
              background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.15)',
              borderRadius: 8, padding: '12px 14px', marginBottom: 16,
              fontSize: 12, color: 'rgba(37,211,102,0.8)', lineHeight: 1.8,
            }}>
              <strong>Setup CallMeBot (5 minuti, gratuito):</strong>
              <ol style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                <li>Aggiungi su WhatsApp il numero: <strong>+34 644 36 59 87</strong></li>
                <li>Invia il messaggio: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 3 }}>I allow callmebot to send me messages</code></li>
                <li>Ricevi l'API key di risposta — inseriscila qui sotto</li>
                <li>Ogni agente deve fare questo setup individualmente</li>
              </ol>
            </div>

            <div style={{
              background: 'rgba(127,119,221,0.04)', border: '1px solid rgba(127,119,221,0.15)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 12, color: 'rgba(127,119,221,0.7)', lineHeight: 1.6,
            }}>
              <strong>Alternativa professionale:</strong> Twilio WhatsApp Business API (~€0.05/msg).
              Ideale per volumi alti. Contattaci per la configurazione enterprise.
            </div>

            <FieldGroup label="Numero WhatsApp destinatario (con prefisso, senza +)">
              <input className="admin-input" value={config.whatsapp.number}
                onChange={e => setWhatsapp('number', e.target.value)}
                placeholder="39333123456" />
            </FieldGroup>
            <FieldGroup label="CallMeBot API Key">
              <input className="admin-input" value={config.whatsapp.apiKey}
                onChange={e => setWhatsapp('apiKey', e.target.value)}
                placeholder="123456" />
            </FieldGroup>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8, lineHeight: 1.6 }}>
              Nota: CallMeBot invia al numero dell'admin. Per notifiche per-agente, usa la sezione
              Agenti → ogni agente con canale WhatsApp riceve il suo alert automatico.
            </div>
          </div>
        </>
      )}

      {/* ── Tab: SMS Twilio ── */}
      {tab === 'sms' && (
        <>
          <ToggleSwitch
            checked={config.sms.attivo}
            onChange={v => setSms('attivo', v)}
            label="SMS attivo (Twilio)"
            description="Alert SMS immediato — ~€0.05 per SMS. Ottimo come backup all'email."
          />

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Credenziali Twilio
            </h3>
            <div style={{
              background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.15)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 12, color: 'rgba(255,200,0,0.7)', lineHeight: 1.7,
            }}>
              Vai su <strong>twilio.com</strong> → Console → crea un account → ottieni Account SID,
              Auth Token e un numero Twilio (da cui partono gli SMS).
              ⚠️ Le credenziali Twilio non devono mai stare nel frontend in produzione —
              usa una Firebase Cloud Function come proxy.
            </div>

            <FieldGroup label="Account SID">
              <input className="admin-input" value={config.sms.accountSid}
                onChange={e => setSms('accountSid', e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </FieldGroup>
            <FieldGroup label="Auth Token">
              <input className="admin-input" value={config.sms.authToken}
                onChange={e => setSms('authToken', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </FieldGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FieldGroup label="Numero mittente Twilio">
                <input className="admin-input" value={config.sms.fromNumber}
                  onChange={e => setSms('fromNumber', e.target.value)}
                  placeholder="+12025551234" />
              </FieldGroup>
              <FieldGroup label="Numero destinatario (tuo)">
                <input className="admin-input" value={config.sms.toNumber}
                  onChange={e => setSms('toNumber', e.target.value)}
                  placeholder="+39333123456" />
              </FieldGroup>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Template messaggi ── */}
      {tab === 'templates' && (
        <>
          <div style={{
            background: 'rgba(127,119,221,0.04)', border: '1px solid rgba(127,119,221,0.15)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            fontSize: 12, color: 'rgba(127,119,221,0.7)', lineHeight: 1.7,
          }}>
            <strong>Variabili disponibili</strong> — inseriscile nei template, vengono sostituite automaticamente:
            <div style={{ marginTop: 8 }}><VarBadges /></div>
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
              ✉️ Email di conferma al cliente
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Inviata immediatamente dopo la compilazione del form.
            </p>
            <textarea
              className="admin-textarea"
              value={config.templates.emailCliente}
              onChange={e => setTemplate('emailCliente', e.target.value)}
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
              💬 Messaggio WhatsApp all'agente
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Inviato all'agente della zona quando arriva un lead. Supporta *grassetto* e _corsivo_.
            </p>
            <textarea
              className="admin-textarea"
              value={config.templates.whatsappAgente}
              onChange={e => setTemplate('whatsappAgente', e.target.value)}
              rows={12}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
              📱 SMS all'admin (breve)
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Max 160 caratteri per evitare SMS multipli. Attualmente: {config.templates.smsAdmin.length} caratteri.
            </p>
            <input
              className="admin-input"
              value={config.templates.smsAdmin}
              onChange={e => setTemplate('smsAdmin', e.target.value)}
              maxLength={160}
            />
          </div>

          {/* Bottone reset template */}
          <button
            onClick={() => setConfig(p => ({ ...p, templates: { ...DEFAULT_TEMPLATES } }))}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.3)', padding: '8px 16px',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, marginBottom: 20,
            }}
          >
            ↺ Ripristina template predefiniti
          </button>
        </>
      )}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Salvataggio...' : '💾 SALVA CONFIGURAZIONE NOTIFICHE'}
      </button>
    </div>
  )
}