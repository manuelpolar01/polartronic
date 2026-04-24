import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

// ─── Cache invalidation ───────────────────────────────────────────────
// Llama esto después de cualquier escritura para que la próxima
// carga del sitio público obtenga datos frescos de Firestore.
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

export async function saveEcosystem(id, data) {
  if (id) {
    await updateDoc(doc(db, 'ecosystems', id), data)
  } else {
    await addDoc(collection(db, 'ecosystems'), data)
  }
  invalidateCache()
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

export async function saveProject(id, data) {
  if (id) {
    await updateDoc(doc(db, 'projects', id), data)
  } else {
    await addDoc(collection(db, 'projects'), data)
  }
  invalidateCache()
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

export async function saveTestimonial(id, data) {
  if (id) {
    await updateDoc(doc(db, 'testimonials', id), data)
  } else {
    await addDoc(collection(db, 'testimonials'), data)
  }
  invalidateCache()
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

export async function saveService(id, data) {
  if (id) {
    await updateDoc(doc(db, 'services', id), data)
  } else {
    await addDoc(collection(db, 'services'), data)
  }
  invalidateCache()
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id))
  invalidateCache()
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────
export async function uploadImage(file, folder = 'images') {
  const path = `${folder}/${Date.now()}_${file.name}`
  const r    = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}