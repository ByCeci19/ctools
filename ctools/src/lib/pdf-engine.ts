import { PDFDocument } from 'pdf-lib'

// Motores de manipulación PDF con pdf-lib (R3). Operan sobre bytes en
// memoria sin recomprimir el contenido vectorial → calidad original
// (FR-013/FR-018). `filterEngine` llega en T027.

/** Progreso de procesado: documentos completados del total. */
export type EngineProgress = (done: number, total: number) => void

/**
 * Une varios PDF en uno solo, en el orden dado.
 * Lanza el error original si algún documento está cifrado (FR-008:
 * la vista lo traduce con `isPasswordError`).
 */
export async function mergePdfs(
  documents: Uint8Array[],
  onProgress?: EngineProgress,
): Promise<Uint8Array> {
  if (documents.length < 2) {
    throw new Error('Se necesitan al menos 2 archivos PDF para unir.')
  }
  const merged = await PDFDocument.create()
  let done = 0
  for (const bytes of documents) {
    const src = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(src, src.getPageIndices())
    for (const page of pages) merged.addPage(page)
    done += 1
    onProgress?.(done, documents.length)
  }
  return merged.save()
}
