/*
  Dónde vive una imagen subida al backend.

  El backend devuelve la foto como una ruta suya —"/media/avatares/x.png"— y no
  como una dirección completa: no sabe con qué dominio lo están llamando.

  Pegarla a `VITE_API_URL` tal cual daría "/api/v1/media/avatares/x.png", que no
  existe: los archivos se sirven desde la raíz del servidor, no desde la API. Por
  eso se recorta el "/api/v1" del final antes de unir.
*/

/** Dirección completa de un archivo del backend. `null` si no hay ninguno. */
export function urlDeMedio(ruta?: string | null): string | null {
  if (!ruta) return null

  const base: string = import.meta.env.VITE_API_URL ?? ''
  const origen = base.replace(/\/api\/v\d+\/?$/, '')
  return `${origen}${ruta}`
}
