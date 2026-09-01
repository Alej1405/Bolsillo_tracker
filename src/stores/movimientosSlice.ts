import type { StateCreator } from 'zustand'
import {
  actualizarMovimiento,
  anotarMovimiento,
  borrarMovimiento,
  listarCategoriasDe,
  listarMovimientos,
  transferir,
} from '@/services/MovimientosService'
import type { FiltrosMovimientos } from '@/services/MovimientosService'
import type {
  Categoria,
  TipoAnotable,
  TipoPopup,
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
  /*
    Los catálogos, uno por tipo. Son dos listas distintas —"Alimentación" es de
    gasto, "Sueldo" es de ingreso— y guardarlas juntas obligaría a filtrar en
    cada pantalla.
  */
  categorias: Record<TipoAnotable, Categoria[]>
  cargandoCategorias: boolean
  errorCategorias: string | null
  anotando: boolean
  /** Si el popup de anotar un gasto está abierto. */
  /*
    Qué popup de anotar está abierto, o `null` si ninguno. Guarda el tipo y no
    un booleano porque el formulario es el mismo para gasto e ingreso: lo que
    cambia son los textos y el catálogo, y los saca de aquí.
  */
  movimientoAbierto: TipoPopup | null

  /** Historial paginado. Lo filtra y pagina el backend. */
  historial: ListaMovimientos | null
  cargandoHistorial: boolean
  errorHistorial: string | null

  cargarCategorias: (tipo?: TipoAnotable) => Promise<void>
  anotar: (datos: DatosAnotarGasto) => Promise<MovimientoCompleto>
  cargarHistorial: (filtros?: FiltrosMovimientos) => Promise<void>
  editarMovimiento: (id: string, datos: DatosActualizarMovimiento) => Promise<MovimientoCompleto>
  borrarMovimiento: (id: string) => Promise<void>
  pasarPlata: (datos: DatosTransferir) => Promise<MovimientoCompleto>
  abrirGasto: () => void
  abrirIngreso: () => void
  abrirAhorro: () => void
  cerrarMovimiento: () => void
}

export const createMovimientosSlice: StateCreator<MovimientosSliceType> = (set, get) => ({
  categorias: { expense: [], income: [] },
  cargandoCategorias: false,
  errorCategorias: null,
  anotando: false,
  movimientoAbierto: null,

  abrirGasto: () => set({ movimientoAbierto: 'expense' }),
  abrirIngreso: () => set({ movimientoAbierto: 'income' }),
  abrirAhorro: () => set({ movimientoAbierto: 'transfer' }),
  cerrarMovimiento: () => set({ movimientoAbierto: null }),

  cargarCategorias: async (tipo = 'expense') => {
    // Ya está: no se vuelve a pedir un catálogo que no cambia.
    if (get().categorias[tipo].length > 0) return

    set({ cargandoCategorias: true, errorCategorias: null })
    try {
      const items = await listarCategoriasDe(tipo)
      set({ categorias: { ...get().categorias, [tipo]: items } })
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
      return await anotarMovimiento(datos)
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
