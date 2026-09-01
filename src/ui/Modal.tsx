import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento'
import { XIcon } from '@phosphor-icons/react'
import { foco } from '@/helpers'

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
 *
 * Se dibuja en un portal sobre `document.body`, no donde está escrito. Un
 * `position: fixed` se ancla al viewport solo si ningún ancestro tiene
 * `transform`, `filter`, `backdrop-filter` o `will-change`: cualquiera de esos
 * crea un bloque contenedor y el diálogo se encierra dentro de él. Pasaba con
 * el `backdrop-blur` de la tarjeta del formulario, que dejaba el popup metido
 * en el ancho de la tarjeta en vez de cubrir la pantalla.
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

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          /*
            `dvh` y no `vh`: en un teléfono la barra del navegador aparece y
            desaparece, y `100vh` mide siempre la ventana grande — el diálogo
            queda centrado respecto a un alto que en ese momento no existe y
            se va hacia abajo. `dvh` sigue al alto real.

            El `py` deja aire arriba y abajo para que, con el teclado abierto,
            el diálogo no quede pegado a los bordes.
          */
          className="fixed inset-0 z-[90] grid h-[100dvh] place-items-center overflow-y-auto px-5 py-6"
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
            /*
              `my-auto` con el padre en overflow: centra cuando cabe y deja
              hacer scroll cuando no, en vez de recortar la parte de arriba —
              que es lo que hace `place-items-center` a secas con contenido
              más alto que la pantalla.
            */
            className="relative my-auto w-full max-w-[440px] rounded-extra bg-fondo-superficie p-6 shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--color-tinta-950)_35%,transparent)] sm:p-8"
          >
            {/*
              La salida visible. El diálogo ya se cierra con Escape y con un
              clic fuera, pero las dos son invisibles: quien no las conoce se
              queda buscando cómo salir.

              Va en el Modal y no en cada formulario para que los diálogos se
              cierren todos igual, y `absolute` para que no empuje el contenido
              ni obligue a cada uno a dejarle sitio.
            */}
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className={`absolute top-4 right-4 grid size-9 place-items-center rounded-full text-texto-tenue transition-colors hover:bg-fondo-sutil hover:text-texto-principal ${foco}`}
            >
              <XIcon size={18} weight="bold" aria-hidden />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
