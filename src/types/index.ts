/*
  Tipos de la aplicación.

  Los de la API se infieren de los schemas de Zod con `z.infer`: se declaran una
  sola vez y no pueden quedar desincronizados del validador.
*/
import type { z } from 'zod'
import type {
  CategoriaGastoSchema,
  CategoriaMiniSchema,
  CuentaDashboardSchema,
  CuentaMiniSchema,
  DashboardAPIResponseSchema,
  MovimientoSchema,
  TipoCuentaSchema,
  TipoMovimientoSchema,
  TotalesSchema,
} from '@/utils/dashboard-schema'
import {
  ActualizarCategoriaSchema,
  ActualizarMovimientoSchema,
  AnotarGastoSchema,
  CategoriaSchema,
  CrearCategoriaSchema,
  ListaMovimientosAPIResponseSchema,
  MovimientoAPIResponseSchema,
  TransferirSchema,
} from '@/utils/movimientos-schema'
import {
  AnualAPIResponseSchema,
  RepartoAPIResponseSchema,
  ResumenAPIResponseSchema,
} from '@/utils/reportes-schema'
import {
  ActualizarPerfilSchema,
  CambiarClaveSchema,
  ListaUsuariosAPIResponseSchema,
} from '@/utils/auth-schema'
import {
  ActualizarCuentaSchema,
  CrearCuentaSchema,
  CuentaAPIResponseSchema,
  ListaCuentasAPIResponseSchema,
} from '@/utils/cuentas-schema'
import type {
  AccesoAPIResponseSchema,
  ErrorAPIResponseSchema,
  LoginSchema,
  RegistroSchema,
  UsuarioAPIResponseSchema,
} from '@/utils/auth-schema'

// ─── Autenticación ───────────────────────────────────────────────────────────

/** Lo que se envía al crear una cuenta. */
export type DatosRegistro = z.infer<typeof RegistroSchema>

/** Lo que se envía al iniciar sesión. */
export type DatosLogin = z.infer<typeof LoginSchema>

/** Usuario tal como lo devuelve la API. */
export type Usuario = z.infer<typeof UsuarioAPIResponseSchema>

/** Respuesta de registro y de login: usuario + token. */
export type RespuestaAcceso = z.infer<typeof AccesoAPIResponseSchema>

/** Error del backend, ya con su código de negocio. */
export type ErrorAPI = z.infer<typeof ErrorAPIResponseSchema>['error']

/** Un fallo asociado a un campo concreto del formulario. */
export type FalloDeCampo = { field: string; message: string }

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** Toda la pantalla principal en una respuesta. */
export type Dashboard = z.infer<typeof DashboardAPIResponseSchema>

/** Ingresos, egresos, neto y ahorrado del periodo. */
export type Totales = z.infer<typeof TotalesSchema>

/** Cuenta con su saldo. */
export type CuentaDashboard = z.infer<typeof CuentaDashboardSchema>

/** Categoría de gasto con monto y porcentaje. */
export type CategoriaGasto = z.infer<typeof CategoriaGastoSchema>

/** Movimiento completo, listo para pintar una fila. */
export type Movimiento = z.infer<typeof MovimientoSchema>

/** Bolsillo completo, tal como lo devuelve /accounts. */
export type Cuenta = z.infer<typeof CuentaAPIResponseSchema>

/** Lo que se envía al crear un bolsillo. */
export type DatosCrearCuenta = z.infer<typeof CrearCuentaSchema>

/** Lo que se envía al editar un bolsillo. */
export type DatosActualizarCuenta = z.infer<typeof ActualizarCuentaSchema>

/** Los bolsillos con su patrimonio, tal como los devuelve GET /accounts. */
export type ListaCuentas = z.infer<typeof ListaCuentasAPIResponseSchema>

/** Lo que se envía al anotar un gasto. */
export type DatosAnotarGasto = z.infer<typeof AnotarGastoSchema>

/** Movimiento completo, tal como lo devuelve /transactions. */
export type MovimientoCompleto = z.infer<typeof MovimientoAPIResponseSchema>

/** Categoría del catálogo, con sus subcategorías en `children`. */
export type Categoria = z.infer<typeof CategoriaSchema> & { children: Categoria[] }

/** Lo que se envía al crear o editar una categoría propia. */
export type DatosCrearCategoria = z.infer<typeof CrearCategoriaSchema>
export type DatosActualizarCategoria = z.infer<typeof ActualizarCategoriaSchema>

/** Lo que se envía al corregir un movimiento. */
export type DatosActualizarMovimiento = z.infer<typeof ActualizarMovimientoSchema>

/** Lo que se envía al pasar plata de un bolsillo a otro. */
export type DatosTransferir = z.infer<typeof TransferirSchema>

/** Historial paginado, tal como lo devuelve GET /transactions. */
export type ListaMovimientos = z.infer<typeof ListaMovimientosAPIResponseSchema>

/** Reportes: totales del periodo, reparto por categoría y serie anual. */
export type Resumen = z.infer<typeof ResumenAPIResponseSchema>
export type Reparto = z.infer<typeof RepartoAPIResponseSchema>
export type Anual = z.infer<typeof AnualAPIResponseSchema>

/** Perfil y contraseña de la propia cuenta. */
export type DatosActualizarPerfil = z.infer<typeof ActualizarPerfilSchema>
export type DatosCambiarClave = z.infer<typeof CambiarClaveSchema>

/** Página de usuarios. Solo la ve `super_admin`. */
export type ListaUsuarios = z.infer<typeof ListaUsuariosAPIResponseSchema>

export type CuentaMini = z.infer<typeof CuentaMiniSchema>
export type CategoriaMini = z.infer<typeof CategoriaMiniSchema>
export type TipoCuenta = z.infer<typeof TipoCuentaSchema>
export type TipoMovimiento = z.infer<typeof TipoMovimientoSchema>
