import { describe, expect, it } from 'vitest'
import {
  formatRangeExpression,
  parseRangeExpression,
} from '../../src/lib/range-parser'
import {
  mergeFilename,
  resultFilename,
  stripExtension,
} from '../../src/lib/filenames'

describe('parseRangeExpression', () => {
  it('parsea "1, 3, 5-8" con 10 páginas', () => {
    const { pages, errors } = parseRangeExpression('1, 3, 5-8', 10)
    expect(errors).toEqual([])
    expect([...pages].sort((a, b) => a - b)).toEqual([1, 3, 5, 6, 7, 8])
  })

  it('cadena vacía → conjunto vacío sin errores', () => {
    expect(parseRangeExpression('   ', 8)).toEqual({ pages: new Set(), errors: [] })
  })

  it('señala "0", "3-2", "abc" y páginas fuera del total sin aplicarlas', () => {
    const { pages, errors } = parseRangeExpression('0, 3-2, abc, 99', 8)
    expect(pages.size).toBe(0)
    expect(errors).toHaveLength(4)
  })

  it('mezcla válidos e inválidos: conserva los válidos y avisa de los otros', () => {
    const { pages, errors } = parseRangeExpression('2, 99', 8)
    expect([...pages]).toEqual([2])
    expect(errors).toHaveLength(1)
  })
})

describe('formatRangeExpression', () => {
  it('comprime {1,3,5,6,7,8} a "1, 3, 5-8"', () => {
    expect(formatRangeExpression(new Set([8, 1, 5, 3, 7, 6]))).toBe('1, 3, 5-8')
  })

  it('conjunto vacío → cadena vacía', () => {
    expect(formatRangeExpression(new Set())).toBe('')
  })

  it('roundtrip parse(format(x)) es estable', () => {
    const original = new Set([2, 4, 5, 6])
    const { pages } = parseRangeExpression(formatRangeExpression(original), 10)
    expect(pages).toEqual(original)
  })
})

describe('filenames', () => {
  it('stripExtension respeta puntos intermedios y nombres sin extensión', () => {
    expect(stripExtension('mi.archivo.pdf')).toBe('mi.archivo')
    expect(stripExtension('sin-extension')).toBe('sin-extension')
  })

  it('mergeFilename añade el sufijo de unidos', () => {
    expect(mergeFilename('informe.pdf')).toBe('informe_unido_CTools.pdf')
  })

  it('resultFilename añade el sufijo de conversión con la nueva extensión', () => {
    expect(resultFilename('doc.docx', 'pdf')).toBe('doc_CTools.pdf')
    expect(resultFilename('doc.pdf', 'docx')).toBe('doc_CTools.docx')
  })
})
