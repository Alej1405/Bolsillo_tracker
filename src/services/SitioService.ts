import { api } from '@/services/api'
import {
  ActualizarContactoSchema,
  ContactoAPIResponseSchema,
  TiktokAutorizacionAPIResponseSchema,
  TiktokCredencialesSchema,
  TiktokEstadoAPIResponseSchema,
  TiktokSincronizadoAPIResponseSchema,
  VideoAPIResponseSchema,
} from '@/utils/sitio-schema'
import type {
  Contacto,
  DatosActualizarContacto,
  DatosTiktokCredenciales,
  TiktokAutorizacion,
  TiktokEstado,
  TiktokSincronizado,
  Video,
} from '@/types'

/*
  Llamadas a /site del backend: los datos de contacto de la landing y la
  conexión con TikTok.

  Los dos GET públicos —contacto y vídeos— no exigen sesión: los consume la
  landing, que ve cualquiera. El resto es solo para `super_admin`.
*/

/** Los datos de contacto que muestra la web. Público. */
export async function obtenerContacto(): Promise<Contacto> {
  const { data } = await api.get('/site/contact')
  return ContactoAPIResponseSchema.parse(data)
}

/** Los vídeos de la sección de TikToks. Público. */
export async function obtenerVideos(limite = 12): Promise<Video[]> {
  const { data } = await api.get('/site/videos', { params: { limite } })
  return VideoAPIResponseSchema.array().parse(data)
}

// ── solo `super_admin` ───────────────────────────────────────────────────

/** Cambia los datos de contacto. Solo lo que se manda: no borra el resto. */
export async function actualizarContacto(datos: DatosActualizarContacto): Promise<Contacto> {
  const cuerpo = ActualizarContactoSchema.parse(datos)
  const { data } = await api.patch('/site/contact', cuerpo)
  return ContactoAPIResponseSchema.parse(data)
}

/** Cómo está la conexión con TikTok. Nunca trae el secreto ni los tokens. */
export async function estadoTiktok(): Promise<TiktokEstado> {
  const { data } = await api.get('/site/tiktok')
  return TiktokEstadoAPIResponseSchema.parse(data)
}

/**
 * Guarda las llaves que da TikTok al registrar la aplicación.
 *
 * Cambiarlas invalida la autorización anterior: los tokens que había son de la
 * aplicación vieja, y el backend los limpia para que el estado no diga
 * "conectado" cuando ya no lo está.
 */
export async function guardarCredencialesTiktok(
  datos: DatosTiktokCredenciales,
): Promise<TiktokEstado> {
  const cuerpo = TiktokCredencialesSchema.parse(datos)
  const { data } = await api.put('/site/tiktok/credentials', cuerpo)
  return TiktokEstadoAPIResponseSchema.parse(data)
}

/**
 * A dónde mandar el navegador para autorizar la cuenta de TikTok.
 *
 * Devuelve también un `state` que hay que guardar: al volver del flujo se
 * compara con el que trae TikTok, y es lo que impide que alguien provoque esa
 * vuelta con un enlace preparado desde fuera.
 */
export async function urlDeAutorizacionTiktok(redirectUri: string): Promise<TiktokAutorizacion> {
  const { data } = await api.get('/site/tiktok/authorize', {
    params: { redirect_uri: redirectUri },
  })
  return TiktokAutorizacionAPIResponseSchema.parse(data)
}

/** Termina la autorización con el código que devolvió TikTok. */
export async function canjearCodigoTiktok(
  code: string,
  redirectUri: string,
): Promise<TiktokEstado> {
  const { data } = await api.post('/site/tiktok/callback', null, {
    params: { code, redirect_uri: redirectUri },
  })
  return TiktokEstadoAPIResponseSchema.parse(data)
}

/** Trae los últimos vídeos de TikTok y los guarda. */
export async function sincronizarTiktok(): Promise<TiktokSincronizado> {
  const { data } = await api.post('/site/tiktok/sync')
  return TiktokSincronizadoAPIResponseSchema.parse(data)
}

/** Olvida la autorización. Las credenciales de la aplicación se quedan. */
export async function desconectarTiktok(): Promise<TiktokEstado> {
  const { data } = await api.delete('/site/tiktok')
  return TiktokEstadoAPIResponseSchema.parse(data)
}

/** Todos los vídeos guardados, incluidos los escondidos. */
export async function videosGuardados(): Promise<Video[]> {
  const { data } = await api.get('/site/tiktok/videos')
  return VideoAPIResponseSchema.array().parse(data)
}

/**
 * Añade un vídeo pegando su enlace, sin conectar la cuenta.
 *
 * Es el camino corto: el título y la portada salen del oEmbed público de
 * TikTok, que funciona con cualquier vídeo público y no pide credenciales ni
 * autorización de nadie.
 *
 * Convive con la sincronización: si el mismo vídeo aparece luego en la lista de
 * la API se actualiza en vez de duplicarse.
 */
export async function agregarVideoPorEnlace(url: string): Promise<Video> {
  const { data } = await api.post('/site/tiktok/videos', { url })
  return VideoAPIResponseSchema.parse(data)
}

/** Quita un vídeo de la web. En TikTok sigue donde estaba. */
export async function quitarVideo(videoId: string): Promise<void> {
  await api.delete(`/site/tiktok/videos/${videoId}`)
}

/** Muestra o esconde un vídeo en la landing, sin borrarlo. */
export async function cambiarVisibilidadVideo(videoId: string, visible: boolean): Promise<Video> {
  const { data } = await api.patch(`/site/tiktok/videos/${videoId}`, { visible })
  return VideoAPIResponseSchema.parse(data)
}
