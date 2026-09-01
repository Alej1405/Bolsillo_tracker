import type { StateCreator } from 'zustand'
import { obtenerEstadisticas } from '@/services/AdminService'
import {
  borrarUsuario,
  cambiarEstadoUsuario,
  listarUsuarios,
} from '@/services/UsuariosService'
import type { AdminStats, UsuarioAdmin } from '@/types'

/*
  Estado de la administración de usuarios. Solo lo usa `super_admin`.

  Vive aparte de `authSlice` a propósito: aquel guarda quién eres tú, este la
  gente que administras. Mezclarlos haría que al cerrar sesión hubiera que
  acordarse de limpiar dos cosas distintas del mismo sitio, y la lista de todos
  los usuarios es justo lo que no puede quedarse en memoria de una sesión que
  terminó.

  Quién puede hacer esto lo decide el backend en cada petición: si un `client`
  llamara a cualquiera de estas funciones recibiría un 403. Aquí no hay ninguna
  comprobación de seguridad, solo estado.
*/
export type UsuariosSliceType = {
  usuarios: UsuarioAdmin[]
  /** Cuántos hay en total con el filtro puesto, para la paginación. */
  totalUsuarios: number
  paginasUsuarios: number
  /*
    El estado de la plataforma, de `GET /admin/stats`. Trae los totales de
    usuarios, la actividad y lo movido en el mes, todo ya calculado.
  */
  estadisticas: AdminStats | null
  cargandoEstadisticas: boolean

  cargandoUsuarios: boolean
  errorUsuarios: string | null
  /** Hay una operación en curso sobre un usuario concreto. Guarda su id. */
  ocupadoCon: string | null

  cargarUsuarios: (pagina?: number, activos?: boolean | null) => Promise<void>
  cargarEstadisticas: () => Promise<void>
  cambiarEstado: (id: string, activo: boolean) => Promise<void>
  borrarUsuarioParaSiempre: (id: string) => Promise<void>
}

const POR_PAGINA = 20

export const createUsuariosSlice: StateCreator<UsuariosSliceType> = (set, get) => ({
  usuarios: [],
  totalUsuarios: 0,
  paginasUsuarios: 1,
  estadisticas: null,
  cargandoEstadisticas: false,
  cargandoUsuarios: false,
  errorUsuarios: null,
  ocupadoCon: null,

  /*
    Captura el error en vez de dejarlo subir: la lista se pide sola al abrir la
    pantalla, sin que nadie pulse nada, así que no hay ningún formulario
    esperando para mostrar el fallo.
  */
  cargarUsuarios: async (pagina = 1, activos = null) => {
    set({ cargandoUsuarios: true, errorUsuarios: null })
    try {
      const pagina_ = await listarUsuarios(pagina, POR_PAGINA, activos)
      set({
        usuarios: pagina_.items,
        totalUsuarios: pagina_.total,
        paginasUsuarios: pagina_.total_pages,
      })
    } catch (error) {
      set({
        errorUsuarios:
          error instanceof Error ? error.message : 'No pudimos cargar los usuarios.',
      })
    } finally {
      set({ cargandoUsuarios: false })
    }
  },

  /*
    Captura el error sin guardarlo: las estadísticas acompañan a otras cosas en
    pantalla —la píldora de la cabecera, el panel de inicio— y si fallan es
    mejor que falte ese dato a que la pantalla entera muestre un error.
  */
  cargarEstadisticas: async () => {
    set({ cargandoEstadisticas: true })
    try {
      set({ estadisticas: await obtenerEstadisticas() })
    } catch {
      /* Sin estadísticas la pantalla sigue funcionando. */
    } finally {
      set({ cargandoEstadisticas: false })
    }
  },

  /*
    Estas dos dejan subir el error: quien las llama es un botón o un diálogo de
    confirmación, y es él quien decide qué decir y dónde.

    `ocupadoCon` guarda el id y no un booleano para poder deshabilitar solo la
    fila sobre la que se está actuando, en vez de congelar la tabla entera.
  */
  cambiarEstado: async (id, activo) => {
    set({ ocupadoCon: id })
    try {
      await cambiarEstadoUsuario(id, activo)
      await get().cargarUsuarios()
      await get().cargarEstadisticas()
    } finally {
      set({ ocupadoCon: null })
    }
  },

  borrarUsuarioParaSiempre: async (id) => {
    set({ ocupadoCon: id })
    try {
      await borrarUsuario(id)
      await get().cargarUsuarios()
      await get().cargarEstadisticas()
    } finally {
      set({ ocupadoCon: null })
    }
  },
})
