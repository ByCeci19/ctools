import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist'
import { closePdfDocument, loadPdfDocument } from './pdf-render'
import type { EngineProgress } from './pdf-engine'

// Extracción de texto de PDF con pdf.js (R7, FR-021): fragmentos con
// coordenadas → líneas por Y → párrafos por saltos/gaps → títulos por
// tamaño relativo. Sin OCR: si no hay texto, `totalChars` es 0 (FR-022).

export interface TextFragment {
  text: string
  x: number
  y: number
  fontSize: number
  hasEOL: boolean
}

export interface TextParagraph {
  text: string
  heading: boolean
}

export interface PdfTextPage {
  pageNumber: number
  paragraphs: TextParagraph[]
}

export interface PdfTextResult {
  pages: PdfTextPage[]
  /** Caracteres no blancos en todo el documento (0 → aparentemente escaneado). */
  totalChars: number
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === 'object' && item !== null && 'str' in item
}

function toFragment(item: TextItem): TextFragment | null {
  if (item.str === '') return null
  const size = Math.abs(Number(item.transform[0])) || item.height || 12
  return {
    text: item.str,
    x: Number(item.transform[4]),
    y: Number(item.transform[5]),
    fontSize: size,
    hasEOL: item.hasEOL,
  }
}

/**
 * Agrupa fragmentos en párrafos. Pura y testeable (T037): recibe fragmentos
 * ya extraídos y devuelve párrafos con detección de títulos por tamaño.
 */
export function groupFragments(fragments: TextFragment[]): TextParagraph[] {
  if (fragments.length === 0) return []
  const sizes = fragments.map((fragment) => fragment.fontSize).sort((a, b) => a - b)
  const body = sizes[Math.floor(sizes.length / 2)]

  // Orden de lectura: de arriba abajo (Y descendente en coords PDF), luego X.
  const ordered = [...fragments].sort((a, b) => b.y - a.y || a.x - b.x)

  // 1) Líneas: misma Y con tolerancia relativa al tamaño.
  const lines: TextFragment[][] = []
  for (const fragment of ordered) {
    const line = lines.find(
      (candidate) =>
        Math.abs(candidate[0].y - fragment.y) <= Math.max(1.5, candidate[0].fontSize * 0.35),
    )
    if (line) line.push(fragment)
    else lines.push([fragment])
  }

  // 2) Párrafos: corte por fin de línea explícito o salto vertical amplio.
  const paragraphs: { fragments: TextFragment[]; gap: number }[] = []
  let current: TextFragment[] = []
  let previousY = -1
  for (const line of lines) {
    const ordered_line = [...line].sort((a, b) => a.x - b.x)
    const gap = previousY < 0 ? 0 : previousY - line[0].y
    const newParagraph =
      current.length === 0 ||
      current[current.length - 1].hasEOL ||
      gap > line[0].fontSize * 1.5
    if (!newParagraph) current.push(...ordered_line)
    else {
      if (current.length > 0) paragraphs.push({ fragments: current, gap })
      current = [...ordered_line]
    }
    previousY = line[0].y
  }
  if (current.length > 0) paragraphs.push({ fragments: current, gap: 0 })

  return paragraphs.map(({ fragments }) => {
    const text = fragments
      .map((fragment) => fragment.text)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
    const maxSize = Math.max(...fragments.map((fragment) => fragment.fontSize))
    return { text, heading: text.length > 0 && text.length <= 160 && maxSize >= body * 1.25 }
  })
}

export async function extractPdfText(
  data: Uint8Array,
  onProgress?: EngineProgress,
  signal?: AbortSignal,
): Promise<PdfTextResult> {
  const doc: PDFDocumentProxy = await loadPdfDocument(data)
  try {
    const pages: PdfTextPage[] = []
    let totalChars = 0
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      signal?.throwIfAborted()
      const content = await doc.getPage(pageNumber).then((page) => page.getTextContent())
      const fragments: TextFragment[] = []
      for (const item of content.items) {
        if (!isTextItem(item)) continue
        const fragment = toFragment(item)
        if (fragment) {
          fragments.push(fragment)
          totalChars += fragment.text.replace(/\s/g, '').length
        }
      }
      pages.push({ pageNumber, paragraphs: groupFragments(fragments) })
      onProgress?.(pageNumber, doc.numPages)
    }
    return { pages, totalChars }
  } finally {
    await closePdfDocument(doc)
  }
}
