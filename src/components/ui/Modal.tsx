import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento'

type ModalProps = {
  abierto: boolean
  /** Se llama al pulsar Escape o el fondo. El botón de dentro lo llama también. */
  onCerrar: () => void
  /** Describe el diálogo para un lector de pantalla. Es el título visible. */
  titulo: string
  children: React.ReactNode
}

/**
 * Diálogo centrado sobre un fondo oscurecido.
 *
 * Lo mínimo que un modal tiene que hacer bien y casi nunca hace: anunciarse
 * como diálogo, llevarse el foco al abrirse, devolverlo a donde estaba al
 * cerrarse, cerrarse con Escape y no dejar que la página de detrás haga
 * scroll.
 */
export function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  const menosMovimiento = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const focoPrevio = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!abierto) return

    // Quién tenía el foco antes, para devolvérselo al cerrar. Sin esto, quien
    // navega con teclado vuelve al principio del documento.
    focoPrevio.current = document.activeElement as HTMLElement | null

    const enfocables = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('disabled'))

    enfocables()[0]?.focus()

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar()
        return
      }
      if (e.key !== 'Tab') return

      /*
        Trampa de foco. Sin esto el tabulador se escapa del diálogo hacia el
        formulario de detrás: quien navega con teclado sigue tabulando por una
        página que no puede ver —está tapada— y se pierde. Es el fallo que
        convierte un modal en una barrera.

        Se recalcula la lista en cada Tab en vez de guardarla al abrir, porque
        el contenido puede cambiar mientras está abierto (un botón que se
        deshabilita, un campo que aparece).
      */
      const lista = enfocables()
      if (lista.length === 0) return

      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      const activo = document.activeElement

      if (e.shiftKey && activo === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alPulsar)

    const scrollPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = scrollPrevio
      focoPrevio.current?.focus()
    }
  }, [abierto, onCerrar])

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center px-5"
          initial={menosMovimiento ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duracion.cambio, ease: curva.salida }}
        >
          {/*
            El fondo es un div y no un button: un botón que envuelve todo el
            diálogo lo anidaría dentro, y anidar controles rompe el orden de
            lectura. Con `aria-hidden` el lector no lo anuncia; quien no usa
            ratón cierra con Escape.
          */}
          <div
            aria-hidden
            onClick={onCerrar}
            className="absolute inset-0 bg-tinta-950/45 backdrop-blur-sm"
          />

          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            initial={menosMovimiento ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: duracion.panel, ease: curva.salida }}
            className="relative w-full max-w-[440px] rounded-extra bg-fondo-superficie p-8 shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--color-tinta-950)_35%,transparent)]"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
