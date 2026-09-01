import { api } from '@/services/api'
import {
  ActualizarCuentaSchema,
  CrearCuentaSchema,
  CuentaAPIResponseSchema,
  ListaCuentasAPIResponseSchema,
} from '@/utils/cuentas-schema'
import type { Cuenta, DatosActualizarCuenta, DatosCrearCuenta, ListaCuentas } from '@/types'

/*
  Llamadas a /accounts del backend. El CRUD completo de bolsillos.

  Cada función valida a la ida y a la vuelta: `parse` lanza si la forma no es
  la esperada. Una respuesta con otra forma es un fallo del contrato, y taparlo
  lo convierte en un error incomprensible tres pantallas más adelante.

  El token lo pone el interceptor de `api`: todos estos endpoints exigen sesión.
*/

/** Los bolsillos del usuario y su patrimonio, sumado por el backend. */
export async function listarCuentas(incluirArchivados = false): Promise<ListaCuentas> {
  const { data } = await api.get('/accounts', {
    params: incluirArchivados ? { include_archived: true } : undefined,
  })
  return ListaCuentasAPIResponseSchema.parse(data)
}

/** Crea un bolsillo y devuelve el que quedó guardado. */
export async function crearCuenta(datos: DatosCrearCuenta): Promise<Cuenta> {
  const cuerpo = CrearCuentaSchema.parse(datos)
  const { data } = await api.post('/accounts', cuerpo)
  return CuentaAPIResponseSchema.parse(data)
}

/**
 * Edita un bolsillo.
 *
 * El backend solo deja cambiar el nombre, el icono y el color: ni el tipo ni
 * el saldo inicial se tocan una vez creado, porque cambiarlos reescribiría el
 * histórico de saldos.
 */
export async function actualizarCuenta(id: string, datos: DatosActualizarCuenta): Promise<Cuenta> {
  const cuerpo = ActualizarCuentaSchema.parse(datos)
  const { data } = await api.patch(`/accounts/${id}`, cuerpo)
  return CuentaAPIResponseSchema.parse(data)
}

/**
 * Archiva un bolsillo: deja de contarse en el patrimonio pero conserva sus
 * movimientos. Es lo que hay que ofrecer cuando el borrado da 409.
 */
export async function archivarCuenta(id: string): Promise<Cuenta> {
  const { data } = await api.post(`/accounts/${id}/archive`)
  return CuentaAPIResponseSchema.parse(data)
}

/**
 * Saca un bolsillo del archivo: vuelve a contar en el patrimonio y reaparece
 * en las listas. Es el camino de vuelta de `archivarCuenta`.
 */
export async function desarchivarCuenta(id: string): Promise<Cuenta> {
  const { data } = await api.post(`/accounts/${id}/unarchive`)
  return CuentaAPIResponseSchema.parse(data)
}

/**
 * Borra un bolsillo de verdad.
 *
 * El backend responde 409 con código `IN_USE` si tiene movimientos: no se
 * borra nada que tenga historia detrás. En ese caso la salida es archivar.
 */
export async function borrarCuenta(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`)
}
