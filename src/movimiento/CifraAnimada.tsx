import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { curva, duracion, vista } from '@/movimiento/curvas'

type CifraAnimadaProps = {
  /** Valor final al que cuenta la cifra. */
  valor: number
  prefijo?: string
  sufijo?: string
  decimales?: number
  className?: string
  /**
   * `false` pinta el número directamente, sin contar y sin depender de que el
   * elemento entre en vista.
   *
   * Es lo que usa el panel: contar es un gesto de portada —premia el scroll y
   * celebra una cifra de vitrina—, pero ahí dentro el saldo es el dato que la
   * persona vino a leer, y retrasarlo un segundo no lo hace mejor. Además el
   * disparador es `useInView`, que en una pantalla que ya está a la vista al
   * montar puede no llegar a dispararse nunca y dejar el número en cero.
   */
  animar?: boolean
}

/** Formatea con separadores de miles "." y decimales "," (es-EC). */
function formatear(n: number, decimales: number) {
  return n.toLocaleString('es-EC', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/**
 * Cifra que cuenta desde 0 hasta su valor cuando entra al viewport.
 *
 * A diferencia de `Revelar`, que usa `whileInView`, aquí hace falta saber el
 * momento exacto en que entra en vista para arrancar el contador, así que el
 * disparador es `useInView` sobre el propio span.
 *
 * Bajo prefers-reduced-motion muestra el valor final de una.
 */
export function CifraAnimada({
  valor,
  prefijo = '',
  sufijo = '',
  decimales = 2,
  className,
  animar = true,
}: CifraAnimadaProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const enVista = useInView(ref, vista.cifra)
  const menosMovimiento = useReducedMotion()
  const mv = useMotionValue(0)
  const texto = useTransform(mv, (v) => `${prefijo}${formatear(v, decimales)}${sufijo}`)

  useEffect(() => {
    if (!animar) return
    if (!enVista) return
    if (menosMovimiento) {
      mv.set(valor)
      return
    }
    const control = animate(mv, valor, { duration: duracion.conteo, ease: curva.salida })
    return () => control.stop()
  }, [animar, enVista, valor, menosMovimiento, mv])

  if (!animar) {
    return (
      <span className={className}>{`${prefijo}${formatear(valor, decimales)}${sufijo}`}</span>
    )
  }

  return (
    <motion.span ref={ref} className={className}>
      {texto}
    </motion.span>
  )
}
