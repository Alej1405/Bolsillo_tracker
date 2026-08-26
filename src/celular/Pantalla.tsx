import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useAparicion } from '@/movimiento'

/**
 * Envoltorio común de las pantallas de celular.
 *
 * El `pb` reserva la altura de la barra inferior más el área segura: sin eso
 * el último bloque de cada pantalla queda debajo de la barra y no se puede
 * leer ni tocar. Es el error clásico al portar una web a formato de app.
 *
 * La entrada se anima al montar, no al hacer scroll: aquí cambiar de pantalla
 * es una navegación, y lo que entra ya está en pantalla desde el primer
 * fotograma.
 */
export function Pantalla({
  titulo,
  entradilla,
  centrada = false,
  children,
}: {
  titulo: string
  /** Línea bajo el título. Opcional: Inicio no la usa, lleva su propio hero. */
  entradilla?: string
  /** Centra el bloque en el alto de la pantalla. Para vistas cortas, que si no
      quedan pegadas arriba con media pantalla de fondo vacío debajo. */
  centrada?: boolean
  children: ReactNode
}) {
  const aparece = useAparicion()

  return (
    <main
      className={`min-h-screen px-5 pb-[calc(58px+env(safe-area-inset-bottom)+2.5rem)] ${
        centrada ? 'flex flex-col justify-center pt-0' : 'pt-10'
      }`}
    >
      <motion.h1
        {...aparece(0.04)}
        className="font-titulo text-titulo-mayor leading-[1.15] font-extrabold tracking-[-0.02em] text-balance text-texto-principal"
      >
        {titulo}
      </motion.h1>

      {entradilla && (
        <motion.p
          {...aparece(0.1)}
          className="mt-3 text-cuerpo leading-relaxed text-texto-secundario"
        >
          {entradilla}
        </motion.p>
      )}

      <motion.div {...aparece(0.18)} className="mt-8">
        {children}
      </motion.div>
    </main>
  )
}
