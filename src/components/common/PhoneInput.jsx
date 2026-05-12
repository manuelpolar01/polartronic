/**
 * PhoneInput.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Input de teléfono con:
 *  - Selector de país con bandera + prefijo
 *  - Validación de longitud exacta por país
 *  - Máscara de formato automática
 *  - 100% responsivo
 *  - Sin dependencias externas
 *
 * Props:
 *   value       {string}   Número completo con prefijo (ej: "+39 333 123 4567")
 *   onChange    {Function} (fullNumber: string) => void
 *   error       {string}   Mensaje de error opcional
 *   primary     {string}   Color primario del tema
 *   placeholder {string}   Placeholder personalizado
 */

// ─── Países: [código, bandera, prefijo, longitud dígitos sin prefijo, máscara] ──
// máscara: '0' = dígito, ' '/'-'/'(' = literal
const COUNTRIES = [
  { code: 'IT', flag: '🇮🇹', prefix: '+39',  digits: 10, mask: '000 000 0000',     name: 'Italia'          },
  { code: 'ES', flag: '🇪🇸', prefix: '+34',  digits: 9,  mask: '000 000 000',      name: 'España'          },
  { code: 'FR', flag: '🇫🇷', prefix: '+33',  digits: 9,  mask: '0 00 00 00 00',    name: 'France'          },
  { code: 'DE', flag: '🇩🇪', prefix: '+49',  digits: 10, mask: '0000 0000000',     name: 'Deutschland'     },
  { code: 'PT', flag: '🇵🇹', prefix: '+351', digits: 9,  mask: '000 000 000',      name: 'Portugal'        },
  { code: 'CH', flag: '🇨🇭', prefix: '+41',  digits: 9,  mask: '00 000 00 00',     name: 'Schweiz'         },
  { code: 'GB', flag: '🇬🇧', prefix: '+44',  digits: 10, mask: '0000 000000',      name: 'United Kingdom'  },
  { code: 'US', flag: '🇺🇸', prefix: '+1',   digits: 10, mask: '(000) 000-0000',   name: 'United States'   },
  { code: 'AR', flag: '🇦🇷', prefix: '+54',  digits: 10, mask: '(000) 000-0000',   name: 'Argentina'       },
  { code: 'MX', flag: '🇲🇽', prefix: '+52',  digits: 10, mask: '(000) 000-0000',   name: 'México'          },
  { code: 'BR', flag: '🇧🇷', prefix: '+55',  digits: 11, mask: '(00) 00000-0000',  name: 'Brasil'          },
  { code: 'CO', flag: '🇨🇴', prefix: '+57',  digits: 10, mask: '000 000 0000',     name: 'Colombia'        },
  { code: 'NL', flag: '🇳🇱', prefix: '+31',  digits: 9,  mask: '00 000 0000',      name: 'Nederland'       },
  { code: 'BE', flag: '🇧🇪', prefix: '+32',  digits: 9,  mask: '000 00 00 00',     name: 'Belgique'        },
  { code: 'AT', flag: '🇦🇹', prefix: '+43',  digits: 10, mask: '000 000 0000',     name: 'Österreich'      },
  { code: 'PL', flag: '🇵🇱', prefix: '+48',  digits: 9,  mask: '000 000 000',      name: 'Polska'          },
  { code: 'RO', flag: '🇷🇴', prefix: '+40',  digits: 9,  mask: '000 000 000',      name: 'România'         },
  { code: 'RU', flag: '🇷🇺', prefix: '+7',   digits: 10, mask: '(000) 000-00-00',  name: 'Россия'          },
  { code: 'TR', flag: '🇹🇷', prefix: '+90',  digits: 10, mask: '(000) 000 0000',   name: 'Türkiye'         },
  { code: 'AE', flag: '🇦🇪', prefix: '+971', digits: 9,  mask: '00 000 0000',      name: 'الإمارات'        },
  { code: 'SA', flag: '🇸🇦', prefix: '+966', digits: 9,  mask: '00 000 0000',      name: 'السعودية'        },
  { code: 'CN', flag: '🇨🇳', prefix: '+86',  digits: 11, mask: '000 0000 0000',    name: '中国'            },
  { code: 'JP', flag: '🇯🇵', prefix: '+81',  digits: 10, mask: '00-0000-0000',     name: '日本'            },
  { code: 'IN', flag: '🇮🇳', prefix: '+91',  digits: 10, mask: '00000 00000',      name: 'India'           },
  { code: 'AU', flag: '🇦🇺', prefix: '+61',  digits: 9,  mask: '000 000 000',      name: 'Australia'       },
  { code: 'CA', flag: '🇨🇦', prefix: '+1',   digits: 10, mask: '(000) 000-0000',   name: 'Canada'          },
  { code: 'ZA', flag: '🇿🇦', prefix: '+27',  digits: 9,  mask: '00 000 0000',      name: 'South Africa'    },
  { code: 'NG', flag: '🇳🇬', prefix: '+234', digits: 10, mask: '000 000 0000',     name: 'Nigeria'         },
  { code: 'MA', flag: '🇲🇦', prefix: '+212', digits: 9,  mask: '000-000000',       name: 'المغرب'          },
]

/**
 * Aplica la máscara al string de dígitos
 * Ejemplo: digits="3331234567", mask="000 000 0000" → "333 123 4567"
 */
function applyMask(digits, mask) {
  let result = ''
  let di = 0
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === '0') {
      result += digits[di++]
    } else {
      result += mask[i]
      // Si el siguiente char de la máscara es un dígito y aún hay dígitos, seguir
    }
  }
  return result
}

/**
 * Detecta país por prefijo desde un número completo guardado
 */
function detectCountryFromValue(value) {
  if (!value) return COUNTRIES[0]
  const clean = value.replace(/\s/g, '')
  // Ordenar por longitud de prefijo desc para evitar falsos positivos (+1 vs +12)
  const sorted = [...COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length)
  return sorted.find(c => clean.startsWith(c.prefix)) || COUNTRIES[0]
}

/**
 * Extrae solo los dígitos locales de un valor completo
 */
function extractLocalDigits(value, country) {
  if (!value) return ''
  const withoutPrefix = value.replace(/\s/g, '').replace(country.prefix, '')
  return withoutPrefix.replace(/\D/g, '')
}

import { useState, useRef, useEffect } from 'react'

export default function PhoneInput({ value, onChange, error, primary = '#ff3c3c', placeholder }) {
  const [country,   setCountry]   = useState(() => detectCountryFromValue(value))
  const [localRaw,  setLocalRaw]  = useState(() => extractLocalDigits(value, detectCountryFromValue(value)))
  const [open,      setOpen]      = useState(false)
  const [search,    setSearch]    = useState('')
  const [focused,   setFocused]   = useState(false)
  const dropRef  = useRef(null)
  const inputRef = useRef(null)

  // Sync hacia fuera cada vez que cambia country o localRaw
  useEffect(() => {
    const digits = localRaw.replace(/\D/g, '').slice(0, country.digits)
    const masked = applyMask(digits, country.mask)
    const full   = masked ? `${country.prefix} ${masked}` : ''
    onChange(full)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, localRaw])

  // Cerrar dropdown al click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleCountrySelect(c) {
    setCountry(c)
    setLocalRaw('')
    setOpen(false)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleLocalInput(e) {
    // Solo dígitos, máximo según país
    const digits = e.target.value.replace(/\D/g, '').slice(0, country.digits)
    setLocalRaw(digits)
  }

  const digits  = localRaw.replace(/\D/g, '').slice(0, country.digits)
  const masked  = applyMask(digits, country.mask)
  const isValid = digits.length === country.digits
  const isEmpty = digits.length === 0

  const filteredCountries = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.prefix.includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES

  const borderColor = error
    ? 'rgba(255,80,80,0.6)'
    : focused
      ? primary
      : 'rgba(255,255,255,0.12)'

  // Placeholder dinámico basado en la máscara del país
  const dynamicPlaceholder = placeholder || country.mask.replace(/0/g, '·')

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .phone-input-wrap {
          display: flex;
          align-items: stretch;
          background: rgba(255,255,255,0.04);
          border: 1px solid ${borderColor};
          border-radius: 10px;
          overflow: visible;
          transition: border-color 0.2s;
          position: relative;
        }
        .phone-flag-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          background: rgba(255,255,255,0.04);
          border: none;
          border-right: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
          border-radius: 10px 0 0 10px;
          min-width: 90px;
        }
        .phone-flag-btn:hover { background: rgba(255,255,255,0.08); }
        .phone-flag-emoji { font-size: 20px; line-height: 1; }
        .phone-prefix { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); }
        .phone-chevron { font-size: 10px; color: rgba(255,255,255,0.3); transition: transform 0.2s; }
        .phone-number-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 14px;
          font-family: inherit;
          padding: 13px 14px;
          letter-spacing: 0.5px;
          min-width: 0;
        }
        .phone-number-input::placeholder { color: rgba(255,255,255,0.25); }
        .phone-validity {
          display: flex;
          align-items: center;
          padding: 0 12px;
          flex-shrink: 0;
          font-size: 13px;
          transition: all 0.2s;
        }
        /* Dropdown */
        .phone-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 9999;
          background: #111318;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          overflow: hidden;
          animation: phoneDropIn 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes phoneDropIn {
          from { opacity:0; transform:translateY(-6px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .phone-search {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .phone-search input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          color: white;
          font-size: 13px;
          padding: 8px 12px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }
        .phone-search input::placeholder { color: rgba(255,255,255,0.3); }
        .phone-list {
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .phone-list::-webkit-scrollbar { width: 4px; }
        .phone-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .phone-country-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.12s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .phone-country-item:hover { background: rgba(255,255,255,0.06); }
        .phone-country-item.active { background: rgba(255,60,60,0.08); }
        .phone-country-name { font-size: 13px; color: rgba(255,255,255,0.75); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .phone-country-prefix { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 700; flex-shrink: 0; }
        /* Progress bar de dígitos */
        .phone-progress-wrap {
          height: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 0 0 10px 10px;
          overflow: hidden;
          margin-top: 0;
        }
        .phone-progress-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 0.2s, background 0.2s;
        }
        @media (max-width: 480px) {
          .phone-flag-btn { min-width: 76px; padding: 0 8px; gap: 4px; }
          .phone-prefix { font-size: 12px; }
          .phone-number-input { font-size: 14px; padding: 13px 10px; }
        }
      `}</style>

      <div ref={dropRef}>
        <div className="phone-input-wrap">
          {/* Selector de país */}
          <button
            type="button"
            className="phone-flag-btn"
            onClick={() => setOpen(p => !p)}
            aria-label="Seleccionar país"
          >
            <span className="phone-flag-emoji">{country.flag}</span>
            <span className="phone-prefix">{country.prefix}</span>
            <span className="phone-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>

          {/* Input numérico */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            className="phone-number-input"
            value={masked}
            onChange={handleLocalInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={dynamicPlaceholder}
            autoComplete="tel-national"
          />

          {/* Indicador válido/inválido */}
          <div className="phone-validity">
            {!isEmpty && (
              isValid
                ? <span style={{ color: '#1D9E75', fontSize: 16 }}>✓</span>
                : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>{digits.length}/{country.digits}</span>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="phone-progress-wrap">
          <div
            className="phone-progress-bar"
            style={{
              width: `${(digits.length / country.digits) * 100}%`,
              background: isValid ? '#1D9E75' : primary,
            }}
          />
        </div>

        {/* Dropdown de países */}
        {open && (
          <div className="phone-dropdown">
            <div className="phone-search">
              <input
                type="text"
                placeholder="Buscar país o prefijo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="phone-list">
              {filteredCountries.length === 0 && (
                <div style={{ padding: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  Sin resultados
                </div>
              )}
              {filteredCountries.map(c => (
                <button
                  key={c.code}
                  type="button"
                  className={`phone-country-item${c.code === country.code ? ' active' : ''}`}
                  onClick={() => handleCountrySelect(c)}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                  <span className="phone-country-name">{c.name}</span>
                  <span className="phone-country-prefix">{c.prefix}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hint de formato */}
      {!error && focused && !isEmpty && !isValid && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          {country.name} · {country.digits} dígitos · formato {country.mask.replace(/0/g, '·')}
        </p>
      )}
      {error && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,100,100,0.8)' }}>{error}</p>
      )}
    </div>
  )
}