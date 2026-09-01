import type { StateCreator } from 'zustand'
import {
  actualizarContacto,
  agregarVideoPorEnlace,
  cambiarVisibilidadVideo,
  desconectarTiktok,
  estadoTiktok,
  guardarCredencialesTiktok,
  obtenerContacto,
  obtenerVideos,
  quitarVideo,
  sincronizarTiktok,
  videosGuardados,
} from '@/services/SitioService'
import type { Contacto, DatosActualizarContacto, DatosTiktokCredenciales, TiktokEstado, Video } from '@/types'

/*
  Estado de los ajustes del sitio: lo que la landing muestra y el `super_admin`
  edita.

  `contacto` y `videos` los lee la landing sin sesión; el resto exige rol de
  administrador y el backend responde 403 a los demás. Aquí no hay ninguna
  comprobación de permisos, solo estado.
*/
export type SitioSliceType = {
  contacto: Contacto | null
  cargandoContacto: boolean
  guardandoContacto: boolean

  /** Los vídeos que se muestran en la landing. */
  videos: Video[]
  /** Todos los guardados, incluidos los escondidos. Para el panel. */
  videosAdmin: Video[]
  cargandoVideos: boolean

  tiktok: TiktokEstado | null
  cargandoTiktok: boolean
  sincronizando: boolean

  cargarContacto: () => Promise<void>
  guardarContacto: (datos: DatosActualizarContacto) => Promise<Contacto>

  cargarVideos: (limite?: number) => Promise<void>
  cargarVideosAdmin: () => Promise<void>
  cambiarVisibilidad: (videoId: string, visible: boolean) => Promise<void>
  /** Añade un vídeo pegando su enlace, sin conectar la cuenta. */
  agregarVideo: (url: string) => Promise<void>
  quitarVideo: (videoId: string) => Promise<void>

  cargarTiktok: () => Promise<void>
  guardarCredenciales: (datos: DatosTiktokCredenciales) => Promise<TiktokEstado>
  sincronizar: () => Promise<number>
  desconectar: () => Promise<void>
}

export const createSitioSlice: StateCreator<SitioSliceType> = (set, get) => ({
  contacto: null,
  cargandoContacto: false,
  guardandoContacto: false,
  videos: [],
  videosAdmin: [],
  cargandoVideos: false,
  tiktok: null,
  cargandoTiktok: false,
  sincronizando: false,

  /*
    Las lecturas capturan el error sin guardarlo: son datos de adorno de la
    landing —un teléfono, unos vídeos— y si fallan es mejor que falte esa
    sección a que la página entera muestre un error.
  */
  cargarContacto: async () => {
    set({ cargandoContacto: true })
    try {
      set({ contacto: await obtenerContacto() })
    } catch {
      /* La landing sigue con los datos que ya tuviera. */
    } finally {
      set({ cargandoContacto: false })
    }
  },

  guardarContacto: async (datos) => {
    set({ guardandoContacto: true })
    try {
      const actualizado = await actualizarContacto(datos)
      set({ contacto: actualizado })
      return actualizado
    } finally {
      set({ guardandoContacto: false })
    }
  },

  cargarVideos: async (limite = 12) => {
    set({ cargandoVideos: true })
    try {
      set({ videos: await obtenerVideos(limite) })
    } catch {
      /* Sin vídeos la sección se queda con sus marcadores. */
    } finally {
      set({ cargandoVideos: false })
    }
  },

  cargarVideosAdmin: async () => {
    set({ cargandoVideos: true })
    try {
      set({ videosAdmin: await videosGuardados() })
    } catch {
      /* El panel lo muestra vacío. */
    } finally {
      set({ cargandoVideos: false })
    }
  },

  cambiarVisibilidad: async (videoId, visible) => {
    await cambiarVisibilidadVideo(videoId, visible)
    await get().cargarVideosAdmin()
  },

  /*
    Estas dos dejan subir el error: las llama un formulario, y un enlace mal
    pegado o un vídeo privado hay que decirlo, no tragarlo.
  */
  agregarVideo: async (url) => {
    await agregarVideoPorEnlace(url)
    await get().cargarVideosAdmin()
  },

  quitarVideo: async (videoId) => {
    await quitarVideo(videoId)
    await get().cargarVideosAdmin()
  },

  cargarTiktok: async () => {
    set({ cargandoTiktok: true })
    try {
      set({ tiktok: await estadoTiktok() })
    } catch {
      /* Sin estado, el panel muestra "sin configurar". */
    } finally {
      set({ cargandoTiktok: false })
    }
  },

  /*
    Estas tres dejan subir el error: las llama un formulario o un botón, y hace
    falta decir qué pasó. Guardar credenciales o sincronizar puede fallar por
    algo que la persona tiene que leer —una clave mal pegada, TikTok caído—.
  */
  guardarCredenciales: async (datos) => {
    const estado = await guardarCredencialesTiktok(datos)
    set({ tiktok: estado })
    return estado
  },

  sincronizar: async () => {
    set({ sincronizando: true })
    try {
      const r = await sincronizarTiktok()
      set({ tiktok: r })
      await get().cargarVideosAdmin()
      return r.traidos
    } finally {
      set({ sincronizando: false })
    }
  },

  desconectar: async () => {
    set({ tiktok: await desconectarTiktok() })
  },
})
