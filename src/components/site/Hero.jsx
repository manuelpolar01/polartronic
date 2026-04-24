export default function Hero({ hero, brand }) {
  const primary = brand?.primary || '#ff3c3c'
  const bg      = hero?.bgImage || 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1920&q=80'

  return (
    <section id="home" style={{
      height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      textAlign:'center', padding:'0 6%',
      background: `radial-gradient(circle at center, ${primary}10 0%, transparent 70%),
                   linear-gradient(to bottom, rgba(3,3,3,0.4), var(--bg)),
                   url('${bg}') center/cover`,
    }}>
      <div style={{ maxWidth:800 }}>
        <p className="animate-fade-up" style={{ textTransform:'uppercase', letterSpacing:5,
          color: primary, fontWeight:800, fontSize:'0.85rem', marginBottom:20 }}>
          {hero?.badge || 'Digital Creative Studio'}
        </p>
        <h1 className="animate-fade-up delay-100" style={{
          fontFamily:'Cinzel, serif', fontSize:'clamp(3rem, 8vw, 6rem)',
          lineHeight:0.95, marginBottom:24, color:'white',
        }}>
          {(hero?.headline || 'ESTÉTICA QUE VENDE.').split(' ').map((word, i, arr) => (
            <span key={i} style={{ color: i === arr.length - 1 ? primary : 'white' }}>
              {word}{' '}
            </span>
          ))}
        </h1>
        <p className="animate-fade-up delay-200" style={{ color:'rgba(255,255,255,0.55)',
          fontSize:'1.15rem', maxWidth:600, margin:'0 auto 40px', lineHeight:1.7 }}>
          {hero?.sub || 'Fusionamos el arte cinematográfico con la ingeniería web.'}
        </p>
        <a className="animate-fade-up delay-300" href="#ecosistemas"
          style={{ display:'inline-block', padding:'18px 48px', background: primary,
            color:'white', textDecoration:'none', borderRadius:5,
            fontWeight:800, fontSize:'0.9rem', letterSpacing:2, textTransform:'uppercase',
            transition:'all 0.3s', boxShadow:`0 0 40px ${primary}40` }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 12px 40px ${primary}60` }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 0 40px ${primary}40` }}>
          {hero?.cta || 'EXPLORAR ÁREAS'}
        </a>
      </div>
    </section>
  )
}
