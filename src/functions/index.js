// ─────────────────────────────────────────────────────────────────────
// functions/index.js — Cloud Function proxy para Twilio SMS
// ─────────────────────────────────────────────────────────────────────
//
// Por qué esto es necesario:
//   Las credenciales de Twilio (accountSid + authToken) no pueden estar
//   en el frontend — cualquiera podría usarlas para enviar SMS a tu costa.
//   Esta función actúa como proxy seguro: el frontend llama a esta URL,
//   la función usa las credenciales guardadas como secrets de Firebase.
//
// SETUP (una sola vez):
//   1. npm install -g firebase-tools
//   2. firebase login
//   3. cd functions && npm install
//   4. firebase functions:secrets:set TWILIO_ACCOUNT_SID
//      → pega tu Account SID cuando lo pida
//   5. firebase functions:secrets:set TWILIO_AUTH_TOKEN
//      → pega tu Auth Token cuando lo pida
//   6. firebase functions:secrets:set TWILIO_FROM_NUMBER
//      → pega tu número Twilio (+12025551234)
//   7. firebase deploy --only functions
//   8. Copia la URL que aparece en el deploy y ponla en .env:
//      VITE_TWILIO_FUNCTION_URL=https://us-central1-TU_PROYECTO.cloudfunctions.net/sendSMS
//
// Coste: ~$0.001 por invocación (Cloud Functions) + ~$0.05 por SMS (Twilio)
// ─────────────────────────────────────────────────────────────────────

const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const twilio = require('twilio')

// Los secrets nunca se hardcodean — Firebase los inyecta en runtime
const TWILIO_ACCOUNT_SID  = defineSecret('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN   = defineSecret('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_NUMBER  = defineSecret('TWILIO_FROM_NUMBER')

exports.sendSMS = onRequest(
  {
    // Expone los secrets a esta función
    secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER],
    // CORS: solo acepta requests de tu dominio
    cors: [
      'http://localhost:5173',
      'https://polartronic.app-customer.com',
      /\.vercel\.app$/,   // preview deployments de Vercel
    ],
  },
  async (req, res) => {
    // Solo acepta POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { to, body } = req.body

    // Validación básica
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing "to" or "body" field' })
    }

    // Formato de número: debe empezar por +
    if (!to.startsWith('+')) {
      return res.status(400).json({ error: 'Phone number must include country code (+39...)' })
    }

    // Límite de caracteres para evitar abusos
    if (body.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' })
    }

    try {
      const client = twilio(
        TWILIO_ACCOUNT_SID.value(),
        TWILIO_AUTH_TOKEN.value()
      )

      const message = await client.messages.create({
        body,
        from: TWILIO_FROM_NUMBER.value(),
        to,
      })

      return res.status(200).json({
        success: true,
        sid: message.sid,
      })

    } catch (err) {
      console.error('[sendSMS] Twilio error:', err.message)
      return res.status(500).json({
        error: 'SMS delivery failed',
        // No exponer el mensaje de error completo en producción
        ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
      })
    }
  }
)