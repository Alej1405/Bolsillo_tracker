import { api } from '@/services/api'
import {
  ActualizarPerfilSchema,
  CambiarClaveSchema,
  ListaUsuariosAPIResponseSchema,
  UsuarioAPIResponseSchema,
} from '@/utils/auth-schema'
import type { DatosActualizarPerfil, DatosCambiarClave, ListaUsuarios, Usuario } from '@/types'

/*
  Llamadas a /users del backend.

  Las cuatro primeras son de la propia cuenta. Las de abajo solo funcionan para
  `super_admin`: el backend responde 403 al resto, así que la pantalla que las
  use tiene que comprobar el rol antes de ofrecerlas.
*/

/** Cambia el nombre. El correo no se cambia: identifica la cuenta. */
export async function actualizarPerfil(datos: DatosActualizarPerfil): Promise<Usuario> {
  const cuerpo = ActualizarPerfilSchema.parse(datos)
  const { data } = await api.patch('/users/me', cuerpo)
  return UsuarioAPIResponseSchema.parse(data)
}

/**
 * Cambia la contraseña. Exige la actual además de la nueva.
 *
 * El backend responde 401 si la actual no coincide — eso se muestra sobre ese
 * campo, no como error general.
 */
export async function cambiarClave(datos: DatosCambiarClave): Promise<void> {
  const cuerpo = CambiarClaveSchema.parse(datos)
  await api.patch('/users/me/password', cuerpo)
}

/**
 * Da de baja la propia cuenta.
 *
 * Es reversible: marca la cuenta como inactiva y conserva los datos. Solo el
 * `super_admin` puede reactivarla, y registrarse otra vez con ese correo
 * responde 409 en vez de crear una cuenta nueva.
 */
export async function darseDeBaja(): Promise<void> {
  await api.delete('/users/me')
}

/** Listado paginado de usuarios. Solo `super_admin`. */
export async function listarUsuarios(pagina = 1, porPagina = 20): Promise<ListaUsuarios> {
  const { data } = await api.get('/users', { params: { page: pagina, page_size: porPagina } })
  return ListaUsuariosAPIResponseSchema.parse(data)
}

/** Un usuario por su id. Solo `super_admin`. */
export async function obtenerUsuario(id: string): Promise<Usuario> {
  const { data } = await api.get(`/users/${id}`)
  return UsuarioAPIResponseSchema.parse(data)
}

/** Activa o desactiva una cuenta ajena. Solo `super_admin`. */
export async function cambiarEstadoUsuario(id: string, activo: boolean): Promise<Usuario> {
  const { data } = await api.patch(`/users/${id}`, { is_active: activo })
  return UsuarioAPIResponseSchema.parse(data)
}

/**
 * Borra una cuenta de verdad, con todo lo que cuelga de ella. Solo
 * `super_admin`, y exige `confirm=true` — no hay vuelta atrás.
 */
export async function borrarUsuario(id: string): Promise<void> {
  await api.delete(`/users/${id}`, { params: { confirm: true } })
}
