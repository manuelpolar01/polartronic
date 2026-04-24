export default function AdminHeader({ onLogout, onToggleSidebar }) {
  return (
    <header style={{ height:60, background:'#080808', borderBottom:'1px solid rgba(255,255,255,0.07)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 2rem', flexShrink:0 }}>
      <button onClick={onToggleSidebar} style={{ background:'none', border:'none',
        color:'rgba(255,255,255,0.5)', fontSize:20, cursor:'pointer', padding:4 }}>
        ☰
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Panel de Control</span>
        <button onClick={onLogout} style={{ background:'rgba(255,60,60,0.1)',
          border:'1px solid rgba(255,60,60,0.3)', color:'#ff3c3c',
          padding:'6px 16px', borderRadius:6, fontSize:12, cursor:'pointer', fontWeight:600 }}>
          Salir
        </button>
      </div>
    </header>
  )
}
