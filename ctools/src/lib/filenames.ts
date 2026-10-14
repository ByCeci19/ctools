// Nombres de descarga con sufijos limpios (FR-025).

/** Quita la última extensión: "mi.archivo.pdf" → "mi.archivo". */
export function stripExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot > 0 ? fileName.slice(0, dot) : fileName
}

/** "informe.pdf" → "informe_unido_CTools.pdf" (herramienta Unir). */
export function mergeFilename(firstFileName: string): string {
  return `${stripExtension(firstFileName)}_unido_CTools.pdf`
}

/** "doc.docx" → "doc_CTools.pdf" · "doc.pdf" → "doc_CTools.docx". */
export function resultFilename(inputFileName: string, outExt: 'pdf' | 'docx'): string {
  return `${stripExtension(inputFileName)}_CTools.${outExt}`
}
