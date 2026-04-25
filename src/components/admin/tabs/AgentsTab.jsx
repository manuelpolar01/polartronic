/**
 * AgentsTab.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Gestione agenti commerciali dal pannello admin.
 * Ogni agente ha: nome, zone coperte, canale preferito, WhatsApp, email, SMS
 * Gli agenti sono salvati in site/config.agents (array)
 */

import { useState } from 'react'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'
import FieldGroup from '../FieldGroup'
import toast from 'react-hot-toast'

const CANALI = ['WhatsApp', 'Email', 'SMS', 'Tutti']

const EMPTY_AGENT = {
  id: '',
  nome: '',
  zone: [],
  canalePreferito: 'WhatsApp',
  whatsapp: '',
  email: '',
  phone: '',
  attivo: true,
}

export default function AgentsTab({ data }) {
  const { site, setSite } = data
  const [agents, setAgents]   = useState(() =>
    JSON.parse(JSON.stringify(site?.agents || []))
  )
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY_AGENT)
  const [zoneInput,setZoneInput]= useState('')
  const [saving,   setSaving]   = useState(false)

  const startNew  = () => {
    setForm({ ...EMPTY_AGENT, id: `agent_${Date.now()}` })
    setZoneInput('')
    setEditing('new')
  }
  const startEdit = (agent, idx) => {
    setForm({ ...EMPTY_AGENT, ...agent })
    setZoneInput((agent.zone || []).join(', '))
    setEditing(idx)
  }
  const cancel = () => setEditing(null)

  const parseZone = (str) =>
    str.split(',').map(z => z.trim()).filter(Boolean)

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error('Il nome è obbligatorio'); return }
    setSaving(true)
    try {
      const agentData = { ...form, zone: parseZone(zoneInput) }
      let updated
      if (editing === 'new') {
        updated = [...agents, agentData]
      } else {
        updated = agents.map((a, i) => i === editing ? agentData : a)
      }
      await saveSiteConfig({ agents: updated })
      setSite(prev => ({ ...prev, agents: updated }))
      setAgents(updated)
      toast.success('Agente salvato ✓')
      setEditing(null)
    } catch (err) {
      console.error(err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idx) => {
    const updated = agents.filter((_, i) => i !== idx)
    try {
      await saveSiteConfig({ agents: updated })
      setSite(prev => ({ ...prev, agents: updated }))
      setAgents(updated)
      toast.success('Agente eliminato')
    } catch { toast.error('Errore') }
  }

  const toggleAttivo = async (idx) => {
    const updated = agents.map((a, i) =>
      i === idx ? { ...a, attivo: !a.attivo } : a
    )
    try {
      await saveSiteConfig({ agents: updated })
      setSite(prev => ({ ...prev, agents: updated }))
      setAgents(updated)
    } catch { toast.error('Errore') }
  }

  const canaleBadge = (c) => ({
    WhatsApp: { bg: 'rgba(37,211,102,0.12)', color: '#25d366' },
    Email:    { bg: 'rgba(55,138,221,0.12)', color: '#378add' },
    SMS:      { bg: 'rgba(239,159,39,0.12)', color: '#EF9F27' },
    Tutti:    { bg: 'rgba(127,119,221,0.12)', color: '#7F77DD' },
  }[c] || { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
            👥 Agenti Commerciali
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Configura gli agenti per zona. I lead vengono assegnati in base alla zona del cliente.
          </p>
        </div>
        {editing === null && (
          <button className="save-btn" onClick={startNew}>+ NUOVO AGENTE</button>
        )}
      </div>

      {/* Form editing */}
      {editing !== null && (
        <div className="section-card" style={{ border: '1px solid rgba(255,60,60,0.3)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#ff3c3c' }}>
            {editing === 'new' ? '+ Nuovo Agente' : `Modifica: ${form.nome}`}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldGroup label="Nome e Cognome *">
              <input className="admin-input" value={form.nome}
                onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                placeholder="Mario Rossi" />
            </FieldGroup>
            <FieldGroup label="Canale preferito per notifiche">
              <select className="admin-input" value={form.canalePreferito}
                onChange={e => setForm(p => ({ ...p, canalePreferito: e.target.value }))}>
                {CANALI.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FieldGroup>
          </div>

          <FieldGroup
            label="Zone coperte (separate da virgola)"
            hint="Es: Milano, Monza, Sesto San Giovanni, Cinisello"
          >
            <input className="admin-input" value={zoneInput}
              onChange={e => setZoneInput(e.target.value)}
              placeholder="Milano, Monza, Sesto San Giovanni" />
          </FieldGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FieldGroup label="WhatsApp (con prefisso)">
              <input className="admin-input" value={form.whatsapp}
                onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                placeholder="+39 333 1234567" />
            </FieldGroup>
            <FieldGroup label="Email">
              <input className="admin-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="mario@agenzia.com" />
            </FieldGroup>
            <FieldGroup label="Telefono / SMS">
              <input className="admin-input" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+39 333 1234567" />
            </FieldGroup>
          </div>

          <FieldGroup label="Attivo">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!form.attivo}
                onChange={e => setForm(p => ({ ...p, attivo: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Agente attivo — riceve notifiche dei nuovi lead nella sua zona
              </span>
            </label>
          </FieldGroup>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Agente'}
            </button>
            <button onClick={cancel} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', padding: '10px 20px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
            }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista agenti */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agents.length === 0 && editing === null && (
          <div style={{
            textAlign: 'center', padding: 40,
            color: 'rgba(255,255,255,0.25)', fontSize: 14,
            border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12,
          }}>
            Nessun agente configurato. Aggiungine uno per abilitare l'assegnazione automatica.
          </div>
        )}
        {agents.map((agent, idx) => {
          const badge = canaleBadge(agent.canalePreferito)
          return (
            <div key={agent.id || idx} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${agent.attivo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
              borderRadius: 12, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: agent.attivo ? 1 : 0.5,
            }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,60,60,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, flexShrink: 0,
                color: 'var(--primary)',
              }}>
                {(agent.nome || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{agent.nome}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    background: badge.bg, color: badge.color, fontWeight: 700,
                  }}>
                    {agent.canalePreferito}
                  </span>
                  {!agent.attivo && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>• inattivo</span>
                  )}
                </div>
                {agent.zone?.length > 0 && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    📍 {agent.zone.join(' · ')}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  {agent.whatsapp && <span style={{ fontSize: 11, color: '#25d366' }}>💬 {agent.whatsapp}</span>}
                  {agent.email    && <span style={{ fontSize: 11, color: '#378add' }}>✉️ {agent.email}</span>}
                </div>
              </div>

              {/* Azioni */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => toggleAttivo(idx)}
                  title={agent.attivo ? 'Disattiva' : 'Attiva'}
                  style={{
                    background: agent.attivo ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${agent.attivo ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: agent.attivo ? '#1D9E75' : 'rgba(255,255,255,0.3)',
                    padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                  }}
                >
                  {agent.attivo ? '✓ Attivo' : '○ Inattivo'}
                </button>
                <button onClick={() => startEdit(agent, idx)} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                }}>✏️</button>
                <button onClick={() => handleDelete(idx)} style={{
                  background: 'rgba(255,60,60,0.08)',
                  border: '1px solid rgba(255,60,60,0.2)',
                  color: '#ff3c3c', padding: '6px 12px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11,
                }}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota informativa */}
      {agents.length > 0 && (
        <div style={{
          marginTop: 20, background: 'rgba(55,138,221,0.04)',
          border: '1px solid rgba(55,138,221,0.15)',
          borderRadius: 10, padding: '12px 16px',
          fontSize: 12, color: 'rgba(55,138,221,0.7)', lineHeight: 1.7,
        }}>
          <strong>Come funziona l'assegnazione:</strong> Quando arriva un lead, il sistema cerca
          un agente attivo la cui zona coperta corrisponde alla città inserita nel form.
          Se trovato, riceve notifica sul suo canale preferito. Puoi sempre assegnare manualmente
          dalla sezione Inbox Lead.
        </div>
      )}
    </div>
  )
}