// Render de PDF con pdf.js (R4): miniaturas en canvas y metadatos.
// El worker se empaqueta como asset relativo (`?url`), compatible con
// `base: './'` en GitHub Pages. Todo ocurre en memoria, sin red (const. I).
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// pdf.js v6 retiró `PDFDocumentProxy.destroy()`; la liberación completa vive
// en la tarea de carga, así que se conserva por documento (WeakMap).
const loadingTasks = new WeakMap<PDFDocumentProxy, PDFDocumentLoadingTask>()

/** Abre un PDF en memoria. Lanza el error original si está cifrado (FR-008). */
export async function loadPdfDocument(data: Uint8Array): Promise<PDFDocumentProxy> {
  // Copia defensiva: el lector puede transferir el buffer subyacente.
  const task = pdfjsLib.getDocument({ data: data.slice() })
  const doc = await task.promise
  loadingTasks.set(doc, task)
  return doc
}

export function getPdfPageCount(doc: PDFDocumentProxy): number {
  return doc.numPages
}

/** Renderiza una página a miniatura PNG y devuelve su ObjectURL temporal. */
export async function renderPageThumbnail(
  doc: PDFDocumentProxy,
  pageNumber: number,
  maxWidth = 220,
): Promise<string> {
  const page = await doc.getPage(pageNumber)
  const unit = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: maxWidth / unit.width })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('El navegador no ofrece contexto de dibujo 2D.')
  await page.render({ canvas, viewport }).promise
  page.cleanup()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('No se pudo generar la miniatura.')
  return URL.createObjectURL(blob)
}

export async function closePdfDocument(doc: PDFDocumentProxy): Promise<void> {
  const task = loadingTasks.get(doc)
  loadingTasks.delete(doc)
  if (task) {
    await task.destroy()
    return
  }
  await doc.cleanup()
}

/** Detecta errores de PDF cifrado de pdf.js y pdf-lib (mensaje de FR-008). */
export function isPasswordError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  return /password|encrypt/i.test(text)
}
