/**
 * LanguageTab.jsx — FIXED
 *
 * BUG FIXES:
 * 1. Rimosso `await import()` dinamico a top-level (non funziona in moduli non-async).
 *    saveSiteConfig viene importato staticamente come tutti gli altri tab.
 * 2. setSite ora mergia correttamente invece di sostituire l'intero oggetto.
 * 3. window.__SITE_LANGUAGE__ aggiornato prima del toast per evitare race condition.
 */

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { SUPPORTED_LANGUAGES, getStrings } from '../../../lib/uiStrings'
import { saveSiteConfig } from '../../../lib/firebaseHelpers'

export default function LanguageTab({ data = {}, onSave }) {
  const isBB   = !!data.theme
  const source = isBB ? data.theme?.language : data.site?.brand?.language
  const setter = isBB ? data.setTheme        : data.setSite

  const [selected, setSelected] = useState(source ?? 'it')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(source ?? 'it')

  const handleSelect = useCallback((code) => setSelected(code), [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (typeof onSave === 'function') {
        await onSave(selected)
      } else {
        // FIX: mergia solo brand.language, non sovrascrive tutto il site
        await saveSiteConfig({ brand: { language: selected } })
        setter?.(prev => ({
          ...prev,
          brand: { ...(prev?.brand || {}), language: selected },
        }))
      }

      // FIX: aggiorna window PRIMA del toast
      if (typeof window !== 'undefined') {
        window.__SITE_LANGUAGE__ = selected
      }

      setSaved(selected)
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === selected)
      toast.success(`Lingua salvata: ${lang?.flag} ${lang?.label}`)
    } catch (err) {
      console.error('[LanguageTab] save error:', err)
      toast.error('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }, [selected, onSave, setter])

  const current   = SUPPORTED_LANGUAGES.find(l => l.code === selected)
  const hasChange = selected !== saved

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
          🌐 Lingua del Sito
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6 }}>
          Scegli la lingua predefinita per tutti i testi dell'interfaccia pubblica.
          I contenuti personalizzati (titoli, descrizioni) non vengono tradotti automaticamente.
        </p>
      </div>

      {/* Language grid */}
      <div className="section-card">
        <h3 style={{
          fontSize: 12, fontWeight: 700, marginBottom: 18,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: 1.5,
        }}>
          Seleziona lingua
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {SUPPORTED_LANGUAGES.map(lang => {
            const isActive = selected === lang.code
            const isSaved  = saved === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 12,
                  border: isActive
                    ? '2px solid var(--primary)'
                    : '2px solid rgba(255,255,255,0.07)',
                  background: isActive
                    ? 'rgba(255,60,60,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', transition: 'all 0.18s',
                  textAlign: 'left', position: 'relative', overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
                  {lang.flag}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: isActive ? 700 : 500, fontSize: 14,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                    lineHeight: 1.2,
                  }}>
                    {lang.label}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1.2,
                    color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.25)',
                    marginTop: 2,
                  }}>
                    {lang.code}
                  </div>
                </div>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 8, right: 10,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)',
                  }} />
                )}
                {isSaved && !isActive && (
                  <div style={{
                    position: 'absolute', top: 8, right: 10,
                    fontSize: 10, color: 'rgba(255,255,255,0.3)',
                  }}>
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="section-card" style={{ marginTop: 0 }}>
        <h3 style={{
          fontSize: 12, fontWeight: 700, marginBottom: 16,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: 1.5,
        }}>
          Anteprima — {current?.flag} {current?.label}
        </h3>
        <StringPreview lang={selected} />
      </div>

      {/* Info */}
      <div style={{
        background: 'rgba(255,200,0,0.04)',
        border: '1px solid rgba(255,200,0,0.15)',
        borderRadius: 10, padding: '14px 18px',
        fontSize: 12, color: 'rgba(255,200,0,0.7)',
        lineHeight: 1.7, marginBottom: 20,
      }}>
        <strong>Come funziona:</strong> Tutti i testi UI (nav, bottoni, form, prenotazione)
        vengono tradotti automaticamente. I contenuti personalizzati restano invariati.
        Attivo immediatamente dopo il salvataggio senza ricaricare la pagina.
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !hasChange}
          style={{ opacity: (!hasChange && !saving) ? 0.45 : 1 }}
        >
          {saving
            ? '💾 Salvataggio…'
            : `💾 SALVA — ${current?.flag} ${current?.label}`}
        </button>

        {!hasChange && saved && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            ✓ Già salvato:{' '}
            {SUPPORTED_LANGUAGES.find(l => l.code === saved)?.flag}{' '}
            {SUPPORTED_LANGUAGES.find(l => l.code === saved)?.label}
          </span>
        )}
      </div>
    </div>
  )
}

function StringPreview({ lang }) {
  const t = getStrings(lang)

  const rows = [
    { section: 'Navigazione',  samples: [t.nav.home, t.nav.services, t.nav.projects, t.nav.contact, t.nav.booking] },
    { section: 'Hero',         samples: [t.hero.badge, t.hero.exploreCta] },
    { section: 'Sezioni',      samples: [t.services.eyebrow, t.projects.eyebrow, t.testimonials.eyebrow] },
    { section: 'Contatto',     samples: [t.contact.eyebrow, t.contact.sendBtn] },
    { section: 'Prenotazione', samples: [t.booking.title, t.booking.selectService, t.booking.confirm] },
    { section: 'Calendario',   samples: [...(t.booking.weekdays ?? []).slice(0, 4), '|', ...(t.booking.months?.slice(0, 3) ?? [])] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map(row => (
        <div key={row.section} style={{
          display: 'grid', gridTemplateColumns: '110px 1fr',
          gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', paddingTop: 2,
          }}>
            {row.section}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {row.samples.filter(Boolean).map((s, i) => (
              s === '|'
                ? <span key={`sep-${i}`} style={{ color: 'rgba(255,255,255,0.1)', alignSelf: 'center' }}>·</span>
                : (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, padding: '3px 9px',
                    fontSize: 12, color: 'rgba(255,255,255,0.65)',
                    whiteSpace: 'nowrap',
                  }}>
                    {s}
                  </span>
                )
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}