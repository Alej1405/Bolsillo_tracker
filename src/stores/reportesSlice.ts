import type { StateCreator } from 'zustand'
import {
  obtenerAnual,
  obtenerRendimiento,
  obtenerReparto,
  obtenerResumen,
} from '@/services/ReportesService'
import type { Anual, Rendimiento, Reparto, Resumen } from '@/types'

/*
  Estado de los reportes.

  Los tres se piden por separado porque responden a preguntas distintas y se
  consultan en momentos distintos: el resumen es de un rango, el reparto es de
  ese mismo rango por categoría, y la serie anual son doce meses. Cargarlos
  juntos obligaría a pedir los tres cada vez que cambia un filtro.

  Capturan el error en vez de dejarlo subir: los tres se piden solos al abrir
  la pantalla, sin que nadie pulse nada.
*/
export type ReportesSliceType = {
  resumen: Resumen | null
  reparto: Reparto | null
  anual: Anual | null
  cargandoReportes: boolean
  errorReportes: string | null

  /*
    El rendimiento lleva su propio cargando y su propio error, y no los de los
    otros tres reportes: vive en otra pantalla del nav. Compartirlos haría que
    un fallo suyo apareciera en Reportes, donde nadie pidió nada.
  */
  rendimiento: Rendimiento | null
  cargandoRendimiento: boolean
  errorRendimiento: string | null

  cargarResumen: (desde: string, hasta: string, cuentaId?: string) => Promise<void>
  cargarReparto: (desde: string, hasta: string, tipo?: 'income' | 'expense') => Promise<void>
  cargarAnual: (anio?: number) => Promise<void>
  cargarRendimiento: (desde: string, hasta: string) => Promise<void>
}

const mensaje = (e: unknown) =>
  e instanceof Error ? e.message : 'No pudimos cargar el reporte.'

export const createReportesSlice: StateCreator<ReportesSliceType> = (set) => ({
  resumen: null,
  reparto: null,
  anual: null,
  cargandoReportes: false,
  errorReportes: null,

  rendimiento: null,
  cargandoRendimiento: false,
  errorRendimiento: null,

  cargarResumen: async (desde, hasta, cuentaId) => {
    set({ cargandoReportes: true, errorReportes: null })
    try {
      set({ resumen: await obtenerResumen(desde, hasta, cuentaId) })
    } catch (e) {
      set({ errorReportes: mensaje(e) })
    } finally {
      set({ cargandoReportes: false })
    }
  },

  cargarReparto: async (desde, hasta, tipo = 'expense') => {
    set({ cargandoReportes: true, errorReportes: null })
    try {
      set({ reparto: await obtenerReparto(desde, hasta, tipo) })
    } catch (e) {
      set({ errorReportes: mensaje(e) })
    } finally {
      set({ cargandoReportes: false })
    }
  },

  cargarAnual: async (anio) => {
    set({ cargandoReportes: true, errorReportes: null })
    try {
      set({ anual: await obtenerAnual(anio) })
    } catch (e) {
      set({ errorReportes: mensaje(e) })
    } finally {
      set({ cargandoReportes: false })
    }
  },

  cargarRendimiento: async (desde, hasta) => {
    set({ cargandoRendimiento: true, errorRendimiento: null })
    try {
      set({ rendimiento: await obtenerRendimiento(desde, hasta) })
    } catch (e) {
      set({ errorRendimiento: mensaje(e) })
    } finally {
      set({ cargandoRendimiento: false })
    }
  },
})
