import { describe, expect, it } from 'vitest'
import { groupFragments, type TextFragment } from '../../src/lib/pdf-text'

function frag(overrides: Partial<TextFragment> & { text: string }): TextFragment {
  return {
    x: 0,
    y: 0,
    fontSize: 12,
    hasEOL: false,
    ...overrides,
  }
}

describe('groupFragments', () => {
  it('lista vacía → sin párrafos', () => {
    expect(groupFragments([])).toEqual([])
  })

  it('fragmentos de la misma línea se unen en un solo párrafo en orden X', () => {
    const paragraphs = groupFragments([
      frag({ text: 'mundo', x: 100, y: 500 }),
      frag({ text: 'Hola ', x: 50, y: 500 }),
    ])
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].text).toBe('Hola mundo')
    expect(paragraphs[0].heading).toBe(false)
  })

  it('ordena por Y descendente (arriba → abajo) aunque lleguen desordenados', () => {
    const paragraphs = groupFragments([
      frag({ text: 'segunda', x: 50, y: 400, hasEOL: true }),
      frag({ text: 'primera', x: 50, y: 500, hasEOL: true }),
    ])
    expect(paragraphs.map((p) => p.text)).toEqual(['primera', 'segunda'])
  })

  it('hasEOL explícito separa párrafos', () => {
    const paragraphs = groupFragments([
      frag({ text: 'línea uno', x: 50, y: 500, hasEOL: true }),
      frag({ text: 'línea dos', x: 50, y: 480, hasEOL: true }),
    ])
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0].text).toBe('línea uno')
    expect(paragraphs[1].text).toBe('línea dos')
  })

  it('sin hasEOL y con salto pequeño continúa el mismo párrafo', () => {
    const paragraphs = groupFragments([
      frag({ text: 'primera ', x: 50, y: 500, hasEOL: false }),
      frag({ text: 'continúa', x: 50, y: 488, hasEOL: false }),
    ])
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].text).toBe('primera continúa')
  })

  it('salto vertical amplio (> 1.5 × tamaño) separa párrafos aunque no haya EOL', () => {
    const paragraphs = groupFragments([
      frag({ text: 'arriba', x: 50, y: 500, fontSize: 12, hasEOL: false }),
      frag({ text: 'abajo', x: 50, y: 400, fontSize: 12, hasEOL: false }),
    ])
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs.map((p) => p.text)).toEqual(['arriba', 'abajo'])
  })

  it('tolerancia Y: fragmentos casi alineados comparten línea', () => {
    const paragraphs = groupFragments([
      frag({ text: 'Hola ', x: 50, y: 500, fontSize: 12 }),
      frag({ text: 'mundo', x: 100, y: 501, fontSize: 12 }),
    ])
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].text).toBe('Hola mundo')
  })

  it('detecta título por tamaño relativo (≥ 1.25 × mediana)', () => {
    const paragraphs = groupFragments([
      frag({ text: 'Título grande', x: 50, y: 500, fontSize: 20, hasEOL: true }),
      frag({ text: 'cuerpo normal', x: 50, y: 480, fontSize: 12, hasEOL: true }),
      frag({ text: 'otro cuerpo', x: 50, y: 460, fontSize: 12, hasEOL: true }),
    ])
    expect(paragraphs).toHaveLength(3)
    expect(paragraphs[0]).toMatchObject({ text: 'Título grande', heading: true })
    expect(paragraphs[1].heading).toBe(false)
    expect(paragraphs[2].heading).toBe(false)
  })

  it('texto largo (>160 caracteres) nunca es título aunque sea grande', () => {
    const long = `a`.repeat(161)
    const paragraphs = groupFragments([
      frag({ text: long, x: 50, y: 500, fontSize: 24, hasEOL: true }),
      frag({ text: 'cuerpo', x: 50, y: 480, fontSize: 12, hasEOL: true }),
      frag({ text: 'cuerpo dos', x: 50, y: 460, fontSize: 12, hasEOL: true }),
    ])
    expect(paragraphs[0].heading).toBe(false)
  })

  it('normaliza espacios y recorta extremos', () => {
    const paragraphs = groupFragments([
      frag({ text: '  Hola   ', x: 50, y: 500 }),
      frag({ text: '  mundo  ', x: 120, y: 500 }),
    ])
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].text).toBe('Hola mundo')
  })

  it('fragmentos de líneas distintas con la misma X mantienen orden de lectura', () => {
    const paragraphs = groupFragments([
      frag({ text: 'b', x: 50, y: 480, hasEOL: true }),
      frag({ text: 'a', x: 50, y: 500, hasEOL: true }),
      frag({ text: 'c', x: 50, y: 460, hasEOL: true }),
    ])
    expect(paragraphs.map((p) => p.text)).toEqual(['a', 'b', 'c'])
  })
})
