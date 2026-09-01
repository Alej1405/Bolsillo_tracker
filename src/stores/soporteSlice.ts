import type { StateCreator } from 'zustand'
import {
  abrirConsulta,
  cerrarConsulta,
  listarConsultas,
  misConsultas,
  reabrirConsulta,
  responderComoEquipo,
  responderConsulta,
} from '@/services/SoporteService'
import type { DatosAbrirHilo, EstadoHilo, Hilo, HiloAdmin } from '@/types'

/*
  Estado de las conversaciones de soporte.

  Dos listas separadas y no una: `misHilos` son las consultas propias y
  `bandeja` son todas las de la plataforma, que solo ve `super_admin`. Es el
  mismo tipo de dato pero distinta pregunta, y mezclarlas haría que al cerrar
  sesión un administrador se quedaran en memoria conversaciones de otros.

  `cargarMisHilos` y `cargarBandeja` capturan el error —se piden solas al abrir
  la pantalla—; las de escribir lo dejan subir, porque quien las llama es un
  formulario que decide qué decir y dónde.
*/
export type SoporteSliceType = {
  misHilos: Hilo[]
  cargandoMisHilos: boolean
  errorSoporte: string | null

  bandeja: HiloAdmin[]
  totalHilos: number
  paginasHilos: number
  /** Cuántas consultas esperan respuesta. Es el aviso del panel. */
  sinResponder: number
  cargandoBandeja: boolean
  /** Hay una operación en curso sobre una consulta. Guarda su id. */
  ocupadoConHilo: string | null

  cargarMisHilos: () => Promise<void>
  abrirHilo: (datos: DatosAbrirHilo) => Promise<Hilo>
  responderHilo: (id: string, body: string) => Promise<Hilo>

  cargarBandeja: (pagina?: number, estado?: EstadoHilo) => Promise<void>
  responderComoAdmin: (id: string, body: string) => Promise<HiloAdmin>
  cerrarHilo: (id: string) => Promise<void>
  reabrirHilo: (id: string) => Promise<void>
}

const POR_PAGINA = 20

export const createSoporteSlice: StateCreator<SoporteSliceType> = (set, get) => ({
  misHilos: [],
  cargandoMisHilos: false,
  errorSoporte: null,

  bandeja: [],
  totalHilos: 0,
  paginasHilos: 1,
  sinResponder: 0,
  cargandoBandeja: false,
  ocupadoConHilo: null,

  cargarMisHilos: async () => {
    set({ cargandoMisHilos: true, errorSoporte: null })
    try {
      set({ misHilos: await misConsultas() })
    } catch (error) {
      set({
        errorSoporte:
          error instanceof Error ? error.message : 'No pudimos cargar tus consultas.',
      })
    } finally {
      set({ cargandoMisHilos: false })
    }
  },

  /*
    Tras escribir se vuelve a pedir la lista en vez de retocarla en memoria: el
    backend decide el estado del hilo según quién escribió, y reconstruir esa
    regla aquí sería duplicarla y arriesgarse a que discrepen.
  */
  abrirHilo: async (datos) => {
    const hilo = await abrirConsulta(datos)
    await get().cargarMisHilos()
    return hilo
  },

  responderHilo: async (id, body) => {
    const hilo = await responderConsulta(id, { body })
    await get().cargarMisHilos()
    return hilo
  },

  // ── la bandeja del administrador ──────────────────────────────────────

  cargarBandeja: async (pagina = 1, estado) => {
    set({ cargandoBandeja: true, errorSoporte: null })
    try {
      const p = await listarConsultas(pagina, POR_PAGINA, estado)
      set({
        bandeja: p.items,
        totalHilos: p.total,
        paginasHilos: p.total_pages,
        sinResponder: p.pending,
      })
    } catch (error) {
      set({
        errorSoporte:
          error instanceof Error ? error.message : 'No pudimos cargar las consultas.',
      })
    } finally {
      set({ cargandoBandeja: false })
    }
  },

  responderComoAdmin: async (id, body) => {
    set({ ocupadoConHilo: id })
    try {
      const hilo = await responderComoEquipo(id, { body })
      await get().cargarBandeja()
      return hilo
    } finally {
      set({ ocupadoConHilo: null })
    }
  },

  cerrarHilo: async (id) => {
    set({ ocupadoConHilo: id })
    try {
      await cerrarConsulta(id)
      await get().cargarBandeja()
    } finally {
      set({ ocupadoConHilo: null })
    }
  },

  reabrirHilo: async (id) => {
    set({ ocupadoConHilo: id })
    try {
      await reabrirConsulta(id)
      await get().cargarBandeja()
    } finally {
      set({ ocupadoConHilo: null })
    }
  },
})
