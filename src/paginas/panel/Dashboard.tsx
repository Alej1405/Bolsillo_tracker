import { motion } from 'motion/react'
import { Esperando } from '@/layout/panel/Esperando'
import { UltimosMovimientos } from '@/paginas/panel/UltimosMovimientos'
import { aEntroSalio, aFilas, aReparto } from '@/paginas/panel/adaptadores'
import { aNumero } from '@/utils/moneda'
import { escalonado, useAparicion } from '@/movimiento'
import { CuantoTienes, GraficoEntroSalio, GraficoReparto } from '@/piezas'
import { useAppStore } from '@/stores/useAppStore'

/*
  Pantalla de inicio del panel.

  El material es el mismo de la landing: una hoja de vidrio esmerilado sobre el
  papel de valores, y dentro las piezas del UI Kit sobre blanco. La landing ya
  monta un panel así en "Las cuentas ya salen hechas" —misma hoja, mismas
  piezas—, y esta pantalla es la versión con los datos de la persona. Antes eran
  tarjetas blancas con borde sueltas sobre el fondo, que es otro producto.

  Composición: a la izquierda lo que se lee de arriba abajo —cuánto tienes y
  luego el detalle de los movimientos— y a la derecha los dos gráficos, que se
  consultan de un vistazo. La izquierda es más ancha porque el historial
  necesita el sitio; no es simetría. Se apila por debajo de 1024.

  Los datos salen de `GET /reports/dashboard`, que carga el armazón.
*/
export function Dashboard() {
  const dashboard = useAppStore((e) => e.dashboard)
  const cargando = useAppStore((e) => e.cargandoDashboard)
  const aparece = useAparicion()

  const movimientos = aFilas(dashboard?.recent_transactions)
  const reparto = aReparto(dashboard?.top_expense_categories)
  const { entro, salio, neto } = aEntroSalio(dashboard?.summary)
  const bolsillos = dashboard?.accounts?.length ?? 0

  return (
    <motion.div
      {...aparece(0.08)}
      className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6"
    >
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-5 lg:w-auto lg:flex-[1.5]">
          {cargando ? (
            <Esperando alto={168} />
          ) : (
            <motion.div {...aparece(0.12)}>
              <CuantoTienes
                animar={false}
                tono="marca"
                etiqueta="Todo tu dinero"
                valor={aNumero(dashboard?.total_balance)}
                detalle={
                  bolsillos === 0
                    ? 'todavía sin bolsillos'
                    : `en ${bolsillos} ${bolsillos === 1 ? 'bolsillo' : 'bolsillos'}`
                }
              />
            </motion.div>
          )}

          <motion.div {...aparece(0.12 + escalonado)}>
            <UltimosMovimientos movimientos={movimientos} cargando={cargando} />
          </motion.div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-5 lg:w-auto lg:flex-1">
          {cargando ? (
            <>
              <Esperando alto={320} retraso={escalonado} />
              <Esperando alto={300} retraso={escalonado * 2} />
            </>
          ) : (
            <>
              <motion.div {...aparece(0.12 + escalonado * 2)}>
                <GraficoEntroSalio
                  animar={false}
                  entro={aNumero(entro)}
                  salio={aNumero(salio)}
                  neto={aNumero(neto)}
                />
              </motion.div>
              <motion.div {...aparece(0.12 + escalonado * 3)}>
                <GraficoReparto
                  animar={false}
                  categorias={reparto.map((c, i) => ({
                    id: c.id,
                    nombre: c.nombre,
                    pct: c.porcentaje,
                    monto: aNumero(c.monto),
                    color: c.color ?? `var(--color-grafico-${(i % 5) + 1})`,
                  }))}
                />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
