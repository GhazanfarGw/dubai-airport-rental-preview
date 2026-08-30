import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isRtl } from '@/i18n'
import { HERO_SLIDE_IMAGES } from '@/features/booking/heroSlides'
import { prefersReducedMotion } from '@/lib/motion'
import { Button } from '@/features/shared/ui/Button'

const AUTOPLAY_INTERVAL_MS = 5000
const SWIPE_THRESHOLD_PX = 50

interface Slide {
  title: string
  body: string
}

/**
 * The homepage's main visual focus: a full-width image carousel (5 slides,
 * within the spec's 3–5 range) with background image + overlay, headline,
 * supporting text, and a CTA that scrolls down to the booking section
 * (`#booking-section`, rendered by BookingSearchSection).
 *
 * Images come from src/assets/hero/ via heroSlides.ts — real, photorealistic
 * vehicle photography (Phase 4.1), one per fleet category. Copy comes from
 * the existing `hero.slides` i18n array (extended from 3 to 5 entries to
 * match the image count).
 *
 * Autoplay pauses on hover/focus and is skipped entirely when the user
 * has requested reduced motion. Keyboard (arrow keys) and touch swipe
 * both work; arrow-key direction and the prev/next icons flip for RTL so
 * "forward" always matches the visual reading direction.
 */
export function HeroCarousel() {
  const { t, i18n } = useTranslation()
  const slides = t('hero.slides', { returnObjects: true }) as Slide[]
  const rtl = isRtl(i18n.language)
  const reducedMotion = prefersReducedMotion()

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, AUTOPLAY_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, reducedMotion, slides.length])

  function handleKeyDown(e: React.KeyboardEvent) {
    // Forward/back always matches the visual reading direction, so the
    // physical left/right keys "feel" reversed in RTL, matching the arrow
    // icons and dot order.
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (rtl) goNext()
      else goPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (rtl) goPrev()
      else goNext()
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    // A physical left drag reveals the next slide, right drag the previous
    // one — this is about the drag direction, not text direction, so it is
    // intentionally not flipped for RTL (matches common carousel behavior).
    if (delta < 0) goNext()
    else goPrev()
  }

  function scrollToBooking() {
    const el = document.getElementById('booking-section')
    el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section
      className="relative h-[78vh] max-h-[720px] min-h-[480px] w-full overflow-hidden bg-brand-navy sm:min-h-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={t('hero.carousel.label')}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={
            'absolute inset-0 transition-opacity ' +
            (reducedMotion ? 'duration-0' : 'duration-700') +
            ' ' +
            (i === index ? 'opacity-100' : 'pointer-events-none opacity-0')
          }
          aria-hidden={i !== index}
        >
          <img
            src={HERO_SLIDE_IMAGES[i % HERO_SLIDE_IMAGES.length].src}
            alt={t(HERO_SLIDE_IMAGES[i % HERO_SLIDE_IMAGES.length].altKey)}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            className="h-full w-full object-cover"
          />
          {/* Overlay: darker toward the text side so the headline stays legible over the image, in both directions. */}
          <div
            className={
              'absolute inset-0 bg-gradient-to-t from-brand-navy-dark/90 via-brand-navy-dark/50 to-transparent ' +
              (rtl
                ? 'sm:bg-gradient-to-l sm:from-brand-navy-dark/95 sm:via-brand-navy-dark/60 sm:to-transparent/10'
                : 'sm:bg-gradient-to-r sm:from-brand-navy-dark/95 sm:via-brand-navy-dark/60 sm:to-transparent/10')
            }
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:justify-center sm:px-6 sm:pb-0 lg:px-8">
        <div className="max-w-xl">
          {slides.map((slide, i) => (
            <div
              key={slide.title}
              className={
                'transition-opacity ' +
                (reducedMotion ? 'duration-0' : 'duration-700') +
                ' ' +
                (i === index ? 'opacity-100' : 'pointer-events-none absolute inset-x-4 opacity-0 sm:inset-x-auto')
              }
              aria-hidden={i !== index}
            >
              <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-5xl">{slide.title}</h1>
              <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">{slide.body}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={scrollToBooking}
                className="mt-7 shadow-lg shadow-black/20"
              >
                {t('hero.cta')}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 sm:absolute sm:bottom-8 sm:start-6">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t('hero.carousel.goToSlide', { number: i + 1 })}
              aria-current={i === index}
              // The visual bar stays a slim 1.5px pill (unchanged look); the
              // button itself gets a ~32px hit area via padding so it meets
              // a comfortable touch-target size on mobile without resizing
              // the pill or shifting dot spacing.
              className="group flex items-center justify-center p-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span
                className={
                  'block h-1.5 rounded-full transition-all ' +
                  (i === index ? 'w-7 bg-brand-gold' : 'w-1.5 bg-white/40 group-hover:bg-white/60')
                }
              />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label={t('hero.carousel.previousSlide')}
        className="absolute inset-y-0 start-1 z-10 flex items-center px-2 text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:start-3"
      >
        <ArrowIcon direction="prev" rtl={rtl} />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label={t('hero.carousel.nextSlide')}
        className="absolute inset-y-0 end-1 z-10 flex items-center px-2 text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:end-3"
      >
        <ArrowIcon direction="next" rtl={rtl} />
      </button>
    </section>
  )
}

function ArrowIcon({ direction, rtl }: { direction: 'prev' | 'next'; rtl: boolean }) {
  const pointsLeft = (direction === 'prev' && !rtl) || (direction === 'next' && rtl)
  return (
    <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={pointsLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  )
}
