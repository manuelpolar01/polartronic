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

// ─── Cache invalidation ───────────────────────────────────────────────
function invalidateCache() {
  try { localStorage.removeItem('polartronic_cache') } catch {}
}

// ─── SITE CONFIG ──────────────────────────────────────────────────────
export async function getSiteConfig() {
  const snap = await getDoc(doc(db, 'site', 'config'))
  return snap.exists() ? snap.data() : null
}

export async function saveSiteConfig(data) {
  await setDoc(doc(db, 'site', 'config'), data, { merge: true })
  invalidateCache()
}

// ─── ECOSYSTEMS ───────────────────────────────────────────────────────
export async function getEcosystems() {
  const snap = await getDocs(collection(db, 'ecosystems'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// FIX BUG 3: devuelve { id } para que el tab use el ID real de Firestore
export async function saveEcosystem(id, data) {
  if (id) {
    await updateDoc(doc(db, 'ecosystems', id), data)
    invalidateCache()
    return { id }
  } else {
    const ref = await addDoc(collection(db, 'ecosystems'), data)
    invalidateCache()
    return { id: ref.id }
  }
}

export async function deleteEcosystem(id) {
  await deleteDoc(doc(db, 'ecosystems', id))
  invalidateCache()
}

// ─── PROJECTS ─────────────────────────────────────────────────────────
export async function getProjects() {
  const snap = await getDocs(collection(db, 'projects'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// FIX BUG 3: devuelve { id } para que el tab use el ID real de Firestore
export async function saveProject(id, data) {
  if (id) {
    await updateDoc(doc(db, 'projects', id), data)
    invalidateCache()
    return { id }
  } else {
    const ref = await addDoc(collection(db, 'projects'), data)
    invalidateCache()
    return { id: ref.id }
  }
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, 'projects', id))
  invalidateCache()
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────
export async function getTestimonials() {
  const snap = await getDocs(collection(db, 'testimonials'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// FIX BUG 3: devuelve { id } para que el tab use el ID real de Firestore
export async function saveTestimonial(id, data) {
  if (id) {
    await updateDoc(doc(db, 'testimonials', id), data)
    invalidateCache()
    return { id }
  } else {
    const ref = await addDoc(collection(db, 'testimonials'), data)
    invalidateCache()
    return { id: ref.id }
  }
}

export async function deleteTestimonial(id) {
  await deleteDoc(doc(db, 'testimonials', id))
  invalidateCache()
}

// ─── SERVICES ─────────────────────────────────────────────────────────
export async function getServices() {
  const snap = await getDocs(collection(db, 'services'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// FIX BUG 3: devuelve { id } para que el tab use el ID real de Firestore
export async function saveService(id, data) {
  if (id) {
    await updateDoc(doc(db, 'services', id), data)
    invalidateCache()
    return { id }
  } else {
    const ref = await addDoc(collection(db, 'services'), data)
    invalidateCache()
    return { id: ref.id }
  }
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id))
  invalidateCache()
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────
export async function uploadImage(file, folder = 'images', onProgress = null) {
  if (!file) throw new Error('No se proporcionó ningún archivo')
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen válida')
  if (file.size > 10 * 1024 * 1024) throw new Error('La imagen supera los 10 MB permitidos')

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
        if (onProgress) onProgress(progress)
      },
      (error) => {
        let msg = 'Error al subir imagen'
        switch (error.code) {
          case 'storage/unauthorized':
            msg = 'Sin permisos: verifica las reglas de Storage en Firebase Console'
            break
          case 'storage/canceled':
            msg = 'Subida cancelada'
            break
          case 'storage/bucket-not-found':
            msg = 'Bucket no encontrado. Verifica storageBucket en firebase.js'
            break
          case 'storage/unknown':
            msg = 'Error desconocido. Revisa la consola de Firebase.'
            break
        }
        reject(new Error(msg))
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        } catch {
          reject(new Error('Imagen subida pero no se pudo obtener la URL'))
        }
      }
    )
  })
}