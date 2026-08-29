import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createAuthSlice } from '@/stores/authSlice'
import { createDashboardSlice } from '@/stores/dashboardSlice'
import type { AuthSliceType } from '@/stores/authSlice'
import type { DashboardSliceType } from '@/stores/dashboardSlice'

/*
  Store principal. Acopla todos los slices en un solo hook.

  Para añadir uno: crear `stores/<area>Slice.ts`, sumar su tipo a la
  intersección y su `create<Area>Slice(...a)` a la propagación de abajo.

  Slices previstos, siguiendo los routers del backend: auth y dashboard
  (hechos), cuentas, categorias, movimientos.
*/
export const useAppStore = create<AuthSliceType & DashboardSliceType>()(
  devtools((...a) => ({
    ...createAuthSlice(...a),
    ...createDashboardSlice(...a),
  })),
)
