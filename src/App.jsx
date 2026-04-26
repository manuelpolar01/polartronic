import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }     from './lib/useAuth'
import PublicSite      from './pages/PublicSite'
import AdminLogin      from './pages/AdminLogin'
import AdminPanel      from './pages/AdminPanel'
import ProposalPage    from './pages/ProposalPage'

function AuthSpinner() {
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AuthSpinner />
  if (!user)   return <Navigate to="/admin/login" replace />
  return children
}

function AdminLoginPage() {
  const { user, loading } = useAuth()
  if (loading) return <AuthSpinner />
  if (user)    return <Navigate to="/admin" replace />
  return <AdminLogin />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<PublicSite />} />
      <Route path="/proposal/:slug"  element={<ProposalPage />} />
      <Route path="/admin/login"     element={<AdminLoginPage />} />
      <Route path="/admin"           element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/admin/*"         element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  )
}