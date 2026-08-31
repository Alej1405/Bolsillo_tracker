import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { curva } from '@/movimiento'

type Lado = 'arriba' | 'abajo'

/*
  Cuánto espera antes de aparecer.

  La espera existe para que pasar el mouse por encima de camino a otra cosa no
  llene la pantalla de globos. Pero una vez que hay uno abierto, los de al lado
  tienen que abrirse al instante: la persona ya está leyendo etiquetas, y
  volver a esperar medio segundo en cada botón hace que toda la barra se sienta
  lenta.

  `ultimoCierre` es ese estado compartido. Vive en el módulo y no en un
  contexto porque no hay nada que renderizar con él: solo se consulta.
*/
const ESPERA = 400
const GRACIA = 300
let ultimoCierre = 0

/** Separación entre el globo y el elemento, en píxeles. */
const AIRE = 8

export function Pista({
  texto,
  lado = 'arriba',
  children,
}: {
  /** Lo que dice el globo. Suele ser el nombre de la acción. */
  texto: ReactNode
  lado?: Lado
  /** El elemento que lo dispara. Recibe los manejadores y `aria-describedby`. */
  children: ReactElement<Record<string, unknown>>
}) {
  const id = useId()
  const menosMovimiento = useReducedMotion()
  const ancla = useRef<HTMLElement | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const [visible, setVisible] = useState(false)
  const [instantanea, setInstantanea] = useState(false)
  const [posicion, setPosicion] = useState({ x: 0, y: 0 })

  const colocar = () => {
    const caja = ancla.current?.getBoundingClientRect()
    if (!caja) return
    setPosicion({
      x: caja.left + caja.width / 2,
      y: lado === 'arriba' ? caja.top - AIRE : caja.bottom + AIRE,
    })
  }

  const abrir = (sinEspera = false) => {
    window.clearTimeout(temporizador.current)
    // Encadenada: si acaba de cerrarse otra, esta no vuelve a hacer esperar.
    const seguida = Date.now() - ultimoCierre < GRACIA
    const ya = sinEspera || seguida
    setInstantanea(ya)

    if (ya) {
      colocar()
      setVisible(true)
      return
    }
    temporizador.current = window.setTimeout(() => {
      colocar()
      setVisible(true)
    }, ESPERA)
  }

  const cerrar = () => {
    window.clearTimeout(temporizador.current)
    if (visible) ultimoCierre = Date.now()
    setVisible(false)
  }

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  // Escape la cierra, y el scroll también: al desplazarse queda flotando lejos
  // de su botón, porque el globo va en un portal con posición fija.
  useEffect(() => {
    if (!visible) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', alPulsar)
    window.addEventListener('scroll', cerrar, true)
    return () => {
      window.removeEventListener('keydown', alPulsar)
      window.removeEventListener('scroll', cerrar, true)
    }
  })

  const disparador = cloneElement(children, {
    ref: (nodo: HTMLElement | null) => {
      ancla.current = nodo
      const original = (children as unknown as { ref?: unknown }).ref
      if (typeof original === 'function') original(nodo)
      else if (original && typeof original === 'object') {
        ;(original as { current: HTMLElement | null }).current = nodo
      }
    },
    'aria-describedby': visible ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      ;(children.props.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e)
      abrir()
    },
    onMouseLeave: (e: React.MouseEvent) => {
      ;(children.props.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e)
      cerrar()
    },
    // Con teclado aparece de una: quien tabula ya decidió llegar hasta aquí.
    onFocus: (e: React.FocusEvent) => {
      ;(children.props.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e)
      abrir(true)
    },
    onBlur: (e: React.FocusEvent) => {
      ;(children.props.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e)
      cerrar()
    },
  })

  return (
    <>
      {disparador}

      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.span
              id={id}
              role="tooltip"
              className="pointer-events-none fixed z-50 rounded-medio bg-fondo-inverso px-2.5 py-1.5 text-nota font-medium text-texto-inverso shadow-[0_8px_24px_-8px_rgba(2,6,23,0.4)]"
              style={{
                left: posicion.x,
                top: posicion.y,
                translateX: '-50%',
                translateY: lado === 'arriba' ? '-100%' : '0%',
                transformOrigin: lado === 'arriba' ? 'bottom center' : 'top center',
              }}
              /*
                Nunca desde `scale(0)`: nada en el mundo real aparece de la
                nada. Y si viene encadenada de otra, sin animación: ya hay un
                globo idéntico en pantalla, animar el segundo lo hace más lento
                sin que se vea mejor.
              */
              initial={
                menosMovimiento || instantanea ? { opacity: 1 } : { opacity: 0, scale: 0.94 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={menosMovimiento ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: instantanea ? 0 : 0.14, ease: curva.salida }}
            >
              {texto}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
