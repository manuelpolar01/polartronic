export default function TestimonialsSection({ testimonials }) {
  if (!testimonials?.length) return null

  return (
    <section id="testimonios" style={{ padding:'100px 6%' }}>
      <div style={{ textAlign:'center', marginBottom:60 }}>
        <p style={{ color:'var(--primary)', fontSize:'0.75rem', fontWeight:800,
          textTransform:'uppercase', letterSpacing:4, marginBottom:12 }}>Social Proof</p>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800 }}>
          Lo que dicen <span style={{ color:'var(--primary)' }}>nuestros clientes</span>
        </h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
        {testimonials.map((t, i) => (
          <div key={t.id||i} style={{ background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px 24px',
            transition:'all 0.3s' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,60,60,0.3)'
              e.currentTarget.style.background  = 'rgba(255,60,60,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
            }}>
            <div style={{ color:'var(--primary)', fontSize:32, marginBottom:16, lineHeight:1 }}>"</div>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15, lineHeight:1.8,
              fontStyle:'italic', marginBottom:20 }}>{t.text}</p>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:'50%',
                background:'rgba(255,60,60,0.15)', overflow:'hidden',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, flexShrink:0 }}>
                {t.avatar
                  ? <img src={t.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : '👤'}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                <div style={{ color:'var(--primary)', fontSize:12 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
