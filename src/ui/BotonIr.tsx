import { ArrowRightIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Boton } from '@/ui/Boton'
import { curva, duracion } from '@/movimiento'

type BotonIrProps = {
  children: React.ReactNode
  /** Si la navegación ya está en marcha. Viene de `useAcuse`. */
  yendo: boolean
  /**
   * `button` para un botón suelto; `submit` cuando vive dentro de un <form> y
   * es el formulario quien dispara la navegación en su `onSubmit` — así Enter
   * en un campo hace exactamente lo mismo que pulsarlo.
   */
  type?: 'button' | 'submit'
  onClick?: () => void
  variante?: React.ComponentProps<typeof Boton>['variante']
  className?: string
}

/**
 * Botón que acusa el clic: se oscurece y pone la flecha en marcha mientras la
 * navegación está en camino.
 *
 * No navega él — solo dibuja el estado que le pasan. Quién navega y cuándo lo
 * decide `useAcuse`, porque el mismo viaje puede empezar en este botón o en el
 * Enter del campo que tiene al lado.
 */
export function BotonIr({
  children,
  yendo,
  type = 'button',
  onClick,
  variante,
  className = '',
}: BotonIrProps) {
  return (
    <Boton
      type={type}
      variante={variante}
      onClick={onClick}
      aria-busy={yendo}
      className={`group gap-2 ${yendo ? 'bg-lavanda-950 hover:bg-lavanda-950' : ''} ${className}`}
    >
      {children}
      {/*
        La flecha no aparece al pulsar: ya está ahí, y lo que cambia es que se
        pone en marcha. Un icono que aparece de la nada desplaza el texto y el
        botón da un respingo justo cuando el usuario acaba de acertarle.

        Quieta, avanza un paso al pasar el ratón. En marcha, sale por la
        derecha y vuelve a entrar por la izquierda, en bucle, hasta que la
        pantalla cambia.
      */}
      <motion.span
        className="inline-flex overflow-hidden"
        animate={yendo ? { x: [0, 14, -14, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
        transition={
          yendo
            ? {
                duration: duracion.acuse,
                times: [0, 0.45, 0.55, 1],
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: duracion.toque, ease: curva.salida }
        }
      >
        <ArrowRightIcon
          size={18}
          weight="bold"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </motion.span>
    </Boton>
  )
}
