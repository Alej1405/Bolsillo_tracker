import { api } from '@/services/api'
import {
  AnualAPIResponseSchema,
  RepartoAPIResponseSchema,
  ResumenAPIResponseSchema,
} from '@/utils/reportes-schema'
import type { Anual, Reparto, Resumen } from '@/types'

/*
  Llamadas a /reports del backend.

  Los cuatro reportes llegan calculados: totales, porcentajes y series. El
  frontend los pinta y los formatea, nunca los deriva — es la regla del
  proyecto, y además el backend puede aplicar reglas que aquí no se conocen.

  `obtenerDashboard` vive en `DashboardService`: es el reporte de la pantalla
  principal y tiene su propio ciclo de carga.
*/

/** Totales de un rango. `desde` y `hasta` son obligatorios: "2026-08-01". */
export async function obtenerResumen(
  desde: string,
  hasta: string,
  cuentaId?: string,
): Promise<Resumen> {
  const { data } = await api.get('/reports/summary', {
    params: { from: desde, to: hasta, ...(cuentaId ? { account_id: cuentaId } : {}) },
  })
  return ResumenAPIResponseSchema.parse(data)
}

/**
 * En qué se fue, por categoría, dentro de un rango.
 *
 * Las categorías vienen en árbol con sus subcategorías en `children`, y cada
 * una trae su porcentaje ya resuelto sobre el total del periodo.
 */
export async function obtenerReparto(
  desde: string,
  hasta: string,
  tipo: 'income' | 'expense' = 'expense',
): Promise<Reparto> {
  const { data } = await api.get('/reports/by-category', {
    params: { from: desde, to: hasta, kind: tipo },
  })
  return RepartoAPIResponseSchema.parse(data)
}

/**
 * Los doce meses de un año, para la comparación mes a mes.
 *
 * Sin `anio` devuelve el año en curso. Los meses sin movimientos llegan en
 * cero, no ausentes: así la serie siempre tiene doce puntos y el gráfico no
 * tiene que rellenar huecos.
 */
export async function obtenerAnual(anio?: number): Promise<Anual> {
  const { data } = await api.get('/reports/monthly', {
    params: anio ? { year: anio } : undefined,
  })
  return AnualAPIResponseSchema.parse(data)
}
