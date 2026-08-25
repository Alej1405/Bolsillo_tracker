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
}: CifraAnimadaProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const enVista = useInView(ref, vista.cifra)
  const menosMovimiento = useReducedMotion()
  const mv = useMotionValue(0)
  const texto = useTransform(mv, (v) => `${prefijo}${formatear(v, decimales)}${sufijo}`)

  useEffect(() => {
    if (!enVista) return
    if (menosMovimiento) {
      mv.set(valor)
      return
    }
    const control = animate(mv, valor, { duration: duracion.conteo, ease: curva.salida })
    return () => control.stop()
  }, [enVista, valor, menosMovimiento, mv])

  return (
    <motion.span ref={ref} className={className}>
      {texto}
    </motion.span>
  )
}
