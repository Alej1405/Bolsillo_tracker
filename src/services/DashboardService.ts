import { api } from '@/services/api'
import { DashboardAPIResponseSchema } from '@/utils/dashboard-schema'
import { DASHBOARD_FICTICIO } from '@/utils/dashboard-mock'
import type { Dashboard } from '@/types'

/*
  Llamadas a /reports del backend.

  El token lo pone el interceptor de `api`: estos endpoints exigen sesión.
*/

/**
 * Mientras se monta el dashboard, los datos salen del mock.
 *
 * Es el único sitio donde se elige la fuente. Al terminar la pantalla se pone
 * en `false` y no hay que tocar ni el slice ni los componentes: el mock ya
 * tiene la forma exacta de la respuesta real, validada por el mismo schema.
 */
const USAR_DATOS_FICTICIOS = false

/** Toda la pantalla principal en una petición: saldo, totales, cuentas y movimientos. */
export async function obtenerDashboard(): Promise<Dashboard> {
  if (USAR_DATOS_FICTICIOS) {
    // Espera corta a propósito: sin ella el estado de carga nunca se ve y no
    // se sabe si funciona hasta el día de la conexión.
    await new Promise((listo) => setTimeout(listo, 400))
    return DASHBOARD_FICTICIO
  }

  const { data } = await api.get('/reports/dashboard')
  return DashboardAPIResponseSchema.parse(data)
}
