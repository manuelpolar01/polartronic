/**
 * LeadsTab.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * AÑADIDO quirúrgico:
 *  - Botón 🗑 por cada lead → elimina uno
 *  - Botón "Eliminar todos" → limpia toda la bandeja con confirmación
 *  Todo lo demás INTACTO.
 */

import { useState, useEffect, useMemo } from 'react'
import {
  collection, getDocs, updateDoc, doc, query,
  orderBy, onSnapshot, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import toast from 'react-hot-toast'

// ── Constantes ──────────────────────────────────────────────────────────
const STATI = [
  { id: 'nuovo',      label: 'Nuevo',         color: '#3B8BD4' },
  { id: 'assegnato',  label: 'Asignado',      color: '#EF9F27' },
  { id: 'trattativa', label: 'En trattativa', color: '#7F77DD' },
  { id: 'chiuso',     label: 'Cerrado',       color: '#1D9E75' },
  { id: 'perso',      label: 'Perdido',       color: '#888780' },
]

function StatoBadge({ stato }) {
  const s = STATI.find(x => x.id === stato) || STATI[0]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 1, padding: '3px 10px', borderRadius: 20,
      background: `${s.color}18`, color: s.color,
      border: `1px solid ${s.color}40`,
    }}>
      {s.label}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function exportCSV(leads) {
  const header = ['Data', 'Nome', 'Email', 'Telefono', 'Zona', 'Servizio', 'Messaggio', 'Stato', 'Agente']
  const rows = leads.map(l => [
    formatDate(l.createdAt),
    l.name || '', l.email || '', l.phone || '',
    l.zona || '', l.servizio || '',
    (l.message || '').replace(/,/g, ';'),
    l.stato || 'nuovo', l.agente || '',
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `lead_${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── Componente principale ─────────────────────────────────────────────
export default function LeadsTab({ data }) {
  const [leads,        setLeads]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [selected,     setSelected]     = useState(null)
  const [filtroStato,  setFiltroStato]  = useState('tutti')
  const [filtroZona,   setFiltroZona]   = useState('')
  const [search,       setSearch]       = useState('')
  const [noteText,     setNoteText]     = useState('')
  const [savingNote,   setSavingNote]   = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)   // ← NUEVO
  const [deletingAll,  setDeletingAll]  = useState(false)  // ← NUEVO

  const agenti = data?.site?.agents || []

  // ── Carica lead in realtime ────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('[LeadsTab]', err)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Zone uniche per filtro ─────────────────────────────────────────
  const zoneUniche = useMemo(() =>
    [...new Set(leads.map(l => l.zona).filter(Boolean))].sort(),
  [leads])

  // ── Filtri ─────────────────────────────────────────────────────────
  const leadsFiltrati = useMemo(() => {
    return leads.filter(l => {
      const matchStato  = filtroStato === 'tutti' || (l.stato || 'nuovo') === filtroStato
      const matchZona   = !filtroZona || l.zona === filtroZona
      const matchSearch = !search || [l.name, l.email, l.phone, l.zona, l.servizio]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      return matchStato && matchZona && matchSearch
    })
  }, [leads, filtroStato, filtroZona, search])

  // ── Aggiorna stato ─────────────────────────────────────────────────
  const updateStato = async (leadId, nuovoStato) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { stato: nuovoStato })
      if (selected?.id === leadId) setSelected(p => ({ ...p, stato: nuovoStato }))
      toast.success('Estado actualizado')
    } catch { toast.error('Error al actualizar') }
  }

  // ── Assegna agente ─────────────────────────────────────────────────
  const assignAgent = async (leadId, agente) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { agente, stato: 'assegnato' })
      if (selected?.id === leadId) setSelected(p => ({ ...p, agente, stato: 'assegnato' }))
      toast.success(`Asignado a ${agente}`)
    } catch { toast.error('Error al asignar') }
  }

  // ── Salva nota ─────────────────────────────────────────────────────
  const saveNote = async () => {
    if (!selected || !noteText.trim()) return
    setSavingNote(true)
    try {
      const nota = { testo: noteText.trim(), data: new Date().toISOString() }
      const nuoveNote = [...(selected.note || []), nota]
      await updateDoc(doc(db, 'leads', selected.id), { note: nuoveNote })
      setSelected(p => ({ ...p, note: nuoveNote }))
      setNoteText('')
      toast.success('Nota guardada')
    } catch { toast.error('Error') }
    finally { setSavingNote(false) }
  }

  // ── NUEVO: Eliminar un lead ────────────────────────────────────────
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('¿Eliminar este lead? Esta acción no se puede deshacer.')) return
    setDeletingId(leadId)
    try {
      await deleteDoc(doc(db, 'leads', leadId))
      if (selected?.id === leadId) setSelected(null)
      toast.success('Lead eliminado')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  // ── NUEVO: Eliminar todos los leads ───────────────────────────────
  const handleDeleteAll = async () => {
    if (!window.confirm(`¿Eliminar TODOS los ${leads.length} leads? Esta acción no se puede deshacer.`)) return
    setDeletingAll(true)
    try {
      // Firestore batch: máximo 500 por batch
      const chunks = []
      for (let i = 0; i < leads.length; i += 500) {
        chunks.push(leads.slice(i, i + 500))
      }
      for (const chunk of chunks) {
        const batch = writeBatch(db)
        chunk.forEach(lead => batch.delete(doc(db, 'leads', lead.id)))
        await batch.commit()
      }
      setSelected(null)
      toast.success(`${leads.length} leads eliminados`)
    } catch {
      toast.error('Error al eliminar todos')
    } finally {
      setDeletingAll(false)
    }
  }

  // ── Conteggi per tab stati ─────────────────────────────────────────
  const conteggioPerStato = useMemo(() => {
    const c = { tutti: leads.length }
    STATI.forEach(s => {
      c[s.id] = leads.filter(l => (l.stato || 'nuovo') === s.id).length
    })
    return c
  }, [leads])

  // ── WhatsApp URL ────────────────────────────────────────────────────
  const whatsappUrl = (phone, name) => {
    const tel = phone?.replace(/\D/g, '')
    const msg = encodeURIComponent(`Hola ${name || ''}, soy del equipo. Te contacto por tu consulta.`)
    return `https://wa.me/${tel}?text=${msg}`
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
            📥 Inbox Lead
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            {leads.length} leads totales · {conteggioPerStato.nuovo || 0} nuevos
          </p>
        </div>

        {/* Botones acción */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => exportCSV(leadsFiltrati)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            ↓ Exportar CSV
          </button>

          {/* NUEVO: Eliminar todos */}
          {leads.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff6060', padding: '8px 16px', borderRadius: 8, cursor: deletingAll ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: deletingAll ? 0.6 : 1 }}
            >
              {deletingAll ? 'Eliminando…' : `🗑 Eliminar todos (${leads.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[{ id: 'tutti', label: 'Totales', color: 'rgba(255,255,255,0.4)' }, ...STATI].map(s => (
          <button
            key={s.id}
            onClick={() => setFiltroStato(s.id)}
            style={{ background: filtroStato === s.id ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${filtroStato === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color || 'var(--primary)' }}>
              {conteggioPerStato[s.id] || 0}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* ── Filtri ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Buscar por nombre, email, teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {zoneUniche.length > 0 && (
          <select
            className="admin-input"
            style={{ width: 180 }}
            value={filtroZona}
            onChange={e => setFiltroZona(e.target.value)}
          >
            <option value="">Todas las zonas</option>
            {zoneUniche.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        )}
      </div>

      {/* ── Layout: lista + dettaglio ── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>

        {/* Lista lead */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Cargando...</div>
          )}
          {!loading && leadsFiltrati.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.25)', fontSize: 14, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
              No hay leads
            </div>
          )}
          {leadsFiltrati.map(lead => (
            <div
              key={lead.id}
              style={{ background: selected?.id === lead.id ? 'rgba(255,60,60,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected?.id === lead.id ? 'rgba(255,60,60,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '14px 16px', transition: 'all 0.15s', display: 'flex', alignItems: 'flex-start', gap: 10 }}
              onMouseEnter={e => { if (selected?.id !== lead.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { if (selected?.id !== lead.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              {/* Contenido clickeable */}
              <div
                onClick={() => { setSelected(lead); setNoteText('') }}
                style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{lead.name || 'Sin nombre'}</span>
                      <StatoBadge stato={lead.stato || 'nuovo'} />
                      {lead.agente && (
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>→ {lead.agente}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {[lead.zona, lead.servizio].filter(Boolean).join(' · ')}
                    </div>
                    {lead.email && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{lead.email}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, textAlign: 'right' }}>
                    {formatDate(lead.createdAt)}
                    {(lead.note?.length > 0) && (
                      <div style={{ marginTop: 4, color: 'rgba(255,200,0,0.5)' }}>📝 {lead.note.length}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* NUEVO: Botón eliminar individual */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id) }}
                disabled={deletingId === lead.id}
                title="Eliminar lead"
                style={{ flexShrink: 0, background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,60,60,0.18)', color: '#ff6060', width: 30, height: 30, borderRadius: 6, cursor: deletingId === lead.id ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === lead.id ? 0.4 : 1, transition: 'all 0.15s', marginTop: 2 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.16)'; e.currentTarget.style.borderColor = 'rgba(255,60,60,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,60,60,0.18)' }}
              >
                {deletingId === lead.id ? '…' : '🗑'}
              </button>
            </div>
          ))}
        </div>

        {/* Dettaglio lead — INTACTO */}
        {selected && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, position: 'sticky', top: 20, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}
              >✕</button>
            </div>

            {/* Dati contatto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Email',    value: selected.email   },
                { label: 'Teléfono',value: selected.phone   },
                { label: 'Zona',    value: selected.zona    },
                { label: 'Servicio',value: selected.servizio },
                { label: 'Fecha',   value: formatDate(selected.createdAt) },
              ].filter(r => r.value).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Messaggio */}
            {selected.message && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
                "{selected.message}"
              </div>
            )}

            {/* Azioni rapide */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {selected.phone && (
                <a href={whatsappUrl(selected.phone, selected.name)} target="_blank" rel="noreferrer"
                  style={{ flex: 1, textAlign: 'center', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                  💬 WhatsApp
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}?subject=Respuesta a tu consulta`}
                  style={{ flex: 1, textAlign: 'center', background: 'rgba(55,138,221,0.1)', border: '1px solid rgba(55,138,221,0.3)', color: '#378add', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                  ✉️ Email
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  style={{ flex: 1, textAlign: 'center', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                  📞 Llamar
                </a>
              )}
            </div>

            {/* Cambio stato */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Estado</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATI.map(s => (
                  <button key={s.id} onClick={() => updateStato(selected.id, s.id)}
                    style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: (selected.stato || 'nuovo') === s.id ? s.color : `${s.color}20`, color: (selected.stato || 'nuovo') === s.id ? 'white' : s.color, transition: 'all 0.15s' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assegna agente */}
            {agenti.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Agente asignado</div>
                <select className="admin-input" value={selected.agente || ''} onChange={e => assignAgent(selected.id, e.target.value)}>
                  <option value="">No asignado</option>
                  {agenti.map(a => (
                    <option key={a.id || a.nome} value={a.nome}>{a.nome} — {a.zone?.join(', ')}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Note interne */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Notas internas</div>
              {(selected.note || []).map((n, i) => (
                <div key={i} style={{ background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.1)', borderRadius: 6, padding: '8px 10px', fontSize: 12, marginBottom: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>{n.testo}</div>
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 3 }}>
                    {new Date(n.data).toLocaleString('es-ES')}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input className="admin-input" style={{ flex: 1 }} placeholder="Añadir nota..."
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveNote()} />
                <button className="save-btn" onClick={saveNote} disabled={savingNote || !noteText.trim()} style={{ padding: '10px 14px', fontSize: 12 }}>
                  +
                </button>
              </div>
            </div>

            {/* NUEVO: Eliminar este lead desde el detalle */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => handleDeleteLead(selected.id)}
                disabled={deletingId === selected.id}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,60,60,0.2)', color: '#ff6060', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: deletingId === selected.id ? 0.5 : 1 }}
              >
                {deletingId === selected.id ? 'Eliminando…' : '🗑 Eliminar este lead'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}