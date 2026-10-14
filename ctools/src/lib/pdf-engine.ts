import { PDFDocument } from 'pdf-lib'

// Motores de manipulación PDF con pdf-lib (R3). Operan sobre bytes en
// memoria sin recomprimir el contenido vectorial → calidad original
// (FR-013/FR-018).

/** Progreso de procesado: documentos completados del total. */
export type EngineProgress = (done: number, total: number) => void

/**
 * Une varios PDF en uno solo, en el orden dado.
 * Lanza el error original si algún documento está cifrado (FR-008:
 * la vista lo traduce con `isPasswordError`). Acepta una señal de
 * aborto para cancelar operaciones largas (FR-030).
 */
export async function mergePdfs(
  documents: Uint8Array[],
  onProgress?: EngineProgress,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  if (documents.length < 2) {
    throw new Error('Se necesitan al menos 2 archivos PDF para unir.')
  }
  const merged = await PDFDocument.create()
  let done = 0
  for (const bytes of documents) {
    signal?.throwIfAborted()
    const src = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(src, src.getPageIndices())
    for (const page of pages) merged.addPage(page)
    done += 1
    onProgress?.(done, documents.length)
  }
  return merged.save()
}

/**
 * Genera un PDF sin las páginas indicadas (números 1-based), conservando
 * el orden de las restantes (FR-018). Exige dejar al menos 1 página (FR-017).
 * Copia página a página para informar progreso y admitir cancelación.
 */
export async function filterPdfPages(
  data: Uint8Array,
  removePages: Set<number>,
  onProgress?: EngineProgress,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(data)
  const total = src.getPageCount()
  const keep: number[] = []
  for (let page = 1; page <= total; page++) {
    if (!removePages.has(page)) keep.push(page - 1)
  }
  if (keep.length === 0) {
    throw new Error('Debe quedar al menos 1 página en el documento.')
  }
  const out = await PDFDocument.create()
  let done = 0
  for (const index of keep) {
    signal?.throwIfAborted()
    const [page] = await out.copyPages(src, [index])
    out.addPage(page)
    done += 1
    onProgress?.(done, keep.length)
  }
  return out.save()
}
