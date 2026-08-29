import { api } from '@/services/api'
import { guardarToken, borrarToken, leerToken } from '@/utils/sesion'
import {
  AccesoAPIResponseSchema,
  LoginSchema,
  RegistroSchema,
  UsuarioAPIResponseSchema,
} from '@/utils/auth-schema'
import type { DatosLogin, DatosRegistro, RespuestaAcceso, Usuario } from '@/types'

/*
  Llamadas a /auth del backend.

  Cada función valida lo que envía y lo que recibe. A diferencia de un
  `safeParse` que devuelve `undefined` al fallar, aquí se lanza: una respuesta
  con otra forma es un fallo del contrato, y taparlo lo convierte en un error
  incomprensible tres pantallas más adelante.
*/

/** Crea la cuenta y deja la sesión iniciada. El registro ya devuelve el token. */
export async function registrar(datos: DatosRegistro): Promise<RespuestaAcceso> {
  const cuerpo = RegistroSchema.parse(datos)
  const { data } = await api.post('/auth/register', cuerpo)
  const respuesta = AccesoAPIResponseSchema.parse(data)
  guardarToken(respuesta.access_token)
  return respuesta
}

/** Inicia sesión y guarda el token. */
export async function iniciarSesion(datos: DatosLogin): Promise<RespuestaAcceso> {
  const cuerpo = LoginSchema.parse(datos)
  const { data } = await api.post('/auth/login', cuerpo)
  const respuesta = AccesoAPIResponseSchema.parse(data)
  guardarToken(respuesta.access_token)
  return respuesta
}

/** Perfil del usuario del token guardado. `null` si no hay sesión. */
export async function obtenerPerfil(): Promise<Usuario | null> {
  if (!leerToken()) return null
  const { data } = await api.get('/auth/me')
  return UsuarioAPIResponseSchema.parse(data)
}

/** Cierra la sesión. El backend no tiene endpoint: el token solo se descarta. */
export function cerrarSesion(): void {
  borrarToken()
}
