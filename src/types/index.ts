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
  MedidaSchema,
  RendimientoAPIResponseSchema,
  RepartoAPIResponseSchema,
  ResumenAPIResponseSchema,
} from '@/utils/reportes-schema'
import {
  ActualizarPerfilSchema,
  CambiarClaveSchema,
  ListaUsuariosAPIResponseSchema,
  UsuarioAdminAPIResponseSchema,
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
import { AdminStatsAPIResponseSchema } from '@/utils/admin-schema'
import {
  AbrirHiloSchema,
  ContactarSchema,
  HiloAPIResponseSchema,
  HiloAdminAPIResponseSchema,
  ListaHilosAPIResponseSchema,
  MensajeAPIResponseSchema,
  ResponderSchema,
} from '@/utils/soporte-schema'
import {
  ActualizarContactoSchema,
  ContactoAPIResponseSchema,
  TiktokAutorizacionAPIResponseSchema,
  TiktokCredencialesSchema,
  TiktokEstadoAPIResponseSchema,
  TiktokSincronizadoAPIResponseSchema,
  VideoAPIResponseSchema,
} from '@/utils/sitio-schema'

// ─── Autenticación ───────────────────────────────────────────────────────────

/** Lo que se envía al crear una cuenta. */
export type DatosRegistro = z.infer<typeof RegistroSchema>

/** Lo que se envía al iniciar sesión. */
export type DatosLogin = z.infer<typeof LoginSchema>

/** Usuario tal como lo devuelve la API. */
export type Usuario = z.infer<typeof UsuarioAPIResponseSchema>
/** Qué puede hacer quien entró. Lo decide el backend; aquí solo se lee. */
export type Rol = Usuario['role']

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
/*
  Lo que se puede anotar desde el popup: un gasto o un ingreso. Es más estrecho
  que `TipoMovimiento`, que incluye además las transferencias — esas tienen su
  propio formulario porque piden cuenta de destino y no llevan categoría.
*/
export type TipoAnotable = DatosAnotarGasto['type']
/*
  Lo que abre el popup de anotar: un gasto, un ingreso o un paso a ahorro.

  La transferencia comparte formulario con los otros dos —monto, fecha, nota y
  el bolsillo de origen son iguales—, pero en vez de categoría pide el bolsillo
  de destino: el backend no acepta una transferencia con categoría ni un gasto
  sin ella.
*/
export type TipoPopup = TipoAnotable | 'transfer'

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
export type Medida = z.infer<typeof MedidaSchema>
export type Rendimiento = z.infer<typeof RendimientoAPIResponseSchema>

/** Perfil y contraseña de la propia cuenta. */
export type DatosActualizarPerfil = z.infer<typeof ActualizarPerfilSchema>
export type DatosCambiarClave = z.infer<typeof CambiarClaveSchema>

/** Página de usuarios. Solo la ve `super_admin`. */
export type ListaUsuarios = z.infer<typeof ListaUsuariosAPIResponseSchema>
/** Un usuario en el listado del administrador: la ficha más si está activo. */
export type UsuarioAdmin = z.infer<typeof UsuarioAdminAPIResponseSchema>

export type CuentaMini = z.infer<typeof CuentaMiniSchema>
export type CategoriaMini = z.infer<typeof CategoriaMiniSchema>
export type TipoCuenta = z.infer<typeof TipoCuentaSchema>
export type TipoMovimiento = z.infer<typeof TipoMovimientoSchema>

/** El estado de la plataforma. Solo lo ve `super_admin`. */
export type AdminStats = z.infer<typeof AdminStatsAPIResponseSchema>

// ── Soporte ──────────────────────────────────────────────────────────────

/** Un mensaje dentro de una conversación. */
export type Mensaje = z.infer<typeof MensajeAPIResponseSchema>
/** Una conversación de soporte, como la ve quien la abrió. */
export type Hilo = z.infer<typeof HiloAPIResponseSchema>
/** Lo mismo más de quién es. Solo lo ve `super_admin`. */
export type HiloAdmin = z.infer<typeof HiloAdminAPIResponseSchema>
export type ListaHilos = z.infer<typeof ListaHilosAPIResponseSchema>
/** Los tres estados: abierto, respondido, cerrado. */
export type EstadoHilo = Hilo['status']
export type DatosAbrirHilo = z.infer<typeof AbrirHiloSchema>
export type DatosContactar = z.infer<typeof ContactarSchema>
export type DatosResponder = z.infer<typeof ResponderSchema>

// ── El sitio: contacto y TikTok ──────────────────────────────────────────

/** Los datos de contacto que muestra la landing. */
export type Contacto = z.infer<typeof ContactoAPIResponseSchema>
export type DatosActualizarContacto = z.infer<typeof ActualizarContactoSchema>
/** Cómo está la conexión con TikTok. Sin secretos. */
export type TiktokEstado = z.infer<typeof TiktokEstadoAPIResponseSchema>
export type TiktokSincronizado = z.infer<typeof TiktokSincronizadoAPIResponseSchema>
export type TiktokAutorizacion = z.infer<typeof TiktokAutorizacionAPIResponseSchema>
export type DatosTiktokCredenciales = z.infer<typeof TiktokCredencialesSchema>
/** Un vídeo de TikTok guardado. */
export type Video = z.infer<typeof VideoAPIResponseSchema>
