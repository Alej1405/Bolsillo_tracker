import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion, vista } from '@/movimiento/curvas'

/**
 * Barra que crece desde su base al entrar en vista.
 *
 * El alto va en el `style` y la animación es sobre `scaleY` con origen abajo:
 * transformar es más barato que animar la altura, que obliga al navegador a
 * recalcular el layout en cada cuadro.
 */
export function BarraVertical({
  alto,
  clase,
  ancho = 'w-16',
  retraso = 0,
}: {
  /** Alto final en px. */
  alto: number
  /** Clases de color de fondo, p. ej. `bg-ingreso`. */
  clase: string
  ancho?: string
  retraso?: number
}) {
  const menosMovimiento = useReducedMotion()
  return (
    <motion.div
      className={`${ancho} rounded-t-lg ${clase}`}
      style={{ height: alto, transformOrigin: 'bottom' }}
      initial={menosMovimiento ? false : { scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={vista.pieza}
      transition={{ duration: duracion.crecimiento, delay: retraso, ease: curva.salida }}
    />
  )
}

/**
 * Barra de progreso horizontal que crece hasta un porcentaje al entrar en vista.
 * Aquí sí se anima el ancho: el relleno vive dentro de un carril con
 * `overflow-hidden` y escalarlo deformaría los extremos redondeados.
 */
export function BarraHorizontal({
  porcentaje,
  color,
  retraso = 0,
}: {
  porcentaje: number
  /** Color CSS del relleno, normalmente una variable `--color-grafico-N`. */
  color: string
  retraso?: number
}) {
  const menosMovimiento = useReducedMotion()
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fondo-sutil">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={menosMovimiento ? false : { width: 0 }}
        whileInView={{ width: `${porcentaje}%` }}
        viewport={vista.pieza}
        transition={{ duration: duracion.crecimiento, delay: retraso, ease: curva.salida }}
      />
    </div>
  )
}
