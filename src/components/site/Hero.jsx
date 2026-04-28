import { useState, useEffect, useCallback } from 'react'
import { useUIStrings } from '../../hooks/useUIStrings'

export default function Hero({ hero, brand }) {
  const primary  = brand?.primary || '#ff3c3c'
  const t        = useUIStrings(brand)

  // hero.slides = array of { badge, headline, sub, cta, bgImage }
  // fallback: single slide from old fields
  const slides = (() => {
    if (Array.isArray(hero?.slides) && hero.slides.length > 0) return hero.slides
    return [{
      badge:    hero?.badge    || t.hero.badge,
      headline: hero?.headline || 'ESTÉTICA QUE VENDE.',
      sub:      hero?.sub      || 'Fusionamos el arte cinematográfico con la ingeniería web.',
      cta:      hero?.cta      || t.hero.exploreCta,
      bgImage:  hero?.bgImage  || 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1920&q=80',
    }]
  })()

  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const [fading,  setFading]  = useState(false)
  const total = slides.length

  const goTo = useCallback((idx, dir = 1) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 350)
  }, [])

  const next = useCallback(() => {
    goTo((current + 1) % total)
  }, [current, total, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total)
  }, [current, total, goTo])

  useEffect(() => {
    if (total <= 1 || paused) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [total, paused, next])

  const slide = slides[current] || slides[0]
  const bg    = slide.bgImage || 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1920&q=80'

  const words = (slide.headline || 'ESTÉTICA QUE VENDE.').split(' ')

  return (
    <section
      id="home"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 6%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background layer — animates on slide change */}
      <div
        key={`bg-${current}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            radial-gradient(circle at center, ${primary}10 0%, transparent 70%),
            linear-gradient(to bottom, rgba(3,3,3,0.4), var(--bg)),
            url('${bg}')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(1.03)' : 'scale(1)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      />

      {/* Content */}
      <div
        style={{
          maxWidth: 800,
          position: 'relative',
          zIndex: 1,
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <p style={{
          textTransform: 'uppercase', letterSpacing: 5,
          color: primary, fontWeight: 800, fontSize: '0.85rem', marginBottom: 20,
        }}>
          {slide.badge || t.hero.badge}
        </p>

        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          lineHeight: 0.95, marginBottom: 24, color: 'white',
        }}>
          {words.map((word, i) => (
            <span key={i} style={{ color: i === words.length - 1 ? primary : 'white' }}>
              {word}{' '}
            </span>
          ))}
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '1.15rem', maxWidth: 600,
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          {slide.sub}
        </p>

        <a
          href="#ecosistemas"
          style={{
            display: 'inline-block', padding: '18px 48px',
            background: primary, color: 'white',
            textDecoration: 'none', borderRadius: 5,
            fontWeight: 800, fontSize: '0.9rem',
            letterSpacing: 2, textTransform: 'uppercase',
            transition: 'all 0.3s',
            boxShadow: `0 0 40px ${primary}40`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = `0 12px 40px ${primary}60`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 0 40px ${primary}40`
          }}
        >
          {slide.cta || t.hero.exploreCta}
        </a>
      </div>

      {/* Navigation arrows — only if multiple slides */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            style={arrowBtnStyle('left', primary)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
          >‹</button>
          <button
            onClick={next}
            aria-label="Next"
            style={arrowBtnStyle('right', primary)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
          >›</button>

          {/* Dots */}
          <div style={{
            position: 'absolute', bottom: 32, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 8, zIndex: 2,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 28 : 8,
                  height: 8, borderRadius: 4,
                  background: i === current ? primary : 'rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div style={{
            position: 'absolute', bottom: 36, right: '6%',
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            fontWeight: 700, letterSpacing: 2, zIndex: 2,
          }}>
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
        </>
      )}
    </section>
  )
}

function arrowBtnStyle(side, primary) {
  return {
    position: 'absolute',
    top: '50%',
    [side]: '3%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 48, height: 48,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    color: 'white',
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    padding: 0, lineHeight: 1,
  }
}