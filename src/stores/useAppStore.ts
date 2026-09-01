import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createAuthSlice } from '@/stores/authSlice'
import { createCuentasSlice } from '@/stores/cuentasSlice'
import { createDashboardSlice } from '@/stores/dashboardSlice'
import { createMovimientosSlice } from '@/stores/movimientosSlice'
import { createReportesSlice } from '@/stores/reportesSlice'
import { createSitioSlice } from '@/stores/sitioSlice'
import { createSoporteSlice } from '@/stores/soporteSlice'
import { createUsuariosSlice } from '@/stores/usuariosSlice'
import type { AuthSliceType } from '@/stores/authSlice'
import type { CuentasSliceType } from '@/stores/cuentasSlice'
import type { DashboardSliceType } from '@/stores/dashboardSlice'
import type { MovimientosSliceType } from '@/stores/movimientosSlice'
import type { ReportesSliceType } from '@/stores/reportesSlice'
import type { SitioSliceType } from '@/stores/sitioSlice'
import type { SoporteSliceType } from '@/stores/soporteSlice'
import type { UsuariosSliceType } from '@/stores/usuariosSlice'

/*
  Store principal. Acopla todos los slices en un solo hook.

  Para añadir uno: crear `stores/<area>Slice.ts`, sumar su tipo a la
  intersección y su `create<Area>Slice(...a)` a la propagación de abajo.

  Un slice por router del backend: auth, dashboard, cuentas, movimientos,
  reportes, usuarios, soporte y sitio. Las categorías se consultan desde
  `movimientos`, que es quien las necesita para anotar.

  `usuarios` es la administración de otras cuentas y solo la usa `super_admin`;
  está separado de `auth`, que guarda quién eres tú.
*/
export const useAppStore = create<
  AuthSliceType &
    DashboardSliceType &
    CuentasSliceType &
    MovimientosSliceType &
    ReportesSliceType &
    UsuariosSliceType &
    SoporteSliceType &
    SitioSliceType
>()(
  devtools((...a) => ({
    ...createAuthSlice(...a),
    ...createDashboardSlice(...a),
    ...createCuentasSlice(...a),
    ...createMovimientosSlice(...a),
    ...createReportesSlice(...a),
    ...createUsuariosSlice(...a),
    ...createSoporteSlice(...a),
    ...createSitioSlice(...a),
  })),
)
