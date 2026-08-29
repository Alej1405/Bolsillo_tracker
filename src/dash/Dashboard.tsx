import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { CabeceraDash } from '@/dash/CabeceraDash'
import { SaldoTotal } from '@/dash/SaldoTotal'
import { TotalesDelMes } from '@/dash/TotalesDelMes'
import { Cuentas } from '@/dash/Cuentas'

/*
  Pantalla principal de la aplicación.

  Se monta por bloques: cada función nueva entra aquí como un componente propio
  que lee del store, sin tocar los anteriores.

    hecho      saldo total · totales del mes · cuentas
    pendiente  movimientos · categorías · versión de celular
*/
export function Dashboard() {
  const dashboard = useAppStore((e) => e.dashboard)
  const cargando = useAppStore((e) => e.cargandoDashboard)
  const error = useAppStore((e) => e.errorDashboard)
  const cargarDashboard = useAppStore((e) => e.cargarDashboard)

  // Una sola carga al entrar. `RutaProtegida` ya garantizó que hay sesión.
  useEffect(() => {
    cargarDashboard()
  }, [cargarDashboard])

  return (
    <div className="min-h-screen bg-fondo-lienzo">
      <CabeceraDash />

      <main className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-8 md:px-8">
        {error && (
          <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-cuerpo text-gasto">
            {error}
          </p>
        )}

        <SaldoTotal saldo={dashboard?.total_balance} mes={dashboard?.current_month} cargando={cargando} />
        <TotalesDelMes totales={dashboard?.summary} cargando={cargando} />
        <Cuentas cuentas={dashboard?.accounts} cargando={cargando} />
      </main>
    </div>
  )
}
