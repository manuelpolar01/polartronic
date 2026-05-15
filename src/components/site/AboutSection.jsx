/**
 * AboutSection.jsx — v2
 * TODO el texto visible hardcodeado en 6 idiomas.
 * Cambia instantáneamente al cambiar el idioma en el panel.
 * Sin useTranslatedContent, sin Google Translate, sin delay.
 */

import { useState, useEffect } from 'react'

function rl(dict, lang) {
  return dict?.[lang] || dict?.['es'] || dict?.['en'] || ''
}

const CONTENT = {
  eyebrow: {
    it: 'Chi siamo', en: 'About us', es: 'Quiénes somos',
    fr: 'Qui sommes-nous', de: 'Über uns', pt: 'Sobre nós',
  },
  title: {
    it: 'Nati in Argentina,\ncresciamo in Europa.',
    en: 'Born in Argentina,\ngrowing across Europe.',
    es: 'Nacimos en Argentina,\ncrecemos en Europa.',
    fr: 'Nés en Argentine,\nnous grandissons en Europe.',
    de: 'In Argentinien geboren,\nin Europa gewachsen.',
    pt: 'Nascemos na Argentina,\ncrescemos na Europa.',
  },
  subtitle: {
    it: 'Siamo uno studio digitale con radici a Buenos Aires e visione globale. Combiniamo la creatività e il talento latinoamericano con gli standard di qualità del mercato europeo per creare esperienze digitali che fanno davvero la differenza.',
    en: 'We are a digital studio rooted in Buenos Aires with a global vision. We combine Latin American creativity and talent with European market quality standards to create digital experiences that truly make a difference.',
    es: 'Somos un estudio digital con raíces en Buenos Aires y visión global. Combinamos la creatividad y el talento latinoamericano con los estándares de calidad del mercado europeo para crear experiencias digitales que realmente marcan la diferencia.',
    fr: "Nous sommes un studio digital ancré à Buenos Aires avec une vision mondiale. Nous combinons la créativité et le talent latino-américain avec les standards de qualité du marché européen pour créer des expériences digitales qui font vraiment la différence.",
    de: 'Wir sind ein digitales Studio mit Wurzeln in Buenos Aires und globaler Vision. Wir kombinieren lateinamerikanische Kreativität und Talent mit europäischen Qualitätsstandards, um digitale Erlebnisse zu schaffen, die wirklich einen Unterschied machen.',
    pt: 'Somos um estúdio digital com raízes em Buenos Aires e visão global. Combinamos a criatividade e o talento latino-americano com os padrões de qualidade do mercado europeu para criar experiências digitais que realmente fazem a diferença.',
  },
  originLabel: {
    it: 'Origine', en: 'Origin', es: 'Origen',
    fr: 'Origine', de: 'Herkunft', pt: 'Origem',
  },
  originText: {
    it: "Fondati a Buenos Aires nel 2018, abbiamo trascorso anni a costruire soluzioni digitali per brand e aziende in Argentina, Cile e Uruguay. Oggi facciamo il grande passo: portiamo quel talento e quella passione direttamente nel cuore dell'Europa.",
    en: 'Founded in Buenos Aires in 2018, we spent years building digital solutions for brands and companies across Argentina, Chile and Uruguay. Today we take the big step: bringing that talent and passion directly to the heart of Europe.',
    es: 'Fundados en Buenos Aires en 2018, llevamos años construyendo soluciones digitales para marcas y empresas en Argentina, Chile y Uruguay. Hoy damos el gran paso: llevamos ese talento y esa pasión directamente al corazón de Europa.',
    fr: "Fondés à Buenos Aires en 2018, nous avons passé des années à construire des solutions digitales pour des marques et entreprises en Argentine, Chili et Uruguay. Aujourd'hui nous franchissons le grand pas : apporter ce talent et cette passion au cœur de l'Europe.",
    de: 'Gegründet in Buenos Aires im Jahr 2018, haben wir Jahre damit verbracht, digitale Lösungen für Marken und Unternehmen in Argentinien, Chile und Uruguay zu entwickeln. Heute machen wir den großen Schritt: Wir bringen dieses Talent und diese Leidenschaft direkt ins Herz Europas.',
    pt: 'Fundados em Buenos Aires em 2018, passamos anos construindo soluções digitais para marcas e empresas na Argentina, Chile e Uruguai. Hoje damos o grande passo: levamos esse talento e essa paixão diretamente ao coração da Europa.',
  },
  missionLabel: {
    it: 'Missione', en: 'Mission', es: 'Misión',
    fr: 'Mission', de: 'Mission', pt: 'Missão',
  },
  missionText: {
    it: "Democratizzare l'accesso al design e alla tecnologia di alto impatto. Crediamo che una PMI italiana meriti la stessa qualità digitale di una grande corporation, a prezzi accessibili e con l'energia creativa che solo l'America Latina sa dare.",
    en: 'Democratizing access to high-impact design and technology. We believe an Italian SME deserves the same digital quality as a large corporation, at accessible prices and with the creative energy that only Latin America can provide.',
    es: 'Democratizar el acceso a diseño y tecnología de alto impacto. Creemos que una PyME italiana merece la misma calidad digital que una gran corporación, a precios accesibles y con la energía creativa que solo América Latina sabe dar.',
    fr: "Démocratiser l'accès au design et à la technologie à fort impact. Nous croyons qu'une PME italienne mérite la même qualité digitale qu'une grande corporation, à des prix accessibles et avec l'énergie créative que seule l'Amérique latine sait donner.",
    de: 'Demokratisierung des Zugangs zu wirkungsvollem Design und Technologie. Wir glauben, dass ein italienisches KMU die gleiche digitale Qualität wie ein großer Konzern verdient, zu erschwinglichen Preisen und mit der kreativen Energie, die nur Lateinamerika bieten kann.',
    pt: 'Democratizar o acesso a design e tecnologia de alto impacto. Acreditamos que uma PME italiana merece a mesma qualidade digital que uma grande corporação, a preços acessíveis e com a energia criativa que só a América Latina sabe dar.',
  },
  visionLabel: {
    it: 'Visione', en: 'Vision', es: 'Visión',
    fr: 'Vision', de: 'Vision', pt: 'Visão',
  },
  visionText: {
    it: 'Essere il ponte definitivo tra il talento digitale latinoamericano e le aziende europee che cercano di differenziarsi in un mercato sempre più competitivo.',
    en: 'Being the definitive bridge between Latin American digital talent and European companies looking to stand out in an increasingly competitive market.',
    es: 'Ser el puente definitivo entre el talento digital latinoamericano y las empresas europeas que buscan diferenciarse en un mercado cada vez más competitivo.',
    fr: 'Être le pont définitif entre le talent digital latino-américain et les entreprises européennes qui cherchent à se différencier dans un marché de plus en plus compétitif.',
    de: 'Die definitive Brücke zwischen lateinamerikanischem digitalem Talent und europäischen Unternehmen zu sein, die sich in einem immer wettbewerbsfähigeren Markt abheben wollen.',
    pt: 'Ser a ponte definitiva entre o talento digital latino-americano e as empresas europeias que buscam se diferenciar em um mercado cada vez mais competitivo.',
  },
  ctaLabel: {
    it: 'Lavora con noi', en: 'Work with us', es: 'Trabajemos juntos',
    fr: 'Travaillons ensemble', de: 'Zusammenarbeiten', pt: 'Trabalhe conosco',
  },
}

const STATS = [
  {
    value: '6+',
    label: { it: 'Anni di esperienza', en: 'Years of experience', es: 'Años de experiencia', fr: "Ans d'expérience", de: 'Jahre Erfahrung', pt: 'Anos de experiência' },
  },
  {
    value: '80+',
    label: { it: 'Progetti globali', en: 'Global projects', es: 'Proyectos globales', fr: 'Projets globaux', de: 'Globale Projekte', pt: 'Projetos globais' },
  },
  {
    value: '4',
    label: { it: 'Paesi attivi', en: 'Active countries', es: 'Países activos', fr: 'Pays actifs', de: 'Aktive Länder', pt: 'Países ativos' },
  },
  {
    value: '12',
    label: { it: 'Professionisti', en: 'Professionals', es: 'Profesionales', fr: 'Professionnels', de: 'Fachleute', pt: 'Profissionais' },
  },
]

const VALORES = [
  {
    icon: '🧉',
    title: { it: 'Anima Latina', en: 'Latin Soul', es: 'Alma Latina', fr: 'Âme Latine', de: 'Lateinische Seele', pt: 'Alma Latina' },
    desc:  { it: 'La creatività e la passione del talento argentino in ogni progetto che realizziamo.', en: 'The creativity and passion of Argentine talent in every project we deliver.', es: 'La creatividad y pasión del talento argentino en cada proyecto que entregamos.', fr: 'La créativité et la passion du talent argentin dans chaque projet.', de: 'Die Kreativität und Leidenschaft argentinischen Talents in jedem Projekt.', pt: 'A criatividade e paixão do talento argentino em cada projeto.' },
  },
  {
    icon: '🇪🇺',
    title: { it: 'Standard Europei', en: 'European Standards', es: 'Estándares Europeos', fr: 'Standards Européens', de: 'Europäische Standards', pt: 'Padrões Europeus' },
    desc:  { it: 'Qualità, puntualità e rigore tecnico che soddisfano le esigenze del mercato europeo.', en: 'Quality, punctuality and technical rigor that meet European market demands.', es: 'Calidad, puntualidad y rigor técnico que satisfacen las exigencias del mercado europeo.', fr: 'Qualité, ponctualité et rigueur technique pour le marché européen.', de: 'Qualität, Pünktlichkeit und technische Strenge für den europäischen Markt.', pt: 'Qualidade, pontualidade e rigor técnico para o mercado europeu.' },
  },
  {
    icon: '🚀',
    title: { it: 'Innovazione Continua', en: 'Continuous Innovation', es: 'Innovación Continua', fr: 'Innovation Continue', de: 'Kontinuierliche Innovation', pt: 'Inovação Contínua' },
    desc:  { it: 'Tecnologie moderne, approcci freschi e soluzioni che anticipano le tendenze del mercato.', en: 'Modern technologies, fresh approaches and solutions that anticipate market trends.', es: 'Tecnologías modernas, enfoques frescos y soluciones que anticipan las tendencias.', fr: 'Technologies modernes et solutions qui anticipent les tendances du marché.', de: 'Moderne Technologien und Lösungen, die Markttrends antizipieren.', pt: 'Tecnologias modernas e soluções que antecipam as tendências do mercado.' },
  },
  {
    icon: '🤝',
    title: { it: 'Relazioni Durature', en: 'Lasting Relationships', es: 'Relaciones Duraderas', fr: 'Relations Durables', de: 'Dauerhafte Beziehungen', pt: 'Relações Duradouras' },
    desc:  { it: 'Non siamo solo fornitori: diventiamo il tuo team digitale a lungo termine.', en: "We're not just vendors — we become your long-term digital team.", es: 'No somos solo proveedores: nos convertimos en tu equipo digital a largo plazo.', fr: "Nous devenons votre équipe digitale à long terme.", de: 'Wir werden Ihr langfristiges digitales Team.', pt: 'Tornamo-nos a sua equipa digital a longo prazo.' },
  },
]

export default function AboutSection({ brand }) {
  const primary = brand?.primary || '#ff3c3c'

  const [lang, setLang] = useState(
    () => brand?.language
      || (typeof window !== 'undefined' ? window.__SITE_LANGUAGE__ : null)
      || 'it'
  )

  useEffect(() => {
    if (brand?.language) setLang(brand.language)
  }, [brand?.language])

  useEffect(() => {
    const handler = (e) => setLang(e.detail || window.__SITE_LANGUAGE__ || 'it')
    window.addEventListener('sitelang', handler)
    return () => window.removeEventListener('sitelang', handler)
  }, [])

  return (
    <section id="about" style={{ padding: 'clamp(60px,10vw,100px) clamp(20px,6%,80px)', background: 'rgba(255,255,255,0.015)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes abtFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .abt-valor:hover{border-color:${primary}40!important;transform:translateY(-4px)!important;background:${primary}06!important;}
        .abt-valor:hover .abt-icon{transform:scale(1.15)!important;}
        .abt-cta:hover{background:${primary}!important;color:white!important;transform:translateY(-2px)!important;box-shadow:0 12px 36px ${primary}40!important;}
        .abt-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,40px);margin-bottom:clamp(48px,7vw,72px);align-items:start;}
        .abt-valores{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,2vw,18px);margin-bottom:clamp(40px,6vw,56px);}
        .abt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,2vw,20px);margin-bottom:clamp(48px,7vw,72px);}
        @media(max-width:900px){.abt-valores{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:768px){.abt-grid{grid-template-columns:1fr!important;}.abt-stats{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:480px){.abt-valores{grid-template-columns:1fr!important;}.abt-stats{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>

      {/* Fondo decorativo */}
      <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%', zIndex:0, pointerEvents:'none', background:`radial-gradient(ellipse at 80% 50%, ${primary}06 0%, transparent 70%)` }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'clamp(6rem,15vw,12rem)', opacity:0.04, userSelect:'none', filter:'grayscale(1)' }}>🌍</div>
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign:'center', marginBottom:'clamp(40px,6vw,64px)', animation:'abtFadeUp 0.7s ease both' }}>
          <p style={{ color:primary, fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:4, marginBottom:14 }}>
            {rl(CONTENT.eyebrow, lang)}
          </p>
          <h2 style={{ fontSize:'clamp(1.8rem,5vw,3rem)', fontWeight:800, lineHeight:1.15, color:'var(--text-main)', margin:'0 auto', maxWidth:700, whiteSpace:'pre-line' }}>
            {rl(CONTENT.title, lang)}
          </h2>
          <p style={{ color:'var(--text-dim)', fontSize:'clamp(14px,2vw,17px)', lineHeight:1.8, maxWidth:640, margin:'20px auto 0', fontWeight:300 }}>
            {rl(CONTENT.subtitle, lang)}
          </p>
        </div>

        {/* STATS */}
        <div className="abt-stats">
          {STATS.map((s, i) => (
            <div key={i} style={{ padding:'clamp(18px,3vw,28px) clamp(12px,2vw,20px)', background:`${primary}06`, border:`1px solid ${primary}20`, borderRadius:14, textAlign:'center', animation:`abtFadeUp 0.6s ${i*0.08}s ease both` }}>
              <div style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:primary, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', marginTop:8, lineHeight:1.4 }}>
                {rl(s.label, lang)}
              </div>
            </div>
          ))}
        </div>

        {/* GRILLA ORIGEN / MISIÓN / VISIÓN */}
        <div className="abt-grid">

          {/* Origen */}
          <div style={{ animation:'abtFadeUp 0.7s 0.1s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:`${primary}15`, border:`1px solid ${primary}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🇦🇷</div>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:primary }}>{rl(CONTENT.originLabel, lang)}</span>
            </div>
            <p style={{ color:'var(--text-dim)', fontSize:'clamp(13px,1.8vw,15px)', lineHeight:1.85 }}>
              {rl(CONTENT.originText, lang)}
            </p>
            <div style={{ marginTop:24, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:28 }}>🇦🇷</span>
              <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${primary}, ${primary}20)`, position:'relative' }}>
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:8, height:8, borderRadius:'50%', background:primary }} />
              </div>
              <span style={{ fontSize:28 }}>🇪🇺</span>
            </div>
          </div>

          {/* Misión + Visión */}
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,3vw,24px)', animation:'abtFadeUp 0.7s 0.2s ease both' }}>
            <div style={{ padding:'clamp(16px,3vw,24px)', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, borderLeft:`3px solid ${primary}` }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:primary, marginBottom:10 }}>
                {rl(CONTENT.missionLabel, lang)}
              </div>
              <p style={{ color:'var(--text-dim)', fontSize:'clamp(13px,1.8vw,14px)', lineHeight:1.8, margin:0 }}>
                {rl(CONTENT.missionText, lang)}
              </p>
            </div>
            <div style={{ padding:'clamp(16px,3vw,24px)', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, borderLeft:`3px solid ${primary}50` }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:`${primary}90`, marginBottom:10 }}>
                {rl(CONTENT.visionLabel, lang)}
              </div>
              <p style={{ color:'var(--text-dim)', fontSize:'clamp(13px,1.8vw,14px)', lineHeight:1.8, margin:0 }}>
                {rl(CONTENT.visionText, lang)}
              </p>
            </div>
          </div>
        </div>

        {/* VALORES */}
        <div className="abt-valores">
          {VALORES.map((v, i) => (
            <div key={i} className="abt-valor" style={{ padding:'clamp(18px,3vw,26px) clamp(14px,2vw,20px)', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, cursor:'default', transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)', animation:`abtFadeUp 0.6s ${0.1+i*0.07}s ease both` }}>
              <div className="abt-icon" style={{ fontSize:'clamp(1.6rem,3vw,2rem)', marginBottom:14, transition:'transform 0.3s', display:'block' }}>
                {v.icon}
              </div>
              <div style={{ fontWeight:700, fontSize:'clamp(0.9rem,2vw,1rem)', color:'var(--text-main)', marginBottom:8, lineHeight:1.3 }}>
                {rl(v.title, lang)}
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.7, margin:0 }}>
                {rl(v.desc, lang)}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', animation:'abtFadeUp 0.7s 0.4s ease both' }}>
          <a href="#contacto" className="abt-cta" style={{ display:'inline-block', padding:'clamp(14px,2vw,18px) clamp(32px,5vw,56px)', background:'transparent', color:primary, border:`2px solid ${primary}`, borderRadius:8, fontWeight:800, fontSize:'clamp(12px,2vw,14px)', letterSpacing:1.5, textTransform:'uppercase', textDecoration:'none', transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            {rl(CONTENT.ctaLabel, lang)} →
          </a>
        </div>

      </div>
    </section>
  )
}