import { api } from '@/services/api'
import {
  ActualizarMovimientoSchema,
  AnotarGastoSchema,
  ListaMovimientosAPIResponseSchema,
  MovimientoAPIResponseSchema,
  TransferirSchema,
} from '@/utils/movimientos-schema'
import { listarCategorias } from '@/services/CategoriasService'
import type {
  Categoria,
  DatosActualizarMovimiento,
  DatosAnotarGasto,
  DatosTransferir,
  ListaMovimientos,
  MovimientoCompleto,
} from '@/types'

/** Filtros de GET /transactions. Todos opcionales y combinables. */
export type FiltrosMovimientos = {
  from?: string
  to?: string
  type?: 'income' | 'expense' | 'transfer'
  account_id?: string
  category_id?: string
  search?: string
  page?: number
  page_size?: number
}

/*
  Llamadas a /transactions y /categories del backend.

  Valida a la ida y a la vuelta: `parse` lanza si la forma no es la esperada.
  El token lo pone el interceptor de `api`: estos endpoints exigen sesión.
*/

/**
 * Anota un gasto o un ingreso y devuelve el movimiento guardado.
 *
 * Los dos van al mismo endpoint con el mismo cuerpo: lo único que cambia es
 * `type`, y el backend hace el resto —restar o sumar al saldo, contarlo en un
 * reporte o en el otro—. Aquí no se decide nada de eso.
 *
 * Las transferencias no pasan por aquí: `transferir` tiene su propio endpoint
 * porque necesita cuenta de destino y no lleva categoría.
 */
export async function anotarMovimiento(datos: DatosAnotarGasto): Promise<MovimientoCompleto> {
  const cuerpo = AnotarGastoSchema.parse(datos)
  const { data } = await api.post('/transactions', cuerpo)
  return MovimientoAPIResponseSchema.parse(data)
}

/**
 * Catálogo de categorías de un tipo.
 *
 * Delega en `CategoriasService`, que es donde vive /categories. Se mantiene
 * aquí como atajo porque anotar un movimiento siempre necesita su catálogo, y
 * son dos distintos: en un gasto se elige en qué se fue, en un ingreso de dónde
 * vino.
 */
export async function listarCategoriasDe(tipo: 'expense' | 'income'): Promise<Categoria[]> {
  return listarCategorias(tipo)
}

/**
 * Historial paginado. El backend filtra y pagina: aquí no se recorta nada.
 */
export async function listarMovimientos(
  filtros: FiltrosMovimientos = {},
): Promise<ListaMovimientos> {
  const { data } = await api.get('/transactions', { params: filtros })
  return ListaMovimientosAPIResponseSchema.parse(data)
}

/** Un movimiento por su id, con su cuenta y su categoría completas. */
export async function obtenerMovimiento(id: string): Promise<MovimientoCompleto> {
  const { data } = await api.get(`/transactions/${id}`)
  return MovimientoAPIResponseSchema.parse(data)
}

/**
 * Corrige un movimiento ya anotado.
 *
 * El tipo no se cambia: un gasto no se convierte en ingreso editándolo, se
 * borra y se anota de nuevo. Por eso `type` no está en el cuerpo.
 */
export async function actualizarMovimiento(
  id: string,
  datos: DatosActualizarMovimiento,
): Promise<MovimientoCompleto> {
  const cuerpo = ActualizarMovimientoSchema.parse(datos)
  const { data } = await api.patch(`/transactions/${id}`, cuerpo)
  return MovimientoAPIResponseSchema.parse(data)
}

/** Borra un movimiento. Los saldos de sus cuentas se recalculan solos. */
export async function borrarMovimiento(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

/**
 * Pasa plata de un bolsillo a otro.
 *
 * No lleva categoría: no es un gasto ni un ingreso, el dinero no sale del
 * patrimonio. Ahorrar es esto —una transferencia al bolsillo de ahorro—, y es
 * la decisión de diseño sobre la que se apoya todo el modelo.
 */
export async function transferir(datos: DatosTransferir): Promise<MovimientoCompleto> {
  const cuerpo = TransferirSchema.parse(datos)
  const { data } = await api.post('/transfers', cuerpo)
  return MovimientoAPIResponseSchema.parse(data)
}
