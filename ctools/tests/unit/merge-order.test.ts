import { describe, expect, it } from 'vitest'
import { moveDown, moveUp } from '../../src/tools/merge/MergePage'

describe('moveUp', () => {
  it('sube el elemento una posición', () => {
    expect(moveUp(['a', 'b', 'c'], 1)).toEqual(['b', 'a', 'c'])
  })

  it('el primero no se mueve', () => {
    expect(moveUp(['a', 'b'], 0)).toEqual(['a', 'b'])
  })

  it('índice fuera de rango no cambia nada', () => {
    expect(moveUp(['a', 'b'], 5)).toEqual(['a', 'b'])
    expect(moveUp(['a', 'b'], -1)).toEqual(['a', 'b'])
  })

  it('no muta el array original', () => {
    const input = ['a', 'b', 'c']
    moveUp(input, 2)
    expect(input).toEqual(['a', 'b', 'c'])
  })
})

describe('moveDown', () => {
  it('baja el elemento una posición', () => {
    expect(moveDown(['a', 'b', 'c'], 1)).toEqual(['a', 'c', 'b'])
  })

  it('el último no se mueve', () => {
    expect(moveDown(['a', 'b'], 1)).toEqual(['a', 'b'])
  })

  it('índice fuera de rango no cambia nada', () => {
    expect(moveDown(['a', 'b'], 5)).toEqual(['a', 'b'])
    expect(moveDown(['a', 'b'], -1)).toEqual(['a', 'b'])
  })

  it('no muta el array original', () => {
    const input = ['a', 'b', 'c']
    moveDown(input, 0)
    expect(input).toEqual(['a', 'b', 'c'])
  })
})
