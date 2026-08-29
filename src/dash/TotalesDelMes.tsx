import { ArrowDownIcon, ArrowUpIcon, PiggyBankIcon, ScalesIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useAparicion } from '@/movimiento'
import type { Totales } from '@/types'

type Metrica = {
  clave: keyof Totales
  etiqueta: string
  Icono: Icon
  /** Clases de color del icono. El monto va siempre en tinta, para que se lea. */
  tono: string
}

/*
  El orden no es decorativo: entró, salió, y lo que queda. Poner el neto en
  medio rompe la lectura, porque es el resultado de los dos anteriores.
*/
const METRICAS: Metrica[] = [
  { clave: 'total_income', etiqueta: 'Entró', Icono: ArrowUpIcon, tono: 'bg-ingreso-sutil text-ingreso' },
  { clave: 'total_expense', etiqueta: 'Salió', Icono: ArrowDownIcon, tono: 'bg-gasto-sutil text-gasto' },
  { clave: 'net', etiqueta: 'Neto', Icono: ScalesIcon, tono: 'bg-fondo-sutil text-texto-secundario' },
  { clave: 'total_saved', etiqueta: 'Ahorrado', Icono: PiggyBankIcon, tono: 'bg-lavanda-100 text-lavanda-900' },
]

/** Ingresos, egresos, neto y ahorrado del mes. */
export function TotalesDelMes({ totales, cargando }: { totales?: Totales; cargando: boolean }) {
  /*
    Aparición al montar y no al entrar en vista: esto es una aplicación, no una
    landing. Con `Revelar` las tarjetas se montan cuando llegan los datos, ya
    dentro del viewport, y se quedaban invisibles esperando un scroll que nunca
    ocurre.
  */
  const aparece = useAparicion()

  return (
    <section aria-label="Resumen del mes" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRICAS.map(({ clave, etiqueta, Icono, tono }, i) => (
        <motion.article
          key={clave}
          {...aparece(i * 0.05)}
          className="h-full rounded-extra border border-borde-normal bg-fondo-superficie p-5"
        >
            <div className="flex items-center gap-2">
              <span className={`grid size-8 shrink-0 place-items-center rounded-medio ${tono}`}>
                <Icono size={16} weight="bold" aria-hidden />
              </span>
              <p className="text-nota font-medium text-texto-secundario">{etiqueta}</p>
            </div>

            {cargando ? (
              <div aria-hidden className="mt-3 h-8 w-28 animate-pulse rounded-medio bg-fondo-sutil" />
            ) : (
              <p className="mt-3 font-cuerpo text-titulo font-bold tabular-nums text-texto-principal">
                <span className="text-rotulo font-semibold text-texto-tenue">$</span>{' '}
                {totales?.[clave] ?? '—'}
              </p>
            )}
        </motion.article>
      ))}
    </section>
  )
}
