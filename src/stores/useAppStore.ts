import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createAuthSlice } from '@/stores/authSlice'
import { createCuentasSlice } from '@/stores/cuentasSlice'
import { createDashboardSlice } from '@/stores/dashboardSlice'
import { createMovimientosSlice } from '@/stores/movimientosSlice'
import { createReportesSlice } from '@/stores/reportesSlice'
import type { AuthSliceType } from '@/stores/authSlice'
import type { CuentasSliceType } from '@/stores/cuentasSlice'
import type { DashboardSliceType } from '@/stores/dashboardSlice'
import type { MovimientosSliceType } from '@/stores/movimientosSlice'
import type { ReportesSliceType } from '@/stores/reportesSlice'

/*
  Store principal. Acopla todos los slices en un solo hook.

  Para añadir uno: crear `stores/<area>Slice.ts`, sumar su tipo a la
  intersección y su `create<Area>Slice(...a)` a la propagación de abajo.

  Un slice por router del backend: auth, dashboard, cuentas, movimientos y
  reportes. Las categorías se consultan desde `movimientos`, que es quien las
  necesita para anotar.
*/
export const useAppStore = create<
  AuthSliceType &
    DashboardSliceType &
    CuentasSliceType &
    MovimientosSliceType &
    ReportesSliceType
>()(
  devtools((...a) => ({
    ...createAuthSlice(...a),
    ...createDashboardSlice(...a),
    ...createCuentasSlice(...a),
    ...createMovimientosSlice(...a),
    ...createReportesSlice(...a),
  })),
)
