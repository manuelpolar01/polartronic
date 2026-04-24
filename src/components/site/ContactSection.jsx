export default function ContactSection({ footer, brand }) {
  const primary = brand?.primary || '#ff3c3c'
  const email   = footer?.email     || 'hello@polartronic.com'
  const wa      = footer?.whatsapp  || '#'
  const ig      = footer?.instagram || '#'

  return (
    <section id="contacto" style={{ padding:'100px 6%',
      background:`radial-gradient(circle at center, ${primary}06 0%, transparent 70%)`,
      textAlign:'center' }}>
      <p style={{ color: primary, fontSize:'0.75rem', fontWeight:800,
        textTransform:'uppercase', letterSpacing:4, marginBottom:16 }}>Hablemos</p>
      <h2 style={{ fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:800, marginBottom:16, lineHeight:1.1 }}>
        ¿Listo para el<br /><span style={{ color: primary }}>siguiente nivel?</span>
      </h2>
      <p style={{ color:'rgba(255,255,255,0.45)', fontSize:16, maxWidth:500,
        margin:'0 auto 48px', lineHeight:1.7 }}>
        Cuéntanos tu proyecto. Si buscas lo ordinario, no somos tu agencia.
      </p>
      <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
        <a href={`mailto:${email}`}
          style={{ padding:'16px 40px', background: primary, color:'white',
            textDecoration:'none', borderRadius:6, fontWeight:800, fontSize:'0.9rem',
            letterSpacing:1.5, textTransform:'uppercase',
            boxShadow:`0 0 30px ${primary}40`, transition:'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 12px 40px ${primary}60` }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow=`0 0 30px ${primary}40` }}>
          ✉ ESCRIBIR EMAIL
        </a>
        {wa !== '#' && (
          <a href={wa} target="_blank" rel="noreferrer"
            style={{ padding:'16px 40px', background:'transparent', color:'white',
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:6, fontWeight:800, fontSize:'0.9rem',
              letterSpacing:1.5, textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=primary; e.currentTarget.style.color=primary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='white' }}>
            💬 WHATSAPP
          </a>
        )}
      </div>
    </section>
  )
}
