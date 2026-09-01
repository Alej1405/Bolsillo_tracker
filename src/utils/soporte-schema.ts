import { z } from 'zod'

/*
  Schemas de /support. Espejo de los de soporte.py del backend.

  Una conversación es un hilo con sus mensajes dentro. `from_admin` es lo que
  decide de qué lado se pinta cada mensaje: no se mira el rol de quien lo
  escribió, porque un rol puede cambiar y entonces los mensajes viejos
  cambiarían de sitio.
*/

/** Los tres estados de una conversación. */
export const EstadoHiloSchema = z.enum(['abierto', 'respondido', 'cerrado'])

export const MensajeAPIResponseSchema = z.object({
  id: z.string(),
  body: z.string(),
  from_admin: z.boolean(),
  created_at: z.string(),
})

export const HiloAPIResponseSchema = z.object({
  id: z.string(),
  subject: z.string(),
  status: EstadoHiloSchema,
  created_at: z.string(),
  updated_at: z.string(),
  messages: z.array(MensajeAPIResponseSchema).default([]),
})

/** Lo mismo más de quién es. Solo lo devuelve el backend a `super_admin`. */
export const HiloAdminAPIResponseSchema = HiloAPIResponseSchema.extend({
  user_id: z.string().nullable().optional(),
  guest_name: z.string().nullable().optional(),
  guest_email: z.string().nullable().optional(),
  /*
    Quién escribió, ya resuelto por el backend: de la ficha del usuario si tiene
    cuenta, o de lo que dejó escrito si vino del formulario de la web. La
    bandeja necesita saber a quién contesta sin preguntar por cada usuario.
  */
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
})

/** Página de la bandeja del administrador. */
export const ListaHilosAPIResponseSchema = z.object({
  items: z.array(HiloAdminAPIResponseSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
  /** Cuántos esperan respuesta. Es el número que enseña el panel. */
  pending: z.number(),
})

/** Lo que se manda al abrir una consulta desde dentro de la aplicación. */
export const AbrirHiloSchema = z.object({
  subject: z.string().trim().min(3, 'Ponle un asunto').max(160, 'Máximo 160 caracteres'),
  body: z.string().trim().min(1, 'Escribe tu consulta').max(4000, 'Máximo 4000 caracteres'),
})

/** Lo que manda el formulario de la landing, donde puede no haber cuenta. */
export const ContactarSchema = AbrirHiloSchema.extend({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(120),
  email: z.string().trim().email('Escribe un correo válido'),
})

/** Un mensaje dentro de una conversación que ya existe. */
export const ResponderSchema = z.object({
  body: z.string().trim().min(1, 'Escribe tu respuesta').max(4000, 'Máximo 4000 caracteres'),
})
