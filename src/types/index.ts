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

export type CuentaMini = z.infer<typeof CuentaMiniSchema>
export type CategoriaMini = z.infer<typeof CategoriaMiniSchema>
export type TipoCuenta = z.infer<typeof TipoCuentaSchema>
export type TipoMovimiento = z.infer<typeof TipoMovimientoSchema>
