export default function EcosystemSection({ ecosystems }) {
  if (!ecosystems?.length) return null

  return (
    <section id="ecosistemas" style={{ padding:'100px 6%' }}>
      <div style={{ textAlign:'center', marginBottom:60 }}>
        <p style={{ color:'var(--primary)', fontSize:'0.75rem', fontWeight:800,
          textTransform:'uppercase', letterSpacing:4, marginBottom:12 }}>Nuestros Nichos</p>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800 }}>
          Ecosistemas <span style={{ color:'var(--primary)' }}>Vivos</span>
        </h2>
        <p style={{ color:'rgba(255,255,255,0.45)', marginTop:12 }}>
          Dominamos cada nicho con soluciones visuales a medida.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(350px,1fr))', gap:24 }}>
        {ecosystems.map((eco, i) => (
          <div key={eco.id||i} style={{ position:'relative', height:450, borderRadius:24,
            overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)',
            transition:'all 0.5s cubic-bezier(0.23,1,0.32,1)', cursor:'pointer' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform   = 'translateY(-12px)'
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.boxShadow   = '0 20px 50px rgba(0,0,0,0.7)'
              e.currentTarget.querySelector('img').style.transform = 'scale(1.1)'
              e.currentTarget.querySelector('img').style.filter    = 'brightness(0.8)'
              e.currentTarget.querySelector('.eco-desc').style.opacity   = '1'
              e.currentTarget.querySelector('.eco-desc').style.transform = 'translateY(0)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform   = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow   = 'none'
              e.currentTarget.querySelector('img').style.transform = 'scale(1)'
              e.currentTarget.querySelector('img').style.filter    = 'brightness(0.55)'
              e.currentTarget.querySelector('.eco-desc').style.opacity   = '0'
              e.currentTarget.querySelector('.eco-desc').style.transform = 'translateY(20px)'
            }}>
            <img src={eco.image} alt={eco.title}
              style={{ width:'100%', height:'100%', objectFit:'cover',
                filter:'brightness(0.55)', transition:'all 0.5s cubic-bezier(0.23,1,0.32,1)' }} />
            <div style={{ position:'absolute', inset:0, padding:40,
              display:'flex', flexDirection:'column', justifyContent:'flex-end',
              background:'linear-gradient(to top, rgba(0,0,0,0.95) 10%, transparent 70%)' }}>
              <span style={{ color:'var(--primary)', fontWeight:800, fontSize:'0.75rem',
                textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>{eco.category}</span>
              <h3 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:10 }}>{eco.title}</h3>
              <p className="eco-desc" style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.95rem',
                opacity:0, transform:'translateY(20px)',
                transition:'all 0.5s cubic-bezier(0.23,1,0.32,1)' }}>
                {eco.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
