// ─────────────────────────────────────────────────────────────────────
// leadHelpers.js — ACTUALIZADO
// sendSMS ahora llama a la Cloud Function proxy, no a Twilio directo.
// Las credenciales de Twilio nunca están en el frontend.
// ─────────────────────────────────────────────────────────────────────

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '')
}

function buildVars(leadData, siteConfig) {
  return {
    nome:      leadData.name      || '',
    email:     leadData.email     || '',
    telefono:  leadData.phone     || '',
    zona:      leadData.zona      || '',
    servizio:  leadData.servizio  || '',
    messaggio: leadData.message   || '',
    data:      new Date().toLocaleDateString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    nomeSito: siteConfig?.brand?.name || 'Polartronic',
  }
}

// ── 1. Salva lead su Firestore ────────────────────────────────────────
export async function saveLead(leadData) {
  const docRef = await addDoc(collection(db, 'leads'), {
    ...leadData,
    stato:     'nuovo',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// ── 2. Email conferma al cliente via EmailJS ──────────────────────────
export async function sendEmailCliente(leadData, notifConfig, siteConfig) {
  const ejs = notifConfig?.emailjs
  if (!ejs?.attivo || !ejs.serviceId || !ejs.templateIdCliente || !ejs.publicKey) return

  const vars = buildVars(leadData, siteConfig)
  const templateParams = {
    to_email:  leadData.email,
    to_name:   leadData.name,
    message:   interpolate(notifConfig.templates?.emailCliente || '', vars),
    from_name: siteConfig?.brand?.name || 'Team',
    reply_to:  siteConfig?.footer?.email || '',
    ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v])),
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      ejs.serviceId,
      template_id:     ejs.templateIdCliente,
      user_id:         ejs.publicKey,
      template_params: templateParams,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`EmailJS cliente: ${text}`)
  }
}

// ── 3. Email alert interna al team ────────────────────────────────────
export async function sendEmailInterna(leadData, notifConfig, siteConfig) {
  const ejs = notifConfig?.emailjs
  if (!ejs?.attivo || !ejs.serviceId || !ejs.templateIdInterno || !ejs.publicKey) return

  const vars = buildVars(leadData, siteConfig)
  const templateParams = {
    to_email:  notifConfig.notificaAdmin || siteConfig?.footer?.email,
    to_name:   'Team ' + (siteConfig?.brand?.name || ''),
    message:   interpolate(notifConfig.templates?.emailCliente || '', vars),
    from_name: leadData.name,
    reply_to:  leadData.email,
    ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v])),
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      ejs.serviceId,
      template_id:     ejs.templateIdInterno,
      user_id:         ejs.publicKey,
      template_params: templateParams,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.warn(`[leads] email interna: ${text}`)
  }
}

// ── 4. WhatsApp via CallMeBot ─────────────────────────────────────────
export async function sendWhatsApp(numero, apiKey, messaggio) {
  if (!numero || !apiKey || !messaggio) return

  const numClean = numero.replace(/\D/g, '')
  const url = `https://api.callmebot.com/whatsapp.php?phone=${numClean}&text=${encodeURIComponent(messaggio)}&apikey=${apiKey}`

  try {
    await fetch(url, { mode: 'no-cors' })
  } catch {
    // no-cors lanza siempre para response opaque — es normal
  }
}

// ── 5. SMS via Cloud Function proxy ──────────────────────────────────
// Las credenciales de Twilio están en Firebase Secrets (lado servidor).
// El frontend solo llama a esta URL pública que actúa como proxy seguro.
export async function sendSMS(smsConfig, messaggio) {
  if (!smsConfig?.attivo) return

  // URL de la Cloud Function — viene de la variable de entorno
  const functionUrl = import.meta.env.VITE_TWILIO_FUNCTION_URL
  if (!functionUrl) {
    console.warn('[leads] SMS: VITE_TWILIO_FUNCTION_URL no configurada en .env')
    return
  }

  if (!smsConfig.toNumber) {
    console.warn('[leads] SMS: no hay número destinatario configurado')
    return
  }

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:   smsConfig.toNumber,
        body: messaggio,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.warn('[leads] SMS error:', data.error || res.status)
    }
  } catch (err) {
    console.warn('[leads] SMS fetch error:', err.message)
  }
}

// ── 6. Trova agente per zona ──────────────────────────────────────────
export function findAgentForZona(agents = [], zona = '') {
  if (!zona || !agents.length) return null

  const zonaLow = zona.toLowerCase().trim()

  const exact = agents.find(a =>
    a.attivo &&
    (a.zone || []).some(z => z.toLowerCase().trim() === zonaLow)
  )
  if (exact) return exact

  const partial = agents.find(a =>
    a.attivo &&
    (a.zone || []).some(z =>
      zonaLow.includes(z.toLowerCase().trim()) ||
      z.toLowerCase().trim().includes(zonaLow)
    )
  )
  return partial || null
}

// ── 7. Orchestrazione completa ────────────────────────────────────────
export async function processNewLead(leadData, siteConfig) {
  const notifConfig = siteConfig?.notifications || {}
  const agents      = siteConfig?.agents        || []
  const vars        = buildVars(leadData, siteConfig)

  const results = {
    leadId: null, emailCliente: false, emailInterna: false,
    whatsapp: false, sms: false, agente: null,
  }

  // 1. Salva su Firestore
  try {
    results.leadId = await saveLead(leadData)
  } catch (e) {
    console.error('[leads] Firestore save failed:', e)
    throw e
  }

  // 2. Trova agente per zona
  const agente = findAgentForZona(agents, leadData.zona)
  results.agente = agente

  // 3. Email conferma al cliente (non bloccante)
  if (leadData.email) {
    sendEmailCliente(leadData, notifConfig, siteConfig)
      .then(() => { results.emailCliente = true })
      .catch(e => console.warn('[leads] email cliente:', e.message))
  }

  // 4. Email interna al team (non bloccante)
  sendEmailInterna(leadData, notifConfig, siteConfig)
    .then(() => { results.emailInterna = true })
    .catch(e => console.warn('[leads] email interna:', e.message))

  // 5. WhatsApp all'agente (non bloccante)
  const wa = notifConfig.whatsapp
  if (wa?.attivo) {
    const targetNumero = agente?.canalePreferito === 'WhatsApp' && agente?.whatsapp
      ? agente.whatsapp
      : wa.number

    if (targetNumero && wa.apiKey) {
      const waMsg = interpolate(
        notifConfig.templates?.whatsappAgente || '🔔 Nuovo lead: {{nome}} — {{zona}} — {{telefono}}',
        vars
      )
      sendWhatsApp(targetNumero, wa.apiKey, waMsg)
        .then(() => { results.whatsapp = true })
        .catch(e => console.warn('[leads] WhatsApp:', e.message))
    }
  }

  // 6. SMS via Cloud Function (non bloccante)
  if (notifConfig.sms?.attivo) {
    const smsMsg = interpolate(
      notifConfig.templates?.smsAdmin || 'Nuovo lead: {{nome}} — {{zona}} — {{telefono}}',
      vars
    )
    sendSMS(notifConfig.sms, smsMsg)
      .then(() => { results.sms = true })
      .catch(e => console.warn('[leads] SMS:', e.message))
  }

  return results
}