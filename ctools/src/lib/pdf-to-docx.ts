import { Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } from 'docx'
import type { PdfTextResult } from './pdf-text'

// Empaquetado PDF → Word (R7, FR-021): el texto extraído por `pdf-text.ts`
// se estructura en párrafos y títulos con saltos de página, y se empaqueta
// en un .docx válido con la librería `docx`. Sin `file-saver`: la descarga
// usa el helper propio `download.ts` (constitución IV).

export async function packTextToDocx(result: PdfTextResult): Promise<Uint8Array> {
  const children: Paragraph[] = []
  result.pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
    for (const paragraph of page.paragraphs) {
      if (!paragraph.text) continue
      children.push(
        new Paragraph({
          heading: paragraph.heading ? HeadingLevel.HEADING_1 : undefined,
          children: [new TextRun(paragraph.text)],
        }),
      )
    }
  })
  // Documento sin texto (escaneado): párrafo informativo en vez de vacío.
  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun(
            'No se encontró texto seleccionable en el documento original (parece escaneado).',
          ),
        ],
      }),
    )
  }
  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  // FileReader en vez de blob.arrayBuffer(): compatible con todos los
  // navegadores objetivo y con jsdom (donde arrayBuffer no existe).
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el .docx generado.'))
    reader.readAsArrayBuffer(blob)
  })
  return new Uint8Array(buffer)
}
