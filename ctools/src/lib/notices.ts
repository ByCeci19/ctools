// Tipos y mensajes de avisos al usuario (entidad `UserNotice` del data-model).
// Textos en español, amigables y no técnicos (FR-004).

export type AcceptExt = '.pdf' | '.docx'

export type NoticeKind =
  | 'invalid-format'
  | 'legacy-doc'
  | 'password'
  | 'all-pages'
  | 'invalid-range'
  | 'scanned'
  | 'large-file'

export interface UserNotice {
  kind: NoticeKind
  /** Detalle opcional (p. ej. nombre del archivo o extensión esperada). */
  detail?: string
}

export const NOTICE_MESSAGES: Record<NoticeKind, string> = {
  'invalid-format': 'Formato no válido para esta herramienta.',
  'legacy-doc': 'Es un .doc antiguo. Guárdalo como .docx e inténtalo de nuevo.',
  password: 'El PDF está protegido con contraseña. Usa un PDF sin contraseña.',
  'all-pages': 'No puedes eliminar todas las páginas: debe quedar al menos 1.',
  'invalid-range': 'Rango no válido. Usa números y guiones, p. ej. "1, 3, 5-8".',
  scanned:
    'Parece un documento escaneado (sin texto). Se extraerá el contenido disponible.',
  'large-file':
    'Archivo grande (50 MB o más). Puede tardar: no cierres la pestaña.',
}

/** Umbral de advertencia suave FR-029 (sin bloqueo). */
export const LARGE_FILE_BYTES = 50 * 1024 * 1024

/**
 * Valida la extensión de un archivo contra la aceptada por la herramienta.
 * Devuelve el aviso correspondiente o `null` si es válido.
 * El `.doc` antiguo se detecta aparte para pedir guardarlo como `.docx` (FR-007).
 */
export function noticeForFile(fileName: string, accept: AcceptExt): UserNotice | null {
  const lower = fileName.toLowerCase()
  const isLegacyDoc = lower.endsWith('.doc') && !lower.endsWith('.docx')
  if (isLegacyDoc) {
    return accept === '.docx'
      ? { kind: 'legacy-doc', detail: fileName }
      : { kind: 'invalid-format', detail: `Solo se aceptan archivos ${accept}.` }
  }
  if (!lower.endsWith(accept)) {
    return { kind: 'invalid-format', detail: `Solo se aceptan archivos ${accept}.` }
  }
  return null
}

export function isLargeFile(sizeBytes: number): boolean {
  return sizeBytes >= LARGE_FILE_BYTES
}
