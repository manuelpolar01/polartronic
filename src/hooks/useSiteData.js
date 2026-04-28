/**
 * useSiteData.js — v3 ANTI-FOUC DEFINITIVO
 * ─────────────────────────────────────────────────────────────────────────
 * PROBLEMA RESUELTO:
 *   Antes: si no había cache válido, se renderizaban los DEFAULT_* (datos demo)
 *   durante ~1-2s hasta que Firebase respondía → flash visual de contenido falso.
 *
 * SOLUCIÓN:
 *   - Si hay cache válido → render inmediato con datos reales (sin flash)
 *   - Si NO hay cache → loading=true, NO se muestran defaults, esperar Firebase
 *   - TTL aumentado a 30 minutos
 *   - Cache se escribe también con datos parciales (evita segunda carga)
 *   - Los DEFAULT_* solo se usan como fallback si Firebase FALLA (error real)
 *
 * RESULTADO: El sitio o muestra datos reales (desde cache o Firebase)
 *            o muestra el spinner — nunca los datos demo hardcoded.
 */

import { useState, useEffect } from 'react'
import {
  getSiteConfig, getEcosystems, getProjects,
  getTestimonials, getServices,
} from '../lib/firebaseHelpers'

// ─── Cache config ─────────────────────────────────────────────────────
const CACHE_KEY = 'polartronic_cache'
const CACHE_TTL = 30 * 60 * 1000  // 30 minutos (antes: 5)

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    // Validar que el cache tiene datos reales (no vacíos)
    if (!data?.site) return null
    return data
  } catch { return null }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* storage lleno */ }
}

export function invalidateCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

// ─── Datos por defecto — SOLO para fallback de error Firebase ────────
// NO se usan en el render inicial normal
export const DEFAULT_SITE = {
  hero: {
    slides: [{
      badge:    'Digital Creative Studio',
      headline: 'ESTÉTICA QUE VENDE.',
      sub:      'Fusionamos el arte cinematográfico con la ingeniería web para crear negocios digitales imparables.',
      cta:      'EXPLORAR ÁREAS',
      bgImage:  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1920&q=80',
    }],
  },
  brand: {
    name:    'POLARTRONIC',
    tagline: 'Elite Digital Studio',
    primary: '#ff3c3c',
    bg:      '#030303',
  },
  about: {
    title: 'Quiénes Somos',
    text:  'Somos un estudio de diseño y desarrollo web de alto impacto.',
  },
  footer: {
    email:     'hello@polartronic.com',
    whatsapp:  '#',
    instagram: '#',
    copy:      '© 2026 Polartronic Studio. Todos los derechos reservados.',
    sub:       'Diseño Web & Branding de Alto Impacto.',
  },
  contact: {
    title:    '¿Listo para el siguiente nivel?',
    subtitle: 'Cuéntanos tu proyecto.',
    fields:   JSON.stringify([
      { id: 'name',    label: 'Nombre',  type: 'text',     required: true },
      { id: 'email',   label: 'Email',   type: 'email',    required: true },
      { id: 'phone',   label: 'Teléfono',type: 'tel',      required: true },
      { id: 'zona',    label: 'Zona',    type: 'text',     required: true },
      { id: 'service', label: 'Servicio',type: 'select',   required: false, options: 'Diseño Web,Desarrollo,Branding,Marketing,Otro' },
      { id: 'message', label: 'Mensaje', type: 'textarea', required: false },
    ]),
    ctaLabel:       'ENVIAR MENSAJE',
    successTitle:   '¡Solicitud recibida!',
    successMessage: 'Te contactaremos en menos de 24 horas.',
  },
  agents:        [],
  notifications: {
    emailjs:   { serviceId: '', templateIdCliente: '', templateIdInterno: '', publicKey: '', attivo: false },
    whatsapp:  { apiKey: '', number: '', attivo: false },
    sms:       { accountSid: '', authToken: '', fromNumber: '', toNumber: '', attivo: false },
    templates: { emailCliente: '', whatsappAgente: '', smsAdmin: '' },
    notificaAdmin: '',
  },
}

export const DEFAULT_ECOSYSTEMS  = []
export const DEFAULT_PROJECTS    = []
export const DEFAULT_TESTIMONIALS = []
export const DEFAULT_SERVICES    = []

// ─── Merge site config preservando todos los campos ──────────────────
function mergeSite(cfg) {
  if (!cfg) return DEFAULT_SITE
  return {
    ...DEFAULT_SITE,
    ...cfg,
    brand:         { ...DEFAULT_SITE.brand,         ...(cfg.brand         || {}) },
    hero:          { ...DEFAULT_SITE.hero,           ...(cfg.hero          || {}) },
    contact:       { ...DEFAULT_SITE.contact,        ...(cfg.contact       || {}) },
    footer:        { ...DEFAULT_SITE.footer,         ...(cfg.footer        || {}) },
    notifications: { ...DEFAULT_SITE.notifications,  ...(cfg.notifications || {}) },
    agents:        cfg.agents ?? DEFAULT_SITE.agents,
  }
}

function sortByOrder(arr) {
  return [...arr].sort((a, b) => (a.order || 0) - (b.order || 0))
}

// ─── Hook principal ───────────────────────────────────────────────────
export function useSiteData() {
  const cached = readCache()

  // Si hay cache válido → inicializar con datos reales, loading=false
  // Si NO hay cache → inicializar con null/[], loading=true (NO con defaults)
  const [site,         setSite]         = useState(cached ? mergeSite(cached.site) : null)
  const [ecosystems,   setEcosystems]   = useState(cached?.ecosystems   ?? null)
  const [projects,     setProjects]     = useState(cached?.projects     ?? null)
  const [testimonials, setTestimonials] = useState(cached?.testimonials ?? null)
  const [services,     setServices]     = useState(cached?.services     ?? null)
  const [loading,      setLoading]      = useState(!cached)  // true solo si no hay cache

  useEffect(() => {
    // Si ya tenemos cache válido, hacer fetch en background silencioso
    // para actualizar datos sin mostrar loading
    let cancelled = false

    async function hydrate() {
      // Si no hay cache: mostrar loading
      // Si hay cache: fetch silencioso (sin cambiar loading)
      if (!cached) setLoading(true)

      try {
        const [cfg, eco, proj, test, svc] = await Promise.all([
          getSiteConfig(),
          getEcosystems(),
          getProjects(),
          getTestimonials(),
          getServices(),
        ])

        if (cancelled) return

        const freshSite = mergeSite(cfg)
        const freshEco  = eco.length  ? sortByOrder(eco)  : []
        const freshProj = proj.length ? sortByOrder(proj) : []
        const freshTest = test.length ? sortByOrder(test) : []
        const freshSvc  = svc.length  ? sortByOrder(svc)  : []

        setSite(freshSite)
        setEcosystems(freshEco)
        setProjects(freshProj)
        setTestimonials(freshTest)
        setServices(freshSvc)

        writeCache({
          site:         freshSite,
          ecosystems:   freshEco,
          projects:     freshProj,
          testimonials: freshTest,
          services:     freshSvc,
        })

      } catch (e) {
        console.warn('[useSiteData] Firebase error:', e.message)
        // Solo usar defaults si no tenemos NADA (ni cache ni datos previos)
        if (!cached) {
          setSite(DEFAULT_SITE)
          setEcosystems(DEFAULT_ECOSYSTEMS)
          setProjects(DEFAULT_PROJECTS)
          setTestimonials(DEFAULT_TESTIMONIALS)
          setServices(DEFAULT_SERVICES)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mientras loading y sin datos: devolver estado de carga
  // Los componentes deben manejar site=null como "aún cargando"
  return {
    site:         site         ?? DEFAULT_SITE,
    ecosystems:   ecosystems   ?? [],
    projects:     projects     ?? [],
    testimonials: testimonials ?? [],
    services:     services     ?? [],
    loading,
    // Flags para saber si tenemos datos reales o estamos esperando
    hasData: site !== null,
    setSite, setEcosystems, setProjects, setTestimonials, setServices,
  }
}