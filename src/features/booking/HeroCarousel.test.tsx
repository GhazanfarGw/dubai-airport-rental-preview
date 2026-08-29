import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import i18n from '@/i18n'
import { HeroCarousel } from '@/features/booking/HeroCarousel'

interface Slide {
  title: string
  body: string
}

function getSlides(lang: string): Slide[] {
  return i18n.getFixedT(lang)('hero.slides', { returnObjects: true }) as Slide[]
}

describe('HeroCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('renders the first slide and a pagination dot per slide', () => {
    render(<HeroCarousel />)
    const slides = getSlides('en')

    expect(screen.getByRole('heading', { name: slides[0].title })).toBeInTheDocument()
    expect(screen.getByText(slides[0].body)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(slides.length)
    expect(screen.getByRole('region', { name: /highlights/i })).toBeInTheDocument()
  })

  it('autoplays to the next slide automatically, and pauses on hover', () => {
    render(<HeroCarousel />)
    const slides = getSlides('en')
    const region = screen.getByRole('region')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByRole('heading', { name: slides[1].title })).toBeInTheDocument()

    fireEvent.mouseEnter(region)
    act(() => {
      vi.advanceTimersByTime(15000)
    })
    // Still on slide 2 — autoplay is paused while the pointer is over the carousel.
    expect(screen.getByRole('heading', { name: slides[1].title })).toBeInTheDocument()

    fireEvent.mouseLeave(region)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByRole('heading', { name: slides[2].title })).toBeInTheDocument()
  })

  it('pauses on keyboard focus too', () => {
    render(<HeroCarousel />)
    const slides = getSlides('en')
    const region = screen.getByRole('region')

    fireEvent.focus(region)
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(screen.getByRole('heading', { name: slides[0].title })).toBeInTheDocument()
  })

  it('advances with the next/previous buttons and dots', () => {
    render(<HeroCarousel />)
    const slides = getSlides('en')

    fireEvent.click(screen.getByRole('button', { name: /next slide/i }))
    expect(screen.getByRole('heading', { name: slides[1].title })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous slide/i }))
    expect(screen.getByRole('heading', { name: slides[0].title })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /go to slide 3/i }))
    expect(screen.getByRole('heading', { name: slides[2].title })).toBeInTheDocument()
  })

  it('reverses keyboard arrow direction in RTL (Arabic) so "forward" still matches reading direction', async () => {
    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    render(<HeroCarousel />)
    const slidesAr = getSlides('ar')
    const region = screen.getByRole('region')

    // In RTL, the visual "forward" direction is the physical left arrow key.
    fireEvent.keyDown(region, { key: 'ArrowLeft' })
    expect(screen.getByRole('heading', { name: slidesAr[1].title })).toBeInTheDocument()

    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { name: slidesAr[0].title })).toBeInTheDocument()
  })
})
