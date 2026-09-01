import { z } from 'zod'

/*
  Schemas de /site. Los datos de contacto de la landing y la conexión con
  TikTok.

  El estado de TikTok no trae nunca el secreto ni los tokens: dice si están
  puestos, no cuánto valen. Un secreto que sale por la API una vez ya está
  fuera.
*/

/** Los datos que muestra la landing. El GET es público. */
export const ContactoAPIResponseSchema = z.object({
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
})

/** Lo que se manda al cambiarlos. Todos opcionales: un PATCH no borra. */
export const ActualizarContactoSchema = z.object({
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email('Escribe un correo válido').optional(),
  address: z.string().trim().max(200).optional(),
  schedule: z.string().trim().max(120).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(120).optional(),
  tiktok: z.string().trim().max(120).optional(),
})

/** Cómo está la conexión con TikTok. */
export const TiktokEstadoAPIResponseSchema = z.object({
  /** Si están puestas las credenciales de la aplicación. */
  configured: z.boolean(),
  /** Si hay una cuenta autorizada. */
  connected: z.boolean(),
  client_key: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  open_id: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  synced_at: z.string().nullable().optional(),
  videos: z.number().default(0),
})

/** Lo mismo, más cuántos vídeos trajo la última sincronización. */
export const TiktokSincronizadoAPIResponseSchema = TiktokEstadoAPIResponseSchema.extend({
  traidos: z.number().default(0),
})

/** A dónde mandar al navegador para autorizar la cuenta. */
export const TiktokAutorizacionAPIResponseSchema = z.object({
  url: z.string(),
  state: z.string(),
})

/** Las llaves que da TikTok al registrar la aplicación. */
export const TiktokCredencialesSchema = z.object({
  client_key: z.string().trim().min(4, 'Pega la Client Key').max(200),
  client_secret: z.string().trim().min(4, 'Pega el Client Secret').max(200),
})

/** Un vídeo guardado. */
export const VideoAPIResponseSchema = z.object({
  video_id: z.string(),
  title: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  share_url: z.string().nullable().optional(),
  embed_link: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  published_at: z.string().nullable().optional(),
  visible: z.boolean().default(true),
})
