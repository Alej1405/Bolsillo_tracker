import { CLAVE, LoginSchema, RegistroSchema } from '@/utils/auth-schema'
import type { DatosLogin, DatosRegistro } from '@/types'

/*
  Reglas de los formularios de acceso, compartidas por escritorio y celular.

  La validación sale de los mismos schemas que validan la petición, así el
  formulario no puede exigir algo distinto de lo que la API acepta.
*/

export type Errores<T> = Partial<Record<keyof T, string>>

export const VACIO_REGISTRO: DatosRegistro = { full_name: '', email: '', password: '' }
export const VACIO_LOGIN: DatosLogin = { email: '', password: '' }

/** Los tres requisitos de la contraseña, para marcarlos mientras se escribe. */
export const REQUISITOS = [
  {
    id: 'largo',
    texto: `Al menos ${CLAVE.min} caracteres`,
    cumple: (clave: string) => clave.length >= CLAVE.min,
  },
  { id: 'letra', texto: 'Al menos una letra', cumple: (clave: string) => /[a-zA-Z]/.test(clave) },
  { id: 'numero', texto: 'Al menos un número', cumple: (clave: string) => /\d/.test(clave) },
] as const

export const claveCompleta = (clave: string) => REQUISITOS.every((r) => r.cumple(clave))

/** Primer fallo de Zod por campo. Más de uno a la vez satura. */
function primerFalloPorCampo<T extends object>(
  issues: { path: PropertyKey[]; message: string }[],
): Errores<T> {
  const errores: Errores<T> = {}
  for (const fallo of issues) {
    const campo = fallo.path[0] as keyof T | undefined
    if (campo && !errores[campo]) errores[campo] = fallo.message
  }
  return errores
}

/**
 * Valida el registro. La contraseña se excluye: sus requisitos ya se muestran
 * en su propia lista bajo el campo. El envío se bloquea con `claveCompleta`.
 */
export function validarRegistro(datos: DatosRegistro): Errores<DatosRegistro> {
  const r = RegistroSchema.safeParse(datos)
  if (r.success) return {}
  const { password: _clave, ...resto } = primerFalloPorCampo<DatosRegistro>(r.error.issues)
  return resto
}

export function validarLogin(datos: DatosLogin): Errores<DatosLogin> {
  const r = LoginSchema.safeParse(datos)
  return r.success ? {} : primerFalloPorCampo<DatosLogin>(r.error.issues)
}

/** Nombres de campo del backend → campos del formulario, para mapear su 400. */
export const CAMPOS: Record<string, keyof DatosRegistro> = {
  full_name: 'full_name',
  email: 'email',
  password: 'password',
}

/**
 * El correo que el visitante escribió en la landing, si vino de ahí. Llega por
 * el `state` de la navegación, que cualquiera puede fabricar: se comprueba.
 */
export function correoDeLaLanding(estado: unknown): string {
  if (estado && typeof estado === 'object' && 'correo' in estado) {
    const { correo } = estado as { correo: unknown }
    if (typeof correo === 'string') return correo
  }
  return ''
}
