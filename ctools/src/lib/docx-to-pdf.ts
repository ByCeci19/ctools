import { renderAsync } from 'docx-preview'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { EngineProgress } from './pdf-engine'

// Conversión Word → PDF (R6, FR-020): `docx-preview` renderiza el .docx con
// alta fidelidad en un contenedor A4 oculto; cada página renderizada se
// captura con `html2canvas` y se ensambla en el PDF con `jspdf`.
// Todo ocurre en el DOM local, sin red (constitución I).

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
// Ancho del contenedor ≈ A4 a 96 dpi para que docx-preview pagine en A4.
const RENDER_WIDTH_PX = 794

export async function convertDocxToPdf(
  data: Uint8Array,
  onProgress?: EngineProgress,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-10000px;top:0;width:${RENDER_WIDTH_PX}px;background:#ffffff;`
  document.body.appendChild(container)
  try {
    await renderAsync(data, container)
    const sections = Array.from(container.querySelectorAll('section.docx')) as HTMLElement[]
    // Si el documento no pagina en secciones, se captura el contenedor entero.
    const targets: HTMLElement[] = sections.length > 0 ? sections : [container]
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    let done = 0
    for (const [index, target] of targets.entries()) {
      signal?.throwIfAborted()
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const img = canvas.toDataURL('image/jpeg', 0.95)
      if (index > 0) pdf.addPage('a4')
      const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width
      pdf.addImage(img, 'JPEG', 0, 0, A4_WIDTH_MM, Math.min(imgHeight, A4_HEIGHT_MM))
      done += 1
      onProgress?.(done, targets.length)
    }
    return new Uint8Array(pdf.output('arraybuffer'))
  } finally {
    container.remove()
  }
}
