// Parser bidireccional de rangos de páginas (FR-016).
// Gramática: "1, 3, 5-8" con páginas 1-based. Los tokens inválidos se
// señalan sin aplicarse: la selección visual previa se conserva.

export interface RangeParseResult {
  pages: Set<number>
  errors: string[]
}

/**
 * Parsea "1, 3, 5-8" contra un total de páginas.
 * Devuelve las páginas válidas y la lista de errores en español.
 */
export function parseRangeExpression(expression: string, pageCount: number): RangeParseResult {
  const pages = new Set<number>()
  const errors: string[] = []
  const input = expression.trim()
  if (!input) return { pages, errors }

  for (const raw of input.split(',')) {
    const token = raw.trim()
    if (!token) continue
    const single = token.match(/^(\d+)$/)
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/)

    if (single) {
      const n = Number(single[1])
      if (n >= 1 && n <= pageCount) pages.add(n)
      else errors.push(`Página ${token} fuera de rango (1–${pageCount}).`)
    } else if (range) {
      const a = Number(range[1])
      const b = Number(range[2])
      if (a > b) errors.push(`Rango ${token} invertido: escríbelo de menor a mayor.`)
      else if (a < 1 || b > pageCount) errors.push(`Rango ${token} fuera de 1–${pageCount}.`)
      else for (let n = a; n <= b; n++) pages.add(n)
    } else {
      errors.push(`"${token}" no es un número ni un rango válido.`)
    }
  }
  return { pages, errors }
}

/** Comprime un conjunto a su expresión mínima: {1,3,5,6,7,8} → "1, 3, 5-7". */
export function formatRangeExpression(pages: Set<number>): string {
  const sorted = [...pages].sort((a, b) => a - b)
  const parts: string[] = []
  let start: number | null = null
  let prev = -1
  const flush = () => {
    if (start !== null) parts.push(start === prev ? `${start}` : `${start}-${prev}`)
  }
  for (const n of sorted) {
    if (start === null) {
      start = n
      prev = n
    } else if (n === prev + 1) {
      prev = n
    } else {
      flush()
      start = n
      prev = n
    }
  }
  flush()
  return parts.join(', ')
}
