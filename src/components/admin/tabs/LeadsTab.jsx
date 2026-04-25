/**
 * LeadsTab.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Inbox completa dei lead nel pannello admin.
 * Funzionalità:
 *  - Lista lead con stati: nuovo / assegnato / in trattativa / chiuso
 *  - Filtri per zona, stato, agente, data
 *  - Apertura WhatsApp/email direttamente dal lead
 *  - Assegnazione agente manuale
 *  - Note interne
 *  - Export CSV
 */

import { useState, useEffect, useMemo } from 'react'
import {
  collection, getDocs, updateDoc, doc, query,
  orderBy, onSnapshot,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import toast from 'react-hot-toast'

// ── Costanti ──────────────────────────────────────────────────────────
const STATI = [
  { id: 'nuovo',       label: 'Nuovo',        color: '#3B8BD4' },
  { id: 'assegnato',   label: 'Assegnato',    color: '#EF9F27' },
  { id: 'trattativa',  label: 'In trattativa',color: '#7F77DD' },
  { id: 'chiuso',      label: 'Chiuso',       color: '#1D9E75' },
  { id: 'perso',       label: 'Perso',        color: '#888780' },
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

  // Agenti disponibili dal site config
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
      const matchStato = filtroStato === 'tutti' || (l.stato || 'nuovo') === filtroStato
      const matchZona  = !filtroZona || l.zona === filtroZona
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
      toast.success('Stato aggiornato')
    } catch { toast.error('Errore aggiornamento') }
  }

  // ── Assegna agente ─────────────────────────────────────────────────
  const assignAgent = async (leadId, agente) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        agente, stato: 'assegnato',
      })
      if (selected?.id === leadId) setSelected(p => ({ ...p, agente, stato: 'assegnato' }))
      toast.success(`Assegnato a ${agente}`)
    } catch { toast.error('Errore assegnazione') }
  }

  // ── Salva nota ─────────────────────────────────────────────────────
  const saveNote = async () => {
    if (!selected || !noteText.trim()) return
    setSavingNote(true)
    try {
      const nota = {
        testo: noteText.trim(),
        data: new Date().toISOString(),
      }
      const nuoveNote = [...(selected.note || []), nota]
      await updateDoc(doc(db, 'leads', selected.id), { note: nuoveNote })
      setSelected(p => ({ ...p, note: nuoveNote }))
      setNoteText('')
      toast.success('Nota salvata')
    } catch { toast.error('Errore') }
    finally { setSavingNote(false) }
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
    const msg = encodeURIComponent(`Ciao ${name || ''}, sono del team Polartronic. La contatto riguardo alla sua richiesta.`)
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
            {leads.length} lead totali · {conteggioPerStato.nuovo || 0} nuovi
          </p>
        </div>
        <button
          onClick={() => exportCSV(leadsFiltrati)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)',
            padding: '8px 16px', borderRadius: 8,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}
        >
          ↓ Esporta CSV
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[{ id: 'tutti', label: 'Totali', color: 'rgba(255,255,255,0.4)' }, ...STATI].map(s => (
          <button
            key={s.id}
            onClick={() => setFiltroStato(s.id)}
            style={{
              background: filtroStato === s.id ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${filtroStato === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 10, padding: '12px 10px',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}
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
          placeholder="Cerca per nome, email, telefono..."
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
            <option value="">Tutte le zone</option>
            {zoneUniche.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        )}
      </div>

      {/* ── Layout: lista + dettaglio ── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>

        {/* Lista lead */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
              Caricamento...
            </div>
          )}
          {!loading && leadsFiltrati.length === 0 && (
            <div style={{
              textAlign: 'center', padding: 40,
              color: 'rgba(255,255,255,0.25)', fontSize: 14,
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              Nessun lead trovato
            </div>
          )}
          {leadsFiltrati.map(lead => (
            <div
              key={lead.id}
              onClick={() => { setSelected(lead); setNoteText('') }}
              style={{
                background: selected?.id === lead.id
                  ? 'rgba(255,60,60,0.06)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selected?.id === lead.id ? 'rgba(255,60,60,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, padding: '14px 16px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (selected?.id !== lead.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { if (selected?.id !== lead.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{lead.name || 'Senza nome'}</span>
                    <StatoBadge stato={lead.stato || 'nuovo'} />
                    {lead.agente && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                        → {lead.agente}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    {[lead.zona, lead.servizio].filter(Boolean).join(' · ')}
                  </div>
                  {lead.email && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                      {lead.email}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, textAlign: 'right' }}>
                  {formatDate(lead.createdAt)}
                  {(lead.note?.length > 0) && (
                    <div style={{ marginTop: 4, color: 'rgba(255,200,0,0.5)' }}>
                      📝 {lead.note.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dettaglio lead */}
        {selected && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: 20,
            position: 'sticky', top: 20, alignSelf: 'start',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18,
                }}
              >✕</button>
            </div>

            {/* Dati contatto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Email', value: selected.email },
                { label: 'Telefono', value: selected.phone },
                { label: 'Zona', value: selected.zona },
                { label: 'Servizio', value: selected.servizio },
                { label: 'Data', value: formatDate(selected.createdAt) },
              ].filter(r => r.value).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Messaggio */}
            {selected.message && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 13, color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6, marginBottom: 16,
              }}>
                "{selected.message}"
              </div>
            )}

            {/* Azioni rapide */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {selected.phone && (
                <a
                  href={whatsappUrl(selected.phone, selected.name)}
                  target="_blank" rel="noreferrer"
                  style={{
                    flex: 1, textAlign: 'center',
                    background: 'rgba(37,211,102,0.1)',
                    border: '1px solid rgba(37,211,102,0.3)',
                    color: '#25d366', padding: '8px 12px',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  💬 WhatsApp
                </a>
              )}
              {selected.email && (
                <a
                  href={`mailto:${selected.email}?subject=Risposta alla tua richiesta — Polartronic`}
                  style={{
                    flex: 1, textAlign: 'center',
                    background: 'rgba(55,138,221,0.1)',
                    border: '1px solid rgba(55,138,221,0.3)',
                    color: '#378add', padding: '8px 12px',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  ✉️ Email
                </a>
              )}
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  style={{
                    flex: 1, textAlign: 'center',
                    background: 'rgba(29,158,117,0.1)',
                    border: '1px solid rgba(29,158,117,0.3)',
                    color: '#1D9E75', padding: '8px 12px',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  📞 Chiama
                </a>
              )}
            </div>

            {/* Cambio stato */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Stato
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATI.map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateStato(selected.id, s.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 11,
                      fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: (selected.stato || 'nuovo') === s.id
                        ? s.color
                        : `${s.color}20`,
                      color: (selected.stato || 'nuovo') === s.id
                        ? 'white'
                        : s.color,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assegna agente */}
            {agenti.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Agente assegnato
                </div>
                <select
                  className="admin-input"
                  value={selected.agente || ''}
                  onChange={e => assignAgent(selected.id, e.target.value)}
                >
                  <option value="">Non assegnato</option>
                  {agenti.map(a => (
                    <option key={a.id || a.nome} value={a.nome}>{a.nome} — {a.zone?.join(', ')}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Note interne */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Note interne
              </div>
              {(selected.note || []).map((n, i) => (
                <div key={i} style={{
                  background: 'rgba(255,200,0,0.04)',
                  border: '1px solid rgba(255,200,0,0.1)',
                  borderRadius: 6, padding: '8px 10px',
                  fontSize: 12, marginBottom: 6,
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>{n.testo}</div>
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 3 }}>
                    {new Date(n.data).toLocaleString('it-IT')}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  className="admin-input"
                  style={{ flex: 1 }}
                  placeholder="Aggiungi nota..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveNote()}
                />
                <button
                  className="save-btn"
                  onClick={saveNote}
                  disabled={savingNote || !noteText.trim()}
                  style={{ padding: '10px 14px', fontSize: 12 }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}