import { motion } from 'motion/react'
import { useAparicion } from '@/movimiento'

/** Convierte "2026-08" en "agosto de 2026". */
function nombreDelMes(mes: string): string {
  const [anio, numero] = mes.split('-').map(Number)
  if (!anio || !numero) return mes
  const fecha = new Date(anio, numero - 1, 1)
  return fecha.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
}

/** El saldo de todas las cuentas juntas. Lo primero que se mira al entrar. */
export function SaldoTotal({
  saldo,
  mes,
  cargando,
}: {
  saldo?: string
  mes?: string
  cargando: boolean
}) {
  const aparece = useAparicion()

  return (
    <motion.section
      {...aparece()}
      aria-labelledby="saldo-titulo"
      aria-busy={cargando}
      className="rounded-maximo bg-lavanda-950 px-6 py-8 text-texto-inverso md:px-10 md:py-10"
    >
      <p id="saldo-titulo" className="text-micro font-semibold uppercase tracking-[0.08em] text-texto-inverso/65">
        Todo tu dinero
      </p>

      {cargando ? (
        /*
          Bloque del alto de la cifra, no un spinner: así el contenido no
          salta cuando llega el dato. `aria-hidden` porque no dice nada; lo
          que anuncia la espera es el `aria-busy` de la sección.
        */
        <div aria-hidden className="mt-3 h-[52px] w-56 animate-pulse rounded-medio bg-white/10" />
      ) : (
        <p className="mt-2 font-cuerpo text-cifra font-bold leading-none tabular-nums">
          {/* El monto llega formateado del backend; aquí solo se le pone el símbolo. */}
          <span className="text-titulo-mayor font-semibold text-texto-inverso/70">$</span>{' '}
          {saldo ?? '—'}
        </p>
      )}

      {mes && !cargando && (
        <p className="mt-3 text-nota text-texto-inverso/60">
          Al cierre de {nombreDelMes(mes)}
        </p>
      )}
    </motion.section>
  )
}
