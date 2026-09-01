import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/*
  La curva de los paneles de iOS. Sale rápido y frena largo, que es lo que hace
  que una hoja parezca que pesa en vez de aparecer de golpe.
*/
const CURVA_HOJA = [0.32, 0.72, 0, 1] as const

/**
 * Un panel que sube desde abajo. El equivalente móvil de un diálogo.
 *
 * No es un modal centrado con otro tamaño: una hoja entra por donde está el
 * pulgar, se cierra arrastrándola hacia abajo y deja ver que la pantalla sigue
 * detrás. Un diálogo en el centro de un teléfono obliga a estirar el dedo hasta
 * arriba para cerrarlo.
 *
 * Se arrastra para cerrar, y basta con un gesto rápido: si sueltas con
 * velocidad hacia abajo se va aunque no hayas bajado ni la mitad. Exigir
 * recorrido completo hace que se sienta pegajosa.
 */
export function Hoja({
  abierta,
  onCerrar,
  titulo,
  children,
}: {
  abierta: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}) {
  const menosMovimiento = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)

  /* Igual que en `Modal`: una flecha inline en cada render remontaría el
     efecto con cada tecla y robaría el foco de lo que estés escribiendo. */
  const alCerrar = useRef(onCerrar)
  useEffect(() => {
    alCerrar.current = onCerrar
  }, [onCerrar])

  /*
    Escape cierra, y el fondo deja de desplazarse mientras está abierta: si la
    página de detrás se mueve al arrastrar, el gesto de cerrar compite con el
    scroll y ninguno de los dos funciona bien.
  */
  useEffect(() => {
    if (!abierta) return

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar.current()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alTeclear)

    /* El foco entra en la hoja: si se queda detrás, tabular recorre lo tapado. */
    panel.current?.focus()

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', alTeclear)
    }
  }, [abierta])

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/*
            El velo es un div y no un button: un botón que envuelve la pantalla
            entera se anuncia como un control gigante a un lector de pantalla.
            Escape y el propio gesto ya cierran.
          */}
          <div
            aria-hidden
            onClick={onCerrar}
            className="absolute inset-0 bg-tinta-950/40 backdrop-blur-[2px]"
          />

          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            tabIndex={-1}
            initial={menosMovimiento ? { opacity: 0 } : { transform: 'translateY(100%)' }}
            animate={menosMovimiento ? { opacity: 1 } : { transform: 'translateY(0%)' }}
            exit={menosMovimiento ? { opacity: 0 } : { transform: 'translateY(100%)' }}
            transition={{ duration: 0.32, ease: CURVA_HOJA }}
            drag={menosMovimiento ? false : 'y'}
            /*
              Solo hacia abajo, y con resistencia si se tira hacia arriba: las
              cosas del mundo no se detienen en seco contra una pared invisible,
              frenan.
            */
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              /*
                Se va si la arrastraste lo suficiente O si la soltaste con
                impulso. Un golpe rápido basta: obligar a recorrer media
                pantalla es lo que hace que una hoja se sienta pesada.
              */
              if (info.offset.y > 120 || info.velocity.y > 500) onCerrar()
            }}
            className="relative max-h-[85dvh] overflow-y-auto rounded-t-maximo bg-fondo-superficie pb-[calc(env(safe-area-inset-bottom)+1.5rem)] outline-none"
          >
            {/* El tirador dice que se puede arrastrar sin tener que explicarlo. */}
            <div className="sticky top-0 z-10 flex justify-center bg-fondo-superficie pt-3 pb-2">
              <span aria-hidden className="h-1 w-10 rounded-full bg-borde-fuerte" />
            </div>

            <div className="px-5 pb-2">
              <h2 className="font-titulo text-cuerpo-amplio font-bold text-texto-principal">
                {titulo}
              </h2>
            </div>

            <div className="px-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
