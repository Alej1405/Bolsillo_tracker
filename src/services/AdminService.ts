import { api } from '@/services/api'
import { AdminStatsAPIResponseSchema } from '@/utils/admin-schema'
import type { AdminStats } from '@/types'

/*
  Llamadas a /admin del backend. Solo funcionan para `super_admin`: a los demás
  el backend responde 403, así que la pantalla que las use tiene que comprobar
  el rol antes de ofrecerlas.
*/

/**
 * El estado de la plataforma en una sola petición.
 *
 * Trae usuarios, actividad, lo movido este mes y las categorías más usadas.
 * Va junto porque se muestra junto: son consultas cortas contra tablas
 * indexadas y partirlo obligaría a encadenar peticiones para pintar una vista.
 */
export async function obtenerEstadisticas(): Promise<AdminStats> {
  const { data } = await api.get('/admin/stats')
  return AdminStatsAPIResponseSchema.parse(data)
}
