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

  it('shows the primary desktop links, the Search Cars CTA, and no Contact/Support link', () => {
    renderNavBar()

    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Browse Fleet' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Services' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Search Cars' }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/contact/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/support/i)).not.toBeInTheDocument()
  })

  it('the About/Services links point to in-page anchors on the homepage', () => {
    renderNavBar()
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    const servicesLinks = screen.getAllByRole('link', { name: 'Services' })
    expect(aboutLinks[0]).toHaveAttribute('href', '/#why-choose')
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
