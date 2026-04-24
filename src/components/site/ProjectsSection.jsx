export default function ProjectsSection({ projects }) {
  if (!projects?.length) return null

  return (
    <section id="proyectos" style={{ padding:'100px 6%', background:'rgba(255,255,255,0.01)' }}>
      <div style={{ textAlign:'center', marginBottom:60 }}>
        <p style={{ color:'var(--primary)', fontSize:'0.75rem', fontWeight:800,
          textTransform:'uppercase', letterSpacing:4, marginBottom:12 }}>Portfolio</p>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800 }}>
          Nuestros <span style={{ color:'var(--primary)' }}>Proyectos</span>
        </h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {projects.map((proj, i) => (
          <a key={proj.id||i} href={proj.link || '#'} target="_blank" rel="noreferrer"
            style={{ display:'block', borderRadius:16, overflow:'hidden', textDecoration:'none',
              border:'1px solid rgba(255,255,255,0.07)', position:'relative',
              transition:'all 0.4s', aspectRatio:'4/3' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform   = 'scale(1.02)'
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.querySelector('.overlay').style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform   = 'scale(1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              e.currentTarget.querySelector('.overlay').style.opacity = '0'
            }}>
            {proj.image && (
              <img src={proj.image} alt={proj.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            )}
            <div className="overlay" style={{ position:'absolute', inset:0, opacity:0,
              background:'rgba(0,0,0,0.75)', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', transition:'opacity 0.3s' }}>
              <div style={{ color:'var(--primary)', fontSize:'0.75rem', fontWeight:800,
                textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>{proj.category}</div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'white' }}>{proj.title}</div>
              <div style={{ marginTop:16, color:'var(--primary)', fontSize:24 }}>↗</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
