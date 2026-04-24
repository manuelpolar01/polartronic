import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

export function useAuth() {
  // undefined = todavía no sabemos (Firebase verificando)
  // null      = confirmado: no hay sesión
  // object    = confirmado: hay sesión activa
  const [user,    setUser]    = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChanged dispara UNA vez al montar con el estado real
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = async () => {
    await signOut(auth)
    // Limpiar caché del sitio al cerrar sesión (opcional pero limpio)
    try { localStorage.removeItem('polartronic_cache') } catch {}
  }

  return { user, loading, login, logout }
}