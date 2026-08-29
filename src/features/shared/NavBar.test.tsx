import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from '@/i18n'
import { NavBar } from '@/features/shared/NavBar'

function renderNavBar() {
  return render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>,
  )
}

describe('NavBar', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('shows the primary desktop links and the Search Cars CTA', () => {
    renderNavBar()

    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Browse Fleet' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Car Types' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Contact' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Services' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Search Cars' }).length).toBeGreaterThan(0)
  })

  it('About/Car Types/Contact are real pages; Services is still an in-page anchor', () => {
    renderNavBar()
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    const carTypeLinks = screen.getAllByRole('link', { name: 'Car Types' })
    const contactLinks = screen.getAllByRole('link', { name: 'Contact' })
    const servicesLinks = screen.getAllByRole('link', { name: 'Services' })
    expect(aboutLinks[0]).toHaveAttribute('href', '/about')
    expect(carTypeLinks[0]).toHaveAttribute('href', '/car-types')
    expect(contactLinks[0]).toHaveAttribute('href', '/contact')
    expect(servicesLinks[0]).toHaveAttribute('href', '/#how-it-works')
  })

  it('mobile menu is closed by default and opens/closes via the hamburger button', () => {
    renderNavBar()
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // Now two sets of the same links exist (desktop nav is hidden by CSS,
    // but still in the DOM, plus the mobile drawer) — assert the drawer
    // itself renders a Home link.
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThanOrEqual(2)

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('switches the interface language, which also flips the document to RTL', async () => {
    renderNavBar()
    const switchButtons = screen.getAllByRole('button', { name: /switch language/i })

    await act(async () => {
      fireEvent.click(switchButtons[0])
    })

    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getAllByRole('link', { name: 'الرئيسية' }).length).toBeGreaterThan(0)
  })
})
