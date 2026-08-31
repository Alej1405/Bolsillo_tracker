import { motion, useReducedMotion } from 'motion/react'
import { curva, escalonado } from '@/movimiento'

/*
  Espera del panel.

  No es el `animate-pulse` de Tailwind —un gris que late y no pertenece a
  ninguna parte— ni la moneda del `Cargador`, que es la presentación de la
  marca y no debe repetirse cada vez que se abre una pantalla interna.

  Es un barrido de luz que recorre la silueta de lo que va a llegar: la caja
  tiene ya el tamaño de la pieza que la sustituye, así que cuando entra el dato
  nada salta. El barrido va en `translateX` sobre un gradiente, que se resuelve
  en la GPU; animar el fondo obligaría a repintar en cada cuadro.

  Con `prefers-reduced-motion` no hay barrido: queda la silueta quieta, que
  sigue diciendo lo mismo.
*/
export function Esperando({
  alto,
  className = '',
  retraso = 0,
}: {
  /** Alto de la pieza que va a ocupar este hueco, en píxeles. */
  alto: number
  className?: string
  retraso?: number
}) {
  const menosMovimiento = useReducedMotion()

  return (
    <div
      aria-hidden
      style={{ height: alto }}
      className={`relative overflow-hidden rounded-extra bg-fondo-superficie/55 ${className}`}
    >
      {!menosMovimiento && (
        <motion.div
          className="absolute inset-y-0 w-1/2"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-lavanda-200) 70%, transparent), transparent)',
          }}
          initial={{ x: '-120%' }}
          animate={{ x: '260%' }}
          transition={{
            duration: 1.6,
            delay: retraso,
            ease: curva.suave,
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        />
      )}
    </div>
  )
}

/** Varias siluetas seguidas, escalonadas como llegarán las piezas de verdad. */
export function EsperandoLista({ filas, alto }: { filas: number; alto: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: filas }, (_, i) => (
        <Esperando key={i} alto={alto} retraso={i * escalonado} className="rounded-grande" />
      ))}
    </div>
  )
}
