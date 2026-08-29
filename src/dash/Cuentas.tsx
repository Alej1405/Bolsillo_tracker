import { BankIcon, CreditCardIcon, MoneyIcon, PiggyBankIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useAparicion } from '@/movimiento'
import type { CuentaDashboard, TipoCuenta } from '@/types'

/** Cada tipo de cuenta del backend con su icono y su nombre en español. */
const TIPOS: Record<TipoCuenta, { Icono: Icon; etiqueta: string }> = {
  cash: { Icono: MoneyIcon, etiqueta: 'Efectivo' },
  bank: { Icono: BankIcon, etiqueta: 'Banco' },
  card: { Icono: CreditCardIcon, etiqueta: 'Tarjeta' },
  savings: { Icono: PiggyBankIcon, etiqueta: 'Ahorro' },
}

/** Un saldo es negativo si el backend lo manda con signo. No se calcula aquí. */
const enContra = (saldo: string) => saldo.trim().startsWith('-')

/** Los bolsillos del usuario con su saldo. */
export function Cuentas({ cuentas, cargando }: { cuentas?: CuentaDashboard[]; cargando: boolean }) {
  // Aparición al montar, igual que el resto del dashboard: ver TotalesDelMes.
  const aparece = useAparicion()

  if (cargando) {
    return (
      <section aria-label="Tus bolsillos" aria-busy className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} aria-hidden className="h-[104px] animate-pulse rounded-extra bg-fondo-sutil" />
        ))}
      </section>
    )
  }

  return (
    <section aria-labelledby="cuentas-titulo" className="mt-8">
      <h2 id="cuentas-titulo" className="font-titulo text-rotulo font-bold text-texto-principal">
        Tus bolsillos
      </h2>

      {cuentas && cuentas.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cuentas.map((cuenta, i) => {
            const { Icono, etiqueta } = TIPOS[cuenta.type]
            const negativo = enContra(cuenta.balance)

            return (
              <motion.article
                key={cuenta.id}
                {...aparece(i * 0.05)}
                className="h-full rounded-extra border border-borde-normal bg-fondo-superficie p-5"
              >
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
                      <Icono size={18} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      {/* `truncate`: los nombres los pone el usuario y pueden ser largos. */}
                      <p className="truncate text-cuerpo font-semibold text-texto-principal">
                        {cuenta.name}
                      </p>
                      <p className="text-micro uppercase tracking-[0.08em] text-texto-tenue">
                        {etiqueta}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-4 font-cuerpo text-titulo-menor font-bold tabular-nums ${
                      negativo ? 'text-gasto' : 'text-texto-principal'
                    }`}
                  >
                    <span className="text-cuerpo font-semibold text-texto-tenue">$</span>{' '}
                    {cuenta.balance}
                  </p>
              </motion.article>
            )
          })}
        </div>
      ) : (
        /* Primer día del usuario: no hay nada que mostrar todavía. */
        <p className="mt-4 rounded-extra border border-dashed border-borde-normal bg-fondo-superficie px-5 py-8 text-center text-cuerpo text-texto-secundario">
          Todavía no tienes bolsillos. Crea el primero para empezar a registrar.
        </p>
      )}
    </section>
  )
}
