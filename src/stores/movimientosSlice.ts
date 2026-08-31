import type { StateCreator } from 'zustand'
import {
  actualizarMovimiento,
  anotarGasto,
  borrarMovimiento,
  listarCategoriasDeGasto,
  listarMovimientos,
  transferir,
} from '@/services/MovimientosService'
import type { FiltrosMovimientos } from '@/services/MovimientosService'
import type {
  Categoria,
  DatosActualizarMovimiento,
  DatosAnotarGasto,
  DatosTransferir,
  ListaMovimientos,
  MovimientoCompleto,
} from '@/types'

/*
  Estado de los movimientos. Por ahora solo anota gastos.

  `cargarCategorias` captura el error —el catálogo se pide solo al abrir el
  formulario, sin que nadie pulse nada— mientras que `anotar` lo deja subir:
  quien la llama es un formulario, y es el formulario el que decide qué mensaje
  mostrar y en qué campo.

  Las categorías se piden una sola vez por sesión: son un catálogo del sistema
  que no cambia mientras la persona anota un gasto.
*/
export type MovimientosSliceType = {
  categorias: Categoria[]
  cargandoCategorias: boolean
  errorCategorias: string | null
  anotando: boolean
  /** Si el popup de anotar un gasto está abierto. */
  gastoAbierto: boolean

  /** Historial paginado. Lo filtra y pagina el backend. */
  historial: ListaMovimientos | null
  cargandoHistorial: boolean
  errorHistorial: string | null

  cargarCategorias: () => Promise<void>
  anotar: (datos: DatosAnotarGasto) => Promise<MovimientoCompleto>
  cargarHistorial: (filtros?: FiltrosMovimientos) => Promise<void>
  editarMovimiento: (id: string, datos: DatosActualizarMovimiento) => Promise<MovimientoCompleto>
  borrarMovimiento: (id: string) => Promise<void>
  pasarPlata: (datos: DatosTransferir) => Promise<MovimientoCompleto>
  abrirGasto: () => void
  cerrarGasto: () => void
}

export const createMovimientosSlice: StateCreator<MovimientosSliceType> = (set, get) => ({
  categorias: [],
  cargandoCategorias: false,
  errorCategorias: null,
  anotando: false,
  gastoAbierto: false,

  abrirGasto: () => set({ gastoAbierto: true }),
  cerrarGasto: () => set({ gastoAbierto: false }),

  cargarCategorias: async () => {
    // Ya están: no se vuelve a pedir un catálogo que no cambia.
    if (get().categorias.length > 0) return

    set({ cargandoCategorias: true, errorCategorias: null })
    try {
      set({ categorias: await listarCategoriasDeGasto() })
    } catch (error) {
      set({
        errorCategorias:
          error instanceof Error ? error.message : 'No pudimos cargar las categorías.',
      })
    } finally {
      set({ cargandoCategorias: false })
    }
  },

  anotar: async (datos) => {
    set({ anotando: true })
    try {
      return await anotarGasto(datos)
    } finally {
      set({ anotando: false })
    }
  },

  historial: null,
  cargandoHistorial: false,
  errorHistorial: null,

  cargarHistorial: async (filtros = {}) => {
    set({ cargandoHistorial: true, errorHistorial: null })
    try {
      set({ historial: await listarMovimientos(filtros) })
    } catch (error) {
      set({
        errorHistorial:
          error instanceof Error ? error.message : 'No pudimos cargar tus movimientos.',
      })
    } finally {
      set({ cargandoHistorial: false })
    }
  },

  editarMovimiento: async (id, datos) => {
    set({ anotando: true })
    try {
      return await actualizarMovimiento(id, datos)
    } finally {
      set({ anotando: false })
    }
  },

  borrarMovimiento: async (id) => {
    set({ anotando: true })
    try {
      await borrarMovimiento(id)
    } finally {
      set({ anotando: false })
    }
  },

  /* Pasar plata entre bolsillos. No es un gasto: el patrimonio no baja. */
  pasarPlata: async (datos) => {
    set({ anotando: true })
    try {
      return await transferir(datos)
    } finally {
      set({ anotando: false })
    }
  },
})
