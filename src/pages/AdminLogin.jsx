import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bienvenido al panel')
      navigate('/admin')
    } catch (err) {
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#030303', padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:400, background:'#0d0d0d',
        border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'2.5rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'2rem',
            color:'#ff3c3c', letterSpacing:2 }}>POLARTRONIC</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', marginTop:6 }}>
            Panel de Administración
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
              textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Email</label>
            <input className="admin-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@polartronic.com" required />
          </div>
          <div>
            <label style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
              textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Contraseña</label>
            <input className="admin-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <button className="save-btn" type="submit" disabled={loading}
            style={{ marginTop:8, width:'100%' }}>
            {loading ? 'Entrando...' : 'ENTRAR AL PANEL →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:12,
          color:'rgba(255,255,255,0.25)', lineHeight:1.7 }}>
          En Firebase Console → Authentication → Users<br/>crea un usuario con tu email y contraseña.
        </p>
      </div>
    </div>
  )
}
