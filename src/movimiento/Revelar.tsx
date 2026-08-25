import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion, vista } from '@/movimiento/curvas'

type RevelarProps = {
  children: ReactNode
  /** Retraso en segundos, para escalonar hermanos de una misma fila. */
  retraso?: number
  /** Desplazamiento vertical inicial en px. */
  y?: number
  /** Umbral de scroll. Por defecto `vista.bloque`; súbelo para piezas chicas. */
  umbral?: (typeof vista)[keyof typeof vista]
  className?: string
}

/**
 * Revela su contenido cuando entra al viewport: sube y aparece.
 * Es el disparador de scroll de la landing — si una sección se anima al bajar,
 * es porque está envuelta en este componente.
 *
 * Bajo prefers-reduced-motion devuelve un div normal, ya visible: la
 * visibilidad nunca queda condicionada a que una animación llegue a correr.
 */
export function Revelar({
  children,
  retraso = 0,
  y = 24,
  umbral = vista.bloque,
  className,
}: RevelarProps) {
  const menosMovimiento = useReducedMotion()

  if (menosMovimiento) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={umbral}
      transition={{ duration: duracion.revelado, delay: retraso, ease: curva.salida }}
    >
      {children}
    </motion.div>
  )
}
