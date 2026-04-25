import { useState } from 'react'
import { uploadImage } from '../../lib/firebaseHelpers'
import toast from 'react-hot-toast'

export default function ImageUploadField({
  value,
  onChange,
  label = 'Imagen',
  folder = 'images',
}) {
  const [uploading, setUploading]   = useState(false)
  const [progress, setProgress]     = useState(0)
  const [dragOver, setDragOver]     = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen supera los 10 MB')
      return
    }

    setUploading(true)
    setProgress(0)

    const toastId = toast.loading('Subiendo imagen…')

    try {
      const url = await uploadImage(file, folder, (pct) => {
        setProgress(pct)
        toast.loading(`Subiendo… ${pct}%`, { id: toastId })
      })
      onChange(url)
      toast.success('Imagen subida ✓', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Error al subir imagen', { id: toastId })
      console.error('[ImageUploadField]', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleInputChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        display: 'block',
        marginBottom: 6,
      }}>
        {label}
      </label>

      {/* Preview */}
      {value && (
        <div style={{
          marginBottom: 10,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          height: 140,
        }}>
          <img
            src={value}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: 28, height: 28,
              borderRadius: '50%', cursor: 'pointer',
              fontSize: 13, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
            title="Quitar imagen"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 10,
          padding: '14px 16px',
          background: dragOver ? 'rgba(255,60,60,0.05)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          className="admin-input"
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="URL de imagen (https://...)"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={uploading}
        />

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: uploading ? 'rgba(255,60,60,0.05)' : 'rgba(255,60,60,0.12)',
          border: '1px solid rgba(255,60,60,0.3)',
          padding: '9px 16px',
          borderRadius: 8,
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: 12,
          color: uploading ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
          whiteSpace: 'nowrap',
          opacity: uploading ? 0.6 : 1,
          transition: 'all 0.2s',
          flexShrink: 0,
        }}>
          {uploading ? `${progress}%` : '📁 Subir'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleInputChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Barra de progreso */}
      {uploading && (
        <div style={{
          marginTop: 8,
          height: 3,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--primary)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      <p style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        marginTop: 6,
      }}>
        Arrastra una imagen aquí o haz clic en "Subir". Máx 10 MB.
      </p>
    </div>
  )
}