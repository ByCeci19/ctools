import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../src/App'

const TOOL_NAMES = ['Unir PDF', 'Eliminar páginas PDF', 'Word a PDF', 'PDF a Word']

function panel(): HTMLElement {
  const element = document.getElementById('menu-movil')
  if (!element) throw new Error('Panel del menú no abierto')
  return element
}

function openMenu() {
  render(<App />)
  const button = screen.getByRole('button', { name: /menú/i })
  fireEvent.click(button)
  return button
}

describe('Header menu móvil', () => {
  it('muestra botón de menú y abre el panel con las 4 herramientas', () => {
    const button = openMenu()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    for (const name of TOOL_NAMES) {
      expect(within(panel()).getByRole('link', { name })).toBeDefined()
    }
  })

  it('elegir una herramienta navega y cierra el menú', () => {
    openMenu()
    fireEvent.click(within(panel()).getByRole('link', { name: 'Unir PDF' }))
    expect(window.location.hash).toContain('/unir-pdf')
    expect(document.getElementById('menu-movil')).toBeNull()
    expect(screen.getByRole('button', { name: /menú/i }).getAttribute('aria-expanded')).toBe(
      'false',
    )
  })

  it('Escape cierra el menú abierto', () => {
    openMenu()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.getElementById('menu-movil')).toBeNull()
  })
})
