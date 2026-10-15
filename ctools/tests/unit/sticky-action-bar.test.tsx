import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import StickyActionBar from '../../src/components/StickyActionBar'

describe('StickyActionBar', () => {
  it('con visible=false no renderiza nada', () => {
    const { container } = render(
      <StickyActionBar label="Unir PDF" visible={false} onAction={() => {}} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('con visible=true muestra botón e indicación', () => {
    render(
      <StickyActionBar
        label="Unir PDF"
        hint="Añade al menos 2 archivos"
        visible
        onAction={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Unir PDF' })).toBeDefined()
    expect(screen.getByText('Añade al menos 2 archivos')).toBeDefined()
  })

  it('sin hint no muestra texto auxiliar', () => {
    const { container } = render(
      <StickyActionBar label="Convertir a Word" visible onAction={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Convertir a Word' })).toBeDefined()
    expect(container.querySelector('p')).toBeNull()
  })

  it('pulsar el botón llama a onAction', () => {
    const onAction = vi.fn()
    render(<StickyActionBar label="Eliminar páginas" visible onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar páginas' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('deshabilitado no llama a onAction', () => {
    const onAction = vi.fn()
    render(
      <StickyActionBar label="Unir PDF" disabled visible onAction={onAction} />,
    )
    const button = screen.getByRole('button', { name: 'Unir PDF' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(button)
    expect(onAction).not.toHaveBeenCalled()
  })
})
