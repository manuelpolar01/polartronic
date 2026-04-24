// ╔══════════════════════════════════════════════════════════╗
// ║  FIREBASE CONFIG — reemplaza con tus credenciales reales ║
// ╚══════════════════════════════════════════════════════════╝
import { initializeApp } from 'firebase/app'
import { getFirestore }  from 'firebase/firestore'
import { getAuth }       from 'firebase/auth'
import { getStorage }    from 'firebase/storage'

const firebaseConfig = {
   apiKey: "AIzaSyCYThbHoPglpb-8RuT308pLLxo6enaRmb0",
  authDomain: "polartronic-27bf7.firebaseapp.com",
  projectId: "polartronic-27bf7",
  storageBucket: "polartronic-27bf7.firebasestorage.app",
  messagingSenderId: "218217170970",
  appId: "1:218217170970:web:d7d67d35fe98147b7469a3"
};

const app     = initializeApp(firebaseConfig)
export const db      = getFirestore(app)
export const auth    = getAuth(app)
export const storage = getStorage(app)
export default app
