/**
 * AboutSection.jsx
 * ─────────────────────────────────────────────────────────────────────
 * Sección "Quiénes Somos" — empresa argentina expandiéndose a Europa.
 * - 100% responsiva con clamp()
 * - Traducción automática via useTranslatedContent
 * - Afectada por el idioma configurado en el panel admin
 * - Integra con brand.about si está configurado, sino usa defaults
 */

import { useUIStrings }        from '../../hooks/useUIStrings'
import { useTranslatedContent } from '../../hooks/useTranslatedContent'

// ── Strings de UI (traducidos por idioma) ─────────────────────────────
const ABOUT_UI = {
  eyebrow:       { it: 'Chi siamo',        en: 'About us',        es: 'Quiénes somos',   fr: 'Qui sommes-nous', de: 'Über uns',          pt: 'Sobre nós'        },
  origin:        { it: 'Origine',          en: 'Origin',          es: 'Origen',          fr: 'Origine',         de: 'Herkunft',          pt: 'Origem'           },
  mission:       { it: 'Missione',         en: 'Mission',         es: 'Misión',          fr: 'Mission',         de: 'Mission',           pt: 'Missão'           },
  vision:        { it: 'Visione',          en: 'Vision',          es: 'Visión',          fr: 'Vision',          de: 'Vision',            pt: 'Visão'            },
  yearsLabel:    { it: 'Anni di exp.',     en: 'Years of exp.',   es: 'Años de exp.',    fr: "Ans d'exp.",      de: 'Jahre Erfahrung',   pt: 'Anos de exp.'     },
  projectsLabel: { it: 'Progetti globali', en: 'Global projects', es: 'Proyectos glob.', fr: 'Projets globaux', de: 'Globale Projekte',  pt: 'Projetos globais' },
  countriesLabel:{ it: 'Paesi attivi',     en: 'Active countries',es: 'Países activos',  fr: 'Pays actifs',     de: 'Aktive Länder',     pt: 'Países ativos'    },
  teamLabel:     { it: 'Professionisti',   en: 'Professionals',   es: 'Profesionales',   fr: 'Professionnels',  de: 'Fachleute',         pt: 'Profissionais'    },
  ctaLabel:      { it: 'Lavora con noi',   en: 'Work with us',    es: 'Trabajemos juntos',fr: 'Travaillons ensemble', de: 'Zusammenarbeiten', pt: 'Trabalhe conosco' },
}

function rl(dict, lang) {
  return dict?.[lang] || dict?.['es'] || dict?.['en'] || ''
}

// ── Contenido editorial por defecto ───────────────────────────────────
// Se usa si el admin no configuró nada en el panel → siempre se muestra algo
const DEFAULT_ABOUT = {
  title:   'Nacimos en Argentina,\ncrecemos en Europa.',
  subtitle:'Somos un estudio digital con raíces en Buenos Aires y visión global. Combinamos la creatividad y el talento latinoamericano con los estándares de calidad del mercado europeo para crear experiencias digitales que realmente marcan la diferencia.',
  origin:  'Fundados en Buenos Aires en 2018, llevamos años construyendo soluciones digitales para marcas y empresas en Argentina, Chile y Uruguay. Hoy damos el gran paso: llevamos ese talento y esa pasión directamente al corazón de Europa.',
  mission: 'Democratizar el acceso a diseño y tecnología de alto impacto. Creemos que una PyME italiana merece la misma calidad digital que una gran corporación, a precios accesibles y con la energía creativa que solo América Latina sabe dar.',
  vision:  'Ser el puente definitivo entre el talento digital latinoamericano y las empresas europeas que buscan diferenciarse en un mercado cada vez más competitivo.',
}

// ── Valores / pilares ─────────────────────────────────────────────────
const VALORES = [
  {
    icon: '🧉',
    title: { it: 'Anima Latina',         en: 'Latin Soul',        es: 'Alma Latina',        fr: 'Âme Latine',          de: 'Lateinische Seele',  pt: 'Alma Latina'          },
    desc:  { it: 'La creatività e la passione del talento argentino in ogni progetto che realizziamo.', en: 'The creativity and passion of Argentine talent in every project we deliver.', es: 'La creatividad y pasión del talento argentino en cada proyecto que entregamos.', fr: 'La créativité et la passion du talent argentin dans chaque projet que nous réalisons.', de: 'Die Kreativität und Leidenschaft argentinischen Talents in jedem Projekt.', pt: 'A criatividade e paixão do talento argentino em cada projeto que entregamos.' },
  },
  {
    icon: '🇪🇺',
    title: { it: 'Standard Europei',     en: 'European Standards', es: 'Estándares Europeos', fr: 'Standards Européens', de: 'Europäische Standards', pt: 'Padrões Europeus'  },
    desc:  { it: 'Qualità, puntualità e rigore tecnico che soddisfano le esigenze del mercato europeo.', en: 'Quality, punctuality and technical rigor that meet European market demands.', es: 'Calidad, puntualidad y rigor técnico que satisfacen las exigencias del mercado europeo.', fr: 'Qualité, ponctualité et rigueur technique pour le marché européen.', de: 'Qualität, Pünktlichkeit und technische Strenge für den europäischen Markt.', pt: 'Qualidade, pontualidade e rigor técnico para o mercado europeu.' },
  },
  {
    icon: '🚀',
    title: { it: 'Innovazione Continua', en: 'Continuous Innovation', es: 'Innovación Continua', fr: 'Innovation Continue', de: 'Kontinuierliche Innovation', pt: 'Inovação Contínua' },
    desc:  { it: 'Tecnologie moderne, approcci freschi e soluzioni che anticipano le tendenze del mercato.', en: 'Modern technologies, fresh approaches and solutions that anticipate market trends.', es: 'Tecnologías modernas, enfoques frescos y soluciones que anticipan las tendencias del mercado.', fr: 'Technologies modernes et solutions qui anticipent les tendances du marché.', de: 'Moderne Technologien und Lösungen, die Markttrends antizipieren.', pt: 'Tecnologias modernas e soluções que antecipam as tendências do mercado.' },
  },
  {
    icon: '🤝',
    title: { it: 'Relazioni Durature',   en: 'Lasting Relationships', es: 'Relaciones Duraderas', fr: 'Relations Durables', de: 'Dauerhafte Beziehungen', pt: 'Relações Duradouras' },
    desc:  { it: 'Non siamo solo fornitori: diventiamo il tuo team digitale a lungo termine.', en: "We're not just vendors — we become your long-term digital team.", es: 'No somos solo proveedores: nos convertimos en tu equipo digital a largo plazo.', fr: "Nous ne sommes pas que des prestataires : nous devenons votre équipe digitale à long terme.", de: 'Wir sind nicht nur Anbieter — wir werden Ihr langfristiges digitales Team.', pt: 'Não somos apenas fornecedores — tornamo-nos a sua equipa digital a longo prazo.' },
  },
]

// ── Estadísticas ──────────────────────────────────────────────────────
const STATS = [
  { value: '6+',  keyLabel: 'yearsLabel'     },
  { value: '80+', keyLabel: 'projectsLabel'  },
  { value: '4',   keyLabel: 'countriesLabel' },
  { value: '12',  keyLabel: 'teamLabel'      },
]

// ── Componente principal ──────────────────────────────────────────────
export default function AboutSection({ brand, about }) {
  const primary = brand?.primary || '#ff3c3c'
  const t = useUIStrings(brand)
  const lang = brand?.language
    || (typeof window !== 'undefined' ? window.__SITE_LANGUAGE__ : null)
    || 'it'

  // Traducir contenido editorial (viene del panel admin o usa defaults)
  const content = useTranslatedContent(
    {
      title:   about?.title   || DEFAULT_ABOUT.title,
      subtitle:about?.subtitle|| DEFAULT_ABOUT.subtitle,
      origin:  about?.text    || DEFAULT_ABOUT.origin,
      mission: DEFAULT_ABOUT.mission,
      vision:  DEFAULT_ABOUT.vision,
    },
    brand
  )

  return (
    <section id="about" style={{ padding: 'clamp(60px,10vw,100px) clamp(20px,6%,80px)', background: 'var(--dark2, rgba(255,255,255,0.015))', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes abtFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .abt-valor:hover{border-color:${primary}40!important;transform:translateY(-4px)!important;background:${primary}06!important;}
        .abt-valor:hover .abt-icon{transform:scale(1.15)!important;}
        .abt-cta:hover{background:${primary}!important;color:white!important;transform:translateY(-2px)!important;box-shadow:0 12px 36px ${primary}40!important;}
        @media(max-width:768px){
          .abt-grid{grid-template-columns:1fr!important;}
          .abt-valores{grid-template-columns:1fr 1fr!important;}
          .abt-stats{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:480px){
          .abt-valores{grid-template-columns:1fr!important;}
          .abt-stats{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>

      {/* Decoración de fondo — mapa Argentina → Europa */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '40%', zIndex: 0, overflow: 'hidden',
        background: `radial-gradient(ellipse at 80% 50%, ${primary}06 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 'clamp(6rem,15vw,12rem)',
          opacity: 0.04, userSelect: 'none',
          filter: 'grayscale(1)',
        }}>🌍</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)', animation: 'abtFadeUp 0.7s ease both' }}>
          <p style={{ color: primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 14 }}>
            {rl(ABOUT_UI.eyebrow, lang)}
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-main)', margin: '0 auto', maxWidth: 700, whiteSpace: 'pre-line' }}>
            {content.title}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(14px,2vw,17px)', lineHeight: 1.8, maxWidth: 640, margin: '20px auto 0', fontWeight: 300 }}>
            {content.subtitle}
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="abt-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(12px,2vw,20px)', marginBottom: 'clamp(48px,7vw,72px)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: 'clamp(18px,3vw,28px) clamp(12px,2vw,20px)',
              background: `${primary}06`, border: `1px solid ${primary}20`,
              borderRadius: 14, textAlign: 'center',
              animation: `abtFadeUp 0.6s ${i * 0.08}s ease both`,
            }}>
              <div style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: primary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
                {rl(ABOUT_UI[s.keyLabel], lang)}
              </div>
            </div>
          ))}
        </div>

        {/* ── GRILLA PRINCIPAL: origen / misión / visión ── */}
        <div className="abt-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(20px,4vw,40px)', marginBottom: 'clamp(48px,7vw,72px)', alignItems: 'start' }}>

          {/* Columna izquierda — Origen */}
          <div style={{ animation: 'abtFadeUp 0.7s 0.1s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${primary}15`, border: `1px solid ${primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🇦🇷</div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: primary }}>{rl(ABOUT_UI.origin, lang)}</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(13px,1.8vw,15px)', lineHeight: 1.85 }}>
              {content.origin}
            </p>

            {/* Bandera de ruta AR → EU */}
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🇦🇷</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${primary}, ${primary}20)`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: primary }} />
              </div>
              <span style={{ fontSize: 28 }}>🇪🇺</span>
            </div>
          </div>

          {/* Columna derecha — Misión + Visión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,3vw,24px)', animation: 'abtFadeUp 0.7s 0.2s ease both' }}>
            <div style={{ padding: 'clamp(16px,3vw,24px)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, borderLeft: `3px solid ${primary}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: primary, marginBottom: 10 }}>{rl(ABOUT_UI.mission, lang)}</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(13px,1.8vw,14px)', lineHeight: 1.8, margin: 0 }}>
                {content.mission}
              </p>
            </div>
            <div style={{ padding: 'clamp(16px,3vw,24px)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, borderLeft: `3px solid ${primary}50` }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: `${primary}80`, marginBottom: 10 }}>{rl(ABOUT_UI.vision, lang)}</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(13px,1.8vw,14px)', lineHeight: 1.8, margin: 0 }}>
                {content.vision}
              </p>
            </div>
          </div>
        </div>

        {/* ── VALORES ── */}
        <div className="abt-valores" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(12px,2vw,18px)', marginBottom: 'clamp(40px,6vw,56px)' }}>
          {VALORES.map((v, i) => (
            <div key={i} className="abt-valor" style={{
              padding: 'clamp(18px,3vw,26px) clamp(14px,2vw,20px)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, cursor: 'default',
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
              animation: `abtFadeUp 0.6s ${0.1 + i * 0.07}s ease both`,
            }}>
              <div className="abt-icon" style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', marginBottom: 14, transition: 'transform 0.3s', display: 'block' }}>
                {v.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem,2vw,1rem)', color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.3 }}>
                {rl(v.title, lang)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                {rl(v.desc, lang)}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', animation: 'abtFadeUp 0.7s 0.4s ease both' }}>
          <a
            href="#contacto"
            className="abt-cta"
            style={{
              display: 'inline-block',
              padding: 'clamp(14px,2vw,18px) clamp(32px,5vw,56px)',
              background: 'transparent',
              color: primary,
              border: `2px solid ${primary}`,
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 'clamp(12px,2vw,14px)',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {rl(ABOUT_UI.ctaLabel, lang)} →
          </a>
        </div>

      </div>
    </section>
  )
}