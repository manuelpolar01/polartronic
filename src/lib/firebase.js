import { initializeApp }              from 'firebase/app'
import { getFirestore }               from 'firebase/firestore'
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// ─────────────────────────────────────────────────────────────────────
// Lee las credenciales desde variables de entorno VITE_*
// Nunca hardcodeadas aquí — nunca en git.
// En Vercel: Settings → Environment Variables
// En local: archivo .env en la raíz del proyecto
// ─────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validación en desarrollo — avisa si falta alguna variable
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length > 0) {
    console.error(
      '[Firebase] Variables de entorno faltantes:',
      missing,
      '\nCrea un archivo .env en la raíz del proyecto con las variables VITE_FIREBASE_*'
    )
  }
}

const app = initializeApp(firebaseConfig)

export const db      = getFirestore(app)
export const storage = getStorage(app)

export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)

export default app