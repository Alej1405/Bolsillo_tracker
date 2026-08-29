import type { StateCreator } from 'zustand'
import { obtenerDashboard } from '@/services/DashboardService'
import type { Dashboard } from '@/types'

/*
  Estado de la pantalla principal.

  `error` guarda el mensaje en vez de dejar subir la excepción: el dashboard se
  carga solo al entrar, sin que nadie pulse nada, así que no hay un formulario
  esperando el fallo. La pantalla lo lee y decide qué mostrar.
*/
export type DashboardSliceType = {
  dashboard: Dashboard | null
  cargandoDashboard: boolean
  errorDashboard: string | null

  cargarDashboard: () => Promise<void>
  limpiarDashboard: () => void
}

export const createDashboardSlice: StateCreator<DashboardSliceType> = (set) => ({
  dashboard: null,
  cargandoDashboard: false,
  errorDashboard: null,

  cargarDashboard: async () => {
    set({ cargandoDashboard: true, errorDashboard: null })
    try {
      set({ dashboard: await obtenerDashboard() })
    } catch (error) {
      set({ errorDashboard: error instanceof Error ? error.message : 'No pudimos cargar tus datos.' })
    } finally {
      set({ cargandoDashboard: false })
    }
  },

  limpiarDashboard: () => set({ dashboard: null, errorDashboard: null }),
})
