import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dropzone from '../../src/components/Dropzone'

describe('Dropzone móvil/escritorio', () => {
  it('texto táctil solo móvil y texto de arrastrar solo escritorio', () => {
    render(<Dropzone accept=".pdf" onFiles={vi.fn()} onReject={vi.fn()} />)
    const touch = screen.getByText(/toca para seleccionar/i)
    const drag = screen.getByText(/arrastra/i)
    expect(touch.className).toMatch(/md:hidden/)
    expect(drag.className).toMatch(/hidden/)
    expect(drag.className).toMatch(/md:/)
  })

  it('indicación de varios archivos solo cuando multiple', () => {
    const { rerender } = render(
      <Dropzone accept=".pdf" onFiles={vi.fn()} onReject={vi.fn()} />,
    )
    expect(screen.getByText(/varios permitidos/i)).toBeDefined()
    rerender(<Dropzone accept=".pdf" multiple={false} onFiles={vi.fn()} onReject={vi.fn()} />)
    expect(screen.queryByText(/varios permitidos/i)).toBeNull()
  })
})
