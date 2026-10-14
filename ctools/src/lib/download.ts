// Descarga de blobs en el navegador con liberación de memoria (constitución IV).
// La URL temporal se revoca con retardo: algunos navegadores la necesitan viva
// hasta que su gestor de descargas la reclama.

const REVOKE_DELAY_MS = 60_000

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}

export function downloadBytes(bytes: Uint8Array, mimeType: string, filename: string): void {
  // Copia defensiva: el Blob independiza los bytes del buffer original.
  downloadBlob(new Blob([bytes.slice()], { type: mimeType }), filename)
}
