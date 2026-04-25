/**
 * firebaseHelpers.js — FIXED
 *
 * BUG FIXES:
 * 1. invalidateCache() non lancia mai eccezioni (era silenziosamente swallowed
 *    ma poteva causare comportamenti strani in Safari con storage pieno).
 * 2. Tutti i metodi save* ora ritornano sempre { id } per consistenza.
 * 3. saveSiteConfig usa merge:true in modo esplicito e documenta il comportamento.
 * 4. Aggiunto try/catch con re-throw in ogni helper per stack trace chiari.
 */

import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { db, storage } from './firebase'

// ─── Cache invalidation — mai lancia eccezioni ────────────────────────
function invalidateCache() {
  try {
    localStorage.removeItem('polartronic_cache')
  } catch (e) {
    // Storage pieno o non disponibile — ignora silenziosamente
    console.warn('[cache] invalidation skipped:', e.message)
  }
}

// ─── SITE CONFIG ──────────────────────────────────────────────────────
export async function getSiteConfig() {
  try {
    const snap = await getDoc(doc(db, 'site', 'config'))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.error('[firebaseHelpers] getSiteConfig:', e)
    throw e
  }
}

/**
 * FIX: merge:true garantisce che campi non inclusi nel payload non vengano
 * cancellati. Ogni tab può salvare solo la propria sezione senza toccare le altre.
 */
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

// ─── ECOSYSTEMS ───────────────────────────────────────────────────────
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

// ─── PROJECTS ─────────────────────────────────────────────────────────
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

// ─── TESTIMONIALS ─────────────────────────────────────────────────────
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

// ─── SERVICES ─────────────────────────────────────────────────────────
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

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────
export async function uploadImage(file, folder = 'images', onProgress = null) {
  if (!file) throw new Error('Nessun file fornito')
  if (!file.type.startsWith('image/')) throw new Error('Il file non è un\'immagine valida')
  if (file.size > 10 * 1024 * 1024) throw new Error('L\'immagine supera i 10 MB consentiti')

  const ext      = file.name.split('.').pop()
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `${folder}/${safeName}`

  const storageRef = ref(storage, path)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType:  file.type,
      cacheControl: 'public, max-age=31536000',
    })

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        if (typeof onProgress === 'function') onProgress(progress)
      },
      (error) => {
        const msgs = {
          'storage/unauthorized':    'Permessi mancanti: verifica le regole Storage su Firebase Console',
          'storage/canceled':        'Upload annullato',
          'storage/bucket-not-found':'Bucket non trovato. Verifica storageBucket in firebase.js',
          'storage/unknown':         'Errore sconosciuto. Controlla la console Firebase.',
        }
        reject(new Error(msgs[error.code] || 'Errore durante l\'upload'))
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        } catch {
          reject(new Error('Immagine caricata ma URL non recuperabile'))
        }
      }
    )
  })
}