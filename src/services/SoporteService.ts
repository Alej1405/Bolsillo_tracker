import { api } from '@/services/api'
import {
  AbrirHiloSchema,
  ContactarSchema,
  HiloAPIResponseSchema,
  HiloAdminAPIResponseSchema,
  ListaHilosAPIResponseSchema,
  ResponderSchema,
} from '@/utils/soporte-schema'
import type {
  DatosAbrirHilo,
  DatosContactar,
  DatosResponder,
  Hilo,
  HiloAdmin,
  ListaHilos,
} from '@/types'

/*
  Llamadas a /support del backend.

  Tres grupos según quién las usa: el formulario público de la landing, quien
  tiene cuenta sobre sus propias consultas, y el administrador sobre todas.
*/

/**
 * Escribe desde el formulario de contacto de la landing.
 *
 * No necesita sesión: quien escribe puede no tener cuenta, y por eso manda su
 * nombre y su correo. Es el mismo hilo que abriría alguien registrado y llega
 * a la misma bandeja.
 */
export async function contactar(datos: DatosContactar): Promise<Hilo> {
  const cuerpo = ContactarSchema.parse(datos)
  const { data } = await api.post('/support/contact', cuerpo)
  return HiloAPIResponseSchema.parse(data)
}

/** Mis consultas, de la más movida a la más quieta. */
export async function misConsultas(): Promise<Hilo[]> {
  const { data } = await api.get('/support/me')
  return HiloAPIResponseSchema.array().parse(data)
}

/** Abre una consulta desde dentro de la aplicación. */
export async function abrirConsulta(datos: DatosAbrirHilo): Promise<Hilo> {
  const cuerpo = AbrirHiloSchema.parse(datos)
  const { data } = await api.post('/support/me', cuerpo)
  return HiloAPIResponseSchema.parse(data)
}

/** Una consulta propia con toda su conversación. */
export async function verConsulta(id: string): Promise<Hilo> {
  const { data } = await api.get(`/support/me/${id}`)
  return HiloAPIResponseSchema.parse(data)
}

/**
 * Escribe en una consulta propia.
 *
 * El backend responde 400 si está cerrada: para un asunto nuevo, una consulta
 * nueva, y así no se cuelan mensajes en una conversación que ya nadie mira.
 */
export async function responderConsulta(id: string, datos: DatosResponder): Promise<Hilo> {
  const cuerpo = ResponderSchema.parse(datos)
  const { data } = await api.post(`/support/me/${id}/messages`, cuerpo)
  return HiloAPIResponseSchema.parse(data)
}

// ── solo `super_admin`: el backend responde 403 al resto ─────────────────

/** La bandeja completa, paginada. `estado` filtra por abierto/respondido/cerrado. */
export async function listarConsultas(
  pagina = 1,
  porPagina = 20,
  estado?: 'abierto' | 'respondido' | 'cerrado',
): Promise<ListaHilos> {
  const { data } = await api.get('/support', {
    params: { page: pagina, page_size: porPagina, ...(estado ? { status: estado } : {}) },
  })
  return ListaHilosAPIResponseSchema.parse(data)
}

/** Responde una consulta como el equipo. */
export async function responderComoEquipo(id: string, datos: DatosResponder): Promise<HiloAdmin> {
  const cuerpo = ResponderSchema.parse(datos)
  const { data } = await api.post(`/support/${id}/reply`, cuerpo)
  return HiloAdminAPIResponseSchema.parse(data)
}

/** Da por terminada una consulta. */
export async function cerrarConsulta(id: string): Promise<HiloAdmin> {
  const { data } = await api.post(`/support/${id}/close`)
  return HiloAdminAPIResponseSchema.parse(data)
}

/** La vuelve a abrir. */
export async function reabrirConsulta(id: string): Promise<HiloAdmin> {
  const { data } = await api.post(`/support/${id}/reopen`)
  return HiloAdminAPIResponseSchema.parse(data)
}
