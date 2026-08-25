import { useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento/curvas'

/**
 * Aparición al montar, no al hacer scroll. Es para lo que ya está en pantalla
 * cuando carga la página (el hero): esperar a que entre en vista no tendría
 * sentido, porque nunca sale de ella.
 *
 * Devuelve una función que produce las props de `motion` para un retraso dado,
 * pensada para esparcirse sobre el elemento en vez de envolverlo, para no
 * meter un div extra en medio del layout:
 *
 *     const aparece = useAparicion()
 *     <motion.p {...aparece(0.14)} className="mt-4">…</motion.p>
 *
 * Bajo prefers-reduced-motion devuelve un objeto vacío y el elemento se
 * renderiza estático, ya visible.
 */
export function useAparicion() {
  const menosMovimiento = useReducedMotion()

  return function aparece(retraso = 0) {
    if (menosMovimiento) return {}
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duracion.aparicion, delay: retraso, ease: curva.salida },
    }
  }
}
