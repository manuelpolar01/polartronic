import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import PublicSite  from './pages/PublicSite'
import AdminLogin  from './pages/AdminLogin'
import AdminPanel  from './pages/AdminPanel'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  console.log('[ProtectedRoute] loading:', loading, '| user:', user)

  // SIEMPRE esperar a que Firebase confirme el estado
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#030303', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(255,60,60,0.3)',
          borderTopColor: '#ff3c3c', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Verificando sesión…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Solo después de loading=false evaluamos user
  if (!user) {
    console.log('[ProtectedRoute] No user → redirect to /admin/login')
    return <Navigate to="/admin/login" replace />
  }

  console.log('[ProtectedRoute] User confirmed → rendering panel')
  return children
}

function AdminLoginPage() {
  const { user, loading } = useAuth()

  console.log('[AdminLoginPage] loading:', loading, '| user:', user)

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#030303', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(255,60,60,0.3)',
          borderTopColor: '#ff3c3c', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Verificando sesión…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Ya logueado → al panel
  if (user) {
    console.log('[AdminLoginPage] Already logged in → redirect to /admin')
    return <Navigate to="/admin" replace />
  }

  return <AdminLogin />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<PublicSite />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin"       element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/admin/*"     element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
    </Routes>
  )
}