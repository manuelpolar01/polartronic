import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc,
} from 'firebase/firestore'
import { db, auth } from './firebase'

function invalidateCache() {
  try {
    localStorage.removeItem('polartronic_cache')
  } catch (e) {
    console.warn('[cache] invalidation skipped:', e.message)
  }
}

export async function getSiteConfig() {
  try {
    const snap = await getDoc(doc(db, 'site', 'config'))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.error('[firebaseHelpers] getSiteConfig:', e)
    throw e
  }
}

export async function saveSiteConfig(data) {
  try {
    await setDoc(doc(db, 'site', 'config'), data, { merge: true })
    invalidateCache()
    return { ok: true }
  } catch (e) {
    console.error('[firebaseHelpers] saveSiteConfig:', e)
    throw e
  }
}

export async function getEcosystems() {
  try {
    const snap = await getDocs(collection(db, 'ecosystems'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[firebaseHelpers] getEcosystems:', e)
    throw e
  }
}

export async function saveEcosystem(id, data) {
  try {
    if (id) {
      await updateDoc(doc(db, 'ecosystems', id), data)
      invalidateCache()
      return { id }
    } else {
      const docRef = await addDoc(collection(db, 'ecosystems'), data)
      invalidateCache()
      return { id: docRef.id }
    }
  } catch (e) {
    console.error('[firebaseHelpers] saveEcosystem:', e)
    throw e
  }
}

export async function deleteEcosystem(id) {
  try {
    await deleteDoc(doc(db, 'ecosystems', id))
    invalidateCache()
  } catch (e) {
    console.error('[firebaseHelpers] deleteEcosystem:', e)
    throw e
  }
}

export async function getProjects() {
  try {
    const snap = await getDocs(collection(db, 'projects'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[firebaseHelpers] getProjects:', e)
    throw e
  }
}

export async function saveProject(id, data) {
  try {
    if (id) {
      await updateDoc(doc(db, 'projects', id), data)
      invalidateCache()
      return { id }
    } else {
      const docRef = await addDoc(collection(db, 'projects'), data)
      invalidateCache()
      return { id: docRef.id }
    }
  } catch (e) {
    console.error('[firebaseHelpers] saveProject:', e)
    throw e
  }
}

export async function deleteProject(id) {
  try {
    await deleteDoc(doc(db, 'projects', id))
    invalidateCache()
  } catch (e) {
    console.error('[firebaseHelpers] deleteProject:', e)
    throw e
  }
}

export async function getTestimonials() {
  try {
    const snap = await getDocs(collection(db, 'testimonials'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[firebaseHelpers] getTestimonials:', e)
    throw e
  }
}

export async function saveTestimonial(id, data) {
  try {
    if (id) {
      await updateDoc(doc(db, 'testimonials', id), data)
      invalidateCache()
      return { id }
    } else {
      const docRef = await addDoc(collection(db, 'testimonials'), data)
      invalidateCache()
      return { id: docRef.id }
    }
  } catch (e) {
    console.error('[firebaseHelpers] saveTestimonial:', e)
    throw e
  }
}

export async function deleteTestimonial(id) {
  try {
    await deleteDoc(doc(db, 'testimonials', id))
    invalidateCache()
  } catch (e) {
    console.error('[firebaseHelpers] deleteTestimonial:', e)
    throw e
  }
}

export async function getServices() {
  try {
    const snap = await getDocs(collection(db, 'services'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[firebaseHelpers] getServices:', e)
    throw e
  }
}

export async function saveService(id, data) {
  try {
    if (id) {
      await updateDoc(doc(db, 'services', id), data)
      invalidateCache()
      return { id }
    } else {
      const docRef = await addDoc(collection(db, 'services'), data)
      invalidateCache()
      return { id: docRef.id }
    }
  } catch (e) {
    console.error('[firebaseHelpers] saveService:', e)
    throw e
  }
}

export async function deleteService(id) {
  try {
    await deleteDoc(doc(db, 'services', id))
    invalidateCache()
  } catch (e) {
    console.error('[firebaseHelpers] deleteService:', e)
    throw e
  }
}

// ─── Comprime imagen con canvas → base64 WebP ────────────────────────
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/webp', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Error cargando imagen'))
    }

    img.src = objectUrl
  })
}

// ─── Upload imagen → Firestore (base64) — sin Firebase Storage, sin CORS ──
export async function uploadImage(file, folder = 'images', onProgress = null) {
  if (!file) throw new Error('No file provided')
  if (!file.type.startsWith('image/')) throw new Error('Not a valid image')
  if (file.size > 10 * 1024 * 1024) throw new Error('Image exceeds 10 MB')

  const user = auth.currentUser
  if (!user) throw new Error('Usuario no autenticado')

  if (typeof onProgress === 'function') onProgress(10)

  // Comprimir imagen a WebP máx 1200px
  const base64 = await compressImage(file, 1200, 0.85)

  if (typeof onProgress === 'function') onProgress(60)

  // Guardar en Firestore — colección 'images'
  // Añade la regla en Firestore:
  // match /images/{doc} { allow read: if true; allow write: if request.auth != null; }
  await addDoc(collection(db, 'images'), {
    data: base64,
    folder,
    name: file.name,
    type: 'image/webp',
    createdAt: new Date().toISOString(),
    uid: user.uid,
  })

  if (typeof onProgress === 'function') onProgress(100)

  // Devuelve el base64 directamente — funciona como src en cualquier <img>
  return base64
}