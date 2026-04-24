import { useState, useEffect } from 'react'
import {
  getSiteConfig, getEcosystems, getProjects,
  getTestimonials, getServices,
} from '../lib/firebaseHelpers'

// ─── Datos por defecto ────────────────────────────────────────────────
export const DEFAULT_SITE = {
  hero: {
    badge:    'Digital Creative Studio',
    headline: 'ESTÉTICA QUE VENDE.',
    sub:      'Fusionamos el arte cinematográfico con la ingeniería web para crear negocios digitales imparables.',
    cta:      'EXPLORAR ÁREAS',
    bgImage:  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1920&q=80',
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
    stats: [
      { value: '120+', label: 'Proyectos' },
      { value: '98%',  label: 'Clientes Felices' },
      { value: '8',    label: 'Años de Experiencia' },
    ],
  },
  footer: {
    email:     'hello@polartronic.com',
    whatsapp:  '#',
    instagram: '#',
    copy:      '© 2026 Polartronic Studio. Todos los derechos reservados.',
    sub:       'Diseño Web & Branding de Alto Impacto.',
  },
}

export const DEFAULT_ECOSYSTEMS = [
  { id: 'e1', category: 'Gourmet & Nightlife',   title: 'Restaurantes', desc: 'Menús inmersivos y sistemas de reservas de alta gama.',        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', order: 0 },
  { id: 'e2', category: 'Wellness & Medical',    title: 'Salud',        desc: 'Plataformas que transmiten confianza y profesionalismo.',      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', order: 1 },
  { id: 'e3', category: 'Lifestyle & Grooming',  title: 'Barberías',    desc: 'Agendas digitales y estética urbana impecable.',              image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', order: 2 },
  { id: 'e4', category: 'Luxury Retail',         title: 'Moda',         desc: 'Showrooms que elevan el valor percibido de tus prendas.',      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', order: 3 },
  { id: 'e5', category: 'Streetwear & Shoes',    title: 'Calzado',      desc: 'E-commerce optimizados para lanzamientos de alto volumen.',    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', order: 4 },
  { id: 'e6', category: 'Professional Services', title: 'Consultoría',  desc: 'Landing pages de autoridad para servicios de élite.',          image: 'https://images.unsplash.com/photo-1454165833767-02a92206f250?auto=format&fit=crop&w=800&q=80', order: 5 },
]

export const DEFAULT_PROJECTS = [
  { id: 'p1', title: 'Maison Noir',  category: 'Restaurante', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', link: '#', order: 0 },
  { id: 'p2', title: 'VitaCare',     category: 'Salud',       image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80', link: '#', order: 1 },
  { id: 'p3', title: 'Urban Cuts',   category: 'Barbería',    image: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=800&q=80', link: '#', order: 2 },
  { id: 'p4', title: 'Luxe Fashion', category: 'Moda',        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80', link: '#', order: 3 },
]

export const DEFAULT_TESTIMONIALS = [
  { id: 't1', name: 'María G.',  role: 'CEO, Maison Noir',   text: 'Polartronic transformó nuestra presencia digital. Las reservas online aumentaron un 300%.', avatar: '', order: 0 },
  { id: 't2', name: 'Carlos M.', role: 'Director, VitaCare', text: 'El diseño transmite exactamente la confianza que nuestros pacientes necesitan ver.',        avatar: '', order: 1 },
  { id: 't3', name: 'Ana P.',    role: 'Owner, Urban Cuts',  text: 'En 2 semanas teníamos la agenda llena gracias al nuevo sistema de citas online.',           avatar: '', order: 2 },
]

export const DEFAULT_SERVICES = [
  { id: 's1', icon: '🎨', title: 'Diseño Web',       desc: 'Sitios web a medida con identidad visual única y experiencia premium.',  price: 'Desde $800',  order: 0 },
  { id: 's2', icon: '⚡', title: 'Desarrollo',        desc: 'Aplicaciones web y mobile con las últimas tecnologías del mercado.',      price: 'Desde $1200', order: 1 },
  { id: 's3', icon: '📈', title: 'Branding Digital',  desc: 'Identidad de marca completa que te posiciona como líder de tu nicho.',    price: 'Desde $600',  order: 2 },
  { id: 's4', icon: '🚀', title: 'Marketing Digital', desc: 'Estrategias SEO y performance marketing para escalar tu negocio.',         price: 'Desde $500',  order: 3 },
]

// ─── Cache helpers ────────────────────────────────────────────────────
const CACHE_KEY = 'polartronic_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null   // expiró
    return data
  } catch { return null }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* storage lleno — ignorar */ }
}

export function invalidateCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

// ─── Hook principal ───────────────────────────────────────────────────
export function useSiteData() {
  // Inicializar con caché si existe, sino con defaults
  const cached = readCache()

  const [site,         setSite]         = useState(cached?.site         ?? DEFAULT_SITE)
  const [ecosystems,   setEcosystems]   = useState(cached?.ecosystems   ?? DEFAULT_ECOSYSTEMS)
  const [projects,     setProjects]     = useState(cached?.projects     ?? DEFAULT_PROJECTS)
  const [testimonials, setTestimonials] = useState(cached?.testimonials ?? DEFAULT_TESTIMONIALS)
  const [services,     setServices]     = useState(cached?.services     ?? DEFAULT_SERVICES)

  // loading = false desde el inicio si hay caché → render inmediato
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    async function load() {
      try {
        const [cfg, eco, proj, test, svc] = await Promise.all([
          getSiteConfig(),
          getEcosystems(),
          getProjects(),
          getTestimonials(),
          getServices(),
        ])

        const freshSite = cfg ? { ...DEFAULT_SITE, ...cfg } : DEFAULT_SITE
        const freshEco  = eco.length  ? eco.sort((a,b)  => (a.order||0)-(b.order||0))  : DEFAULT_ECOSYSTEMS
        const freshProj = proj.length ? proj.sort((a,b) => (a.order||0)-(b.order||0))  : DEFAULT_PROJECTS
        const freshTest = test.length ? test.sort((a,b) => (a.order||0)-(b.order||0))  : DEFAULT_TESTIMONIALS
        const freshSvc  = svc.length  ? svc.sort((a,b)  => (a.order||0)-(b.order||0))  : DEFAULT_SERVICES

        setSite(freshSite)
        setEcosystems(freshEco)
        setProjects(freshProj)
        setTestimonials(freshTest)
        setServices(freshSvc)

        // Guardar en caché para la próxima visita
        writeCache({
          site: freshSite,
          ecosystems: freshEco,
          projects: freshProj,
          testimonials: freshTest,
          services: freshSvc,
        })
      } catch (e) {
        console.warn('Firebase load error — using cached/default data:', e.message)
      } finally {
        setLoading(false)
      }
    }

    // Si ya hay caché, cargar Firebase en background sin bloquear UI
    load()
  }, [])

  return {
    site, ecosystems, projects, testimonials, services, loading,
    setSite, setEcosystems, setProjects, setTestimonials, setServices,
  }
}