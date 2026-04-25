/**
 * BookingFlow.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Multi-step booking UI for BarberBook Pro.
 *
 * LANGUAGE PRIORITY (updated):
 *   1. theme_config.language  ← NEW: admin-configured language
 *   2. window.__SITE_LANGUAGE__ ← set by PublicSite/AdminPanel at mount
 *   3. navigator.language      ← browser fallback
 *   4. 'it'                    ← hard default
 *
 * All UI strings come from useUIStrings(null, resolvedLang) so every label,
 * button, month name and weekday header is correctly localised.
 *
 * Props:
 *   theme      {object}   Full theme_config object (includes theme.language)
 *   services   {Array}    Available services from Supabase
 *   onBook     {Function} Called with booking payload on confirmation
 *   onClose    {Function} Close / dismiss the flow
 */

import { useState, useMemo, useCallback } from 'react'
import { useUIStrings }                   from '../../hooks/useUIStrings'

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0') }

function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function buildCalendar(year, month) {
  const first   = new Date(year, month, 1)
  const last    = new Date(year, month + 1, 0)
  const leading = first.getDay()  // 0=Sun…6=Sat
  const days    = []
  for (let i = 0; i < leading;       i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  // Pad to complete last row
  while (days.length % 7 !== 0) days.push(null)
  return days
}

// ─────────────────────────────────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

function StepIndicator({ current, total, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3, flex: 1,
            borderRadius: 2,
            background: i < current
              ? 'var(--primary)'
              : i === current
                ? 'rgba(255,60,60,0.35)'
                : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }}
        />
      ))}
      <span style={{
        fontSize: 11, color: 'rgba(255,255,255,0.3)',
        whiteSpace: 'nowrap', marginLeft: 4,
      }}>
        {t.booking.step} {current + 1} {t.booking.of} {total}
      </span>
    </div>
  )
}

// Step 1 — Service selection
function ServiceStep({ services, selected, onSelect, t, primary }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>
        {t.booking.selectService}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(services ?? []).map(svc => {
          const isActive = selected?.id === svc.id
          return (
            <button
              key={svc.id}
              onClick={() => onSelect(svc)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                background: isActive ? `${primary}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? primary : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.18s', textAlign: 'left',
                color: 'white',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{svc.name}</div>
                {svc.description && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                    {svc.description}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                {svc.price != null && (
                  <div style={{ fontWeight: 700, color: primary, fontSize: 15 }}>
                    €{svc.price}
                  </div>
                )}
                {svc.duration && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {svc.duration} {t.booking.duration}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Step 2 — Date picker
function DateStep({ value, onChange, closedDays = [], t, primary }) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const days     = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth])
  const monthName = (t.booking.months ?? [])[viewMonth] ?? ''

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>
        {t.booking.selectDate}
      </h3>

      {/* Month header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {monthName} {viewYear}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {(t.booking.weekdays ?? []).map(wd => (
          <div key={wd} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.8,
            color: 'rgba(255,255,255,0.3)', padding: '4px 0',
          }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />
          const iso       = isoDate(d)
          const isPast    = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isClosed  = closedDays.includes(d.getDay())
          const isToday   = iso === isoDate(today)
          const isSelected= value === iso
          const disabled  = isPast || isClosed
          return (
            <button
              key={iso}
              disabled={disabled}
              onClick={() => !disabled && onChange(iso)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: isSelected
                  ? `2px solid ${primary}`
                  : isToday
                    ? '2px solid rgba(255,255,255,0.2)'
                    : '2px solid transparent',
                background: isSelected
                  ? `${primary}15`
                  : 'transparent',
                color: disabled
                  ? 'rgba(255,255,255,0.15)'
                  : isSelected
                    ? 'white'
                    : 'rgba(255,255,255,0.75)',
                fontSize: 13, fontWeight: isSelected ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const navBtnStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', width: 32, height: 32, borderRadius: 8,
  cursor: 'pointer', fontSize: 18, display: 'flex',
  alignItems: 'center', justifyContent: 'center',
}

// Step 3 — Time slot picker
function TimeStep({ slots, value, onChange, loading, t, primary }) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)' }}>
      {t.booking.loading}
    </div>
  )

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>
        {t.booking.selectTime}
      </h3>
      {(!slots || slots.length === 0) ? (
        <div style={{
          textAlign: 'center', padding: '30px 0',
          color: 'rgba(255,255,255,0.35)', fontSize: 14,
        }}>
          {t.booking.noSlots}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
          {slots.map(slot => {
            const isActive = value === slot
            return (
              <button
                key={slot}
                onClick={() => onChange(slot)}
                style={{
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: `1px solid ${isActive ? primary : 'rgba(255,255,255,0.08)'}`,
                  background: isActive ? `${primary}15` : 'rgba(255,255,255,0.03)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {slot}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Step 4 — Customer details
function DetailsStep({ values, onChange, errors, t, primary }) {
  const fields = [
    { key: 'name',  label: t.booking.name,  type: 'text',  required: true  },
    { key: 'phone', label: t.booking.phone, type: 'tel',   required: true  },
    { key: 'email', label: t.booking.email, type: 'email', required: false },
    { key: 'notes', label: t.booking.notes, type: 'text',  required: false },
  ]

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>
        {t.booking.yourDetails}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1,
              color: errors?.[f.key] ? 'rgba(255,100,100,0.8)' : 'rgba(255,255,255,0.45)',
              marginBottom: 6,
            }}>
              {f.label}
              {f.required && <span style={{ color: primary, marginLeft: 3 }}>*</span>}
            </label>
            <input
              type={f.type}
              value={values[f.key] || ''}
              onChange={e => onChange(f.key, e.target.value)}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors?.[f.key] ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, color: 'white',
                fontSize: 14, outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = primary }}
              onBlur={e  => {
                e.currentTarget.style.borderColor =
                  errors?.[f.key] ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)'
              }}
            />
            {errors?.[f.key] && (
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>
                {errors[f.key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 5 — Confirmation
function SummaryStep({ service, date, time, customer, t, primary }) {
  const rows = [
    { label: t.booking.selectService, value: service?.name },
    { label: t.booking.selectDate,    value: date           },
    { label: t.booking.selectTime,    value: time           },
    { label: t.booking.name,          value: customer.name  },
    { label: t.booking.phone,         value: customer.phone },
    customer.email && { label: t.booking.email, value: customer.email },
    customer.notes && { label: t.booking.notes, value: customer.notes },
  ].filter(Boolean)

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>
        {t.booking.summary}
      </h3>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 12,
              padding: '12px 16px',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 1, color: 'rgba(255,255,255,0.3)',
              width: 110, flexShrink: 0, paddingTop: 2,
            }}>
              {row.label}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
      {service?.price != null && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 14,
          padding: '12px 16px',
          background: `${primary}08`,
          border: `1px solid ${primary}30`,
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
            {t.booking.price}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: primary }}>
            €{service.price}
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5

export default function BookingFlow({
  theme     = {},
  services  = [],
  slots     = {},    // { [isoDate]: ['09:00','09:30',…] }
  onBook    = () => {},
  onClose   = () => {},
  slotsLoading = false,
}) {
  // ── Language — theme.language takes priority over browser ──────────
  //   window.__SITE_LANGUAGE__ is set by PublicSite when it mounts,
  //   reflecting the saved admin setting without prop drilling.
  const t       = useUIStrings(theme)
  const primary = theme?.primary_color || theme?.primary || 'var(--primary)'

  // ── Wizard state ────────────────────────────────────────────────────
  const [step,     setStep]     = useState(0)
  const [service,  setService]  = useState(null)
  const [date,     setDate]     = useState('')
  const [time,     setTime]     = useState('')
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [errors,   setErrors]   = useState({})
  const [booking,  setBooking]  = useState(false)
  const [done,     setDone]     = useState(false)

  const todaySlots = date ? (slots[date] ?? []) : []

  // ── Navigation ──────────────────────────────────────────────────────
  const canNext = useMemo(() => {
    if (step === 0) return !!service
    if (step === 1) return !!date
    if (step === 2) return !!time
    if (step === 3) return !!(customer.name?.trim() && customer.phone?.trim())
    return true
  }, [step, service, date, time, customer])

  const validateDetails = useCallback(() => {
    const errs = {}
    if (!customer.name?.trim())  errs.name  = t.contact.fieldRequired
    if (!customer.phone?.trim()) errs.phone = t.contact.fieldRequired
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errs.email = t.contact.emailInvalid
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [customer, t])

  const next = useCallback(() => {
    if (step === 3 && !validateDetails()) return
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }, [step, validateDetails])

  const back = useCallback(() => {
    if (step > 0) setStep(s => s - 1)
    else onClose()
  }, [step, onClose])

  const handleConfirm = useCallback(async () => {
    if (!validateDetails()) { setStep(3); return }
    setBooking(true)
    try {
      await onBook({ service, date, time, customer })
      setDone(true)
    } catch (e) {
      console.error('[BookingFlow] confirm error', e)
    } finally {
      setBooking(false)
    }
  }, [service, date, time, customer, onBook, validateDetails])

  // ── Success screen ──────────────────────────────────────────────────
  if (done) {
    return (
      <SuccessScreen
        t={t}
        primary={primary}
        service={service}
        date={date}
        time={time}
        onClose={onClose}
      />
    )
  }

  // ── Wizard body ─────────────────────────────────────────────────────
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 20,
      padding: 'clamp(20px,4vw,36px)',
      maxWidth: 520, width: '100%',
      margin: '0 auto',
      color: 'white',
    }}>
      {/* Progress */}
      <StepIndicator current={step} total={TOTAL_STEPS} t={t} />

      {/* Step content */}
      <div style={{ minHeight: 300 }}>
        {step === 0 && (
          <ServiceStep
            services={services} selected={service}
            onSelect={svc => { setService(svc); setStep(1) }}
            t={t} primary={primary}
          />
        )}
        {step === 1 && (
          <DateStep
            value={date}
            onChange={d => { setDate(d); setTime(''); setStep(2) }}
            closedDays={theme?.closed_days ?? [0]}  // 0=Sunday default
            t={t} primary={primary}
          />
        )}
        {step === 2 && (
          <TimeStep
            slots={todaySlots}
            value={time}
            onChange={slot => { setTime(slot); setStep(3) }}
            loading={slotsLoading}
            t={t} primary={primary}
          />
        )}
        {step === 3 && (
          <DetailsStep
            values={customer}
            onChange={(k, v) => setCustomer(p => ({ ...p, [k]: v }))}
            errors={errors}
            t={t} primary={primary}
          />
        )}
        {step === 4 && (
          <SummaryStep
            service={service} date={date} time={time} customer={customer}
            t={t} primary={primary}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'space-between' }}>
        <button
          onClick={back}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
            padding: '12px 20px', borderRadius: 10,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          ← {t.booking.back}
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={next}
            disabled={!canNext}
            style={{
              flex: 1,
              background: canNext ? primary : 'rgba(255,255,255,0.06)',
              border: 'none',
              color: canNext ? 'white' : 'rgba(255,255,255,0.2)',
              padding: '12px 24px', borderRadius: 10,
              cursor: canNext ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            {t.booking.next} →
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={booking}
            style={{
              flex: 1,
              background: booking ? `${primary}80` : primary,
              border: 'none', color: 'white',
              padding: '12px 24px', borderRadius: 10,
              cursor: booking ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: 1.2,
              fontFamily: 'inherit', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {booking ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'bookSpin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                {t.booking.loading}
              </>
            ) : (
              `✓ ${t.booking.confirm}`
            )}
          </button>
        )}
      </div>

      <style>{`@keyframes bookSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────

function SuccessScreen({ t, primary, service, date, time, onClose }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${primary}30`,
      borderRadius: 20,
      padding: 'clamp(32px,5vw,56px)',
      maxWidth: 520, width: '100%',
      margin: '0 auto', textAlign: 'center',
      color: 'white',
      animation: 'bookFadeIn 0.4s cubic-bezier(0.23,1,0.32,1) both',
    }}>
      <style>{`
        @keyframes bookFadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        @keyframes bookCheck  { from { stroke-dashoffset:60; opacity:0 } to { stroke-dashoffset:0; opacity:1 } }
      `}</style>

      {/* Checkmark circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `${primary}12`, border: `2px solid ${primary}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: `0 0 40px ${primary}20`,
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M7 16L13 22L25 10"
            stroke={primary} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="60"
            style={{ animation: 'bookCheck 0.5s 0.15s cubic-bezier(0.23,1,0.32,1) both' }}
          />
        </svg>
      </div>

      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10 }}>
        {t.booking.confirmed}
      </h2>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '14px 20px',
        margin: '20px 0',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {service?.name && (
          <div style={{ fontSize: 15, fontWeight: 700, color: primary }}>{service.name}</div>
        )}
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          {date} · {time}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.5)',
          padding: '10px 24px', borderRadius: 10,
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
      >
        ✕ Close
      </button>
    </div>
  )
}