import type { StateCreator } from 'zustand'
import { registrar, iniciarSesion, obtenerPerfil, cerrarSesion } from '@/services/AuthService'
import type { DatosLogin, DatosRegistro, Usuario } from '@/types'

/*
  Estado de la sesión: quién está dentro y si hay una petición en curso.

  Las acciones no capturan errores a propósito — los deja subir para que el
  formulario decida qué mensaje mostrar en qué campo. Aquí solo se apaga
  `cargando` pase lo que pase.
*/
export type AuthSliceType = {
  usuario: Usuario | null
  cargando: boolean
  /** Usuario recién creado. Lo lee el aviso de registro correcto. */
  reciénCreado: Usuario | null

  crearCuenta: (datos: DatosRegistro) => Promise<Usuario>
  entrar: (datos: DatosLogin) => Promise<Usuario>
  cargarPerfil: () => Promise<void>
  salir: () => void
  descartarAviso: () => void
}

export const createAuthSlice: StateCreator<AuthSliceType> = (set) => ({
  usuario: null,
  cargando: false,
  reciénCreado: null,

  crearCuenta: async (datos) => {
    set({ cargando: true })
    try {
      const { user } = await registrar(datos)
      set({ usuario: user, reciénCreado: user })
      return user
    } finally {
      set({ cargando: false })
    }
  },

  entrar: async (datos) => {
    set({ cargando: true })
    try {
      const { user } = await iniciarSesion(datos)
      set({ usuario: user })
      return user
    } finally {
      set({ cargando: false })
    }
  },

  cargarPerfil: async () => {
    const usuario = await obtenerPerfil()
    set({ usuario })
  },

  salir: () => {
    cerrarSesion()
    set({ usuario: null, reciénCreado: null })
  },

  descartarAviso: () => set({ reciénCreado: null }),
})
