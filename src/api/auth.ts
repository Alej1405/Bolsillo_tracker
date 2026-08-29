/*
  Autenticación contra POST /auth/register y /auth/login.

  Los tipos son la forma exacta que publica el backend en /openapi.json
  (UserCreate y RegisterResponse). Si el contrato cambia allá, cambia aquí.
*/
import { pedir } from '@/api/cliente'
import { guardarToken } from '@/api/sesion'

/** Lo que el backend espera en el cuerpo del registro (`UserCreate`). */
export type DatosRegistro = {
  full_name: string
  email: string
  password: string
}

/** El usuario tal como lo devuelve la API (`UserRead`). */
export type Usuario = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

/** Respuesta de registro e inicio de sesión (`RegisterResponse`). */
export type RespuestaAcceso = {
  user: Usuario
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Crea la cuenta y deja la sesión iniciada.
 *
 * El registro ya devuelve el token: no hay que llamar a /login después. Se
 * guarda aquí mismo para que ninguna pantalla pueda olvidarse de hacerlo.
 */
export async function registrar(datos: DatosRegistro): Promise<RespuestaAcceso> {
  const respuesta = await pedir<RespuestaAcceso>('/auth/register', {
    metodo: 'POST',
    cuerpo: datos,
  })
  guardarToken(respuesta.access_token)
  return respuesta
}
