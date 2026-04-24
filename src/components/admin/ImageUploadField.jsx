import { useState } from 'react'
import { uploadImage } from '../../lib/firebaseHelpers'
import toast from 'react-hot-toast'

export default function ImageUploadField({ value, onChange, label = 'Imagen', folder = 'images' }) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
      toast.success('Imagen subida ✓')
    } catch {
      toast.error('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
        textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
        {label}
      </label>

      {value && (
        <div style={{ marginBottom:10, borderRadius:8, overflow:'hidden',
          border:'1px solid rgba(255,255,255,0.1)', maxHeight:160 }}>
          <img src={value} alt="" style={{ width:'100%', height:160, objectFit:'cover' }} />
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <input className="admin-input" style={{ flex:1 }}
          placeholder="URL de imagen (https://...)"
          value={value || ''} onChange={e => onChange(e.target.value)} />
        <label style={{ display:'flex', alignItems:'center', gap:6,
          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          padding:'0 14px', borderRadius:8, cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize:12, color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap',
          opacity: uploading ? 0.5 : 1 }}>
          {uploading ? '⏳ Subiendo...' : '📁 Subir'}
          <input type="file" accept="image/*" style={{ display:'none' }}
            onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}
