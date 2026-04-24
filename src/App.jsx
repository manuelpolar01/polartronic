import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import PublicSite  from './pages/PublicSite'
import AdminLogin  from './pages/AdminLogin'
import AdminPanel  from './pages/AdminPanel'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#030303',
    }}>
      <div style={{
        width: 36, height: 36, border: '3px solid rgba(255,60,60,0.3)',
        borderTopColor: '#ff3c3c', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  return user ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<PublicSite />} />
      <Route path="/admin/login"  element={<AdminLogin />} />
      <Route path="/admin/*"      element={
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
