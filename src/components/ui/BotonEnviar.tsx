import { AnimatePresence, motion } from 'motion/react'
import { Boton } from '@/components/ui/Boton'
import { curva, duracion } from '@/movimiento'

/*
  Los tres actos del despacho, como fracción de `duracion.despacho`. Están aquí
  y no repartidos por el componente para que se lea la secuencia de un vistazo
  y para que cambiar el ritmo sea mover un número, no recalcular cuatro.

    doblar   la hoja baja y se encoge hasta caber en el sobre
    cerrar   la solapa cae sobre ella
    volar    el sobre despega hacia arriba y a la derecha
*/
const ACTOS = { doblar: 0.38, cerrar: 0.26, volar: 0.36 } as const

const seg = (fraccion: number) => duracion.despacho * fraccion

type BotonEnviarProps = {
  children: React.ReactNode
  /**
   * Si la secuencia está corriendo. Es controlado a propósito: el botón vive
   * dentro de un <form> y quien sabe cuándo empieza y termina un envío es el
   * formulario, no el botón. Si el botón llevara su propio estado por
   * `onClick`, competiría con el `onSubmit` — y con Enter desde un campo se
   * dispararía el envío sin animación.
   */
  despachando: boolean
  className?: string
}

/**
 * Botón de enviar con la secuencia del mensaje despachado: la hoja se dobla,
 * entra en el sobre, la solapa se cierra y el sobre sale volando.
 *
 * El sobre solo existe mientras dura el envío. Al montarse arranca la
 * secuencia sola: ninguna pieza lleva `initial`, así los keyframes corren
 * desde su primer valor en cuanto aparecen en pantalla.
 *
 * No decide nada; solo dibuja el estado que le pasan.
 */
export function BotonEnviar({ children, despachando, className = '' }: BotonEnviarProps) {
  return (
    <Boton
      type="submit"
      disabled={despachando}
      aria-busy={despachando}
      className={`${despachando ? 'bg-lavanda-900 hover:bg-lavanda-900' : ''} ${className}`}
    >
      {children}
      {/*
        El icono entra abriendo su propio hueco —el `width` de 0 a 28— en vez
        de aparecer de golpe: si se materializara ya ancho, el botón daría un
        respingo justo en el fotograma del clic. Por eso tampoco hay `gap` fijo
        en el botón: el espacio lo trae el icono y se lo lleva al irse.
      */}
      <AnimatePresence>
        {despachando && (
          <motion.span
            key="sobre"
            className="inline-flex overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 28, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: duracion.toque, ease: curva.salida }}
          >
            <svg
              viewBox="0 0 24 24"
              width={20}
              height={20}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="ml-2 shrink-0 overflow-visible"
            >
              {/*
                Todo cuelga de este grupo, que es el que despega al final. Así
                el sobre y lo que lleva dentro se van juntos, en vez de tener
                que animar cada pieza con la misma trayectoria.
              */}
              <motion.g
                animate={{ x: [0, 0, 26], y: [0, 0, -18], opacity: [1, 1, 0] }}
                transition={{
                  duration: duracion.despacho,
                  times: [0, ACTOS.doblar + ACTOS.cerrar, 1],
                  ease: curva.salida,
                }}
              >
                {/*
                  La hoja. Asoma por encima del sobre y baja encogiéndose hasta
                  desaparecer dentro. El `scaleY` es el doblez: una hoja no
                  entra entera en un sobre, se dobla.
                */}
                <motion.g
                  style={{ originX: '12px', originY: '9px' }}
                  animate={{ y: [0, 7], scaleY: [1, 0.35], opacity: [1, 0] }}
                  transition={{ duration: seg(ACTOS.doblar), ease: 'easeIn' }}
                >
                  <rect x="7" y="1.5" width="10" height="9" rx="1.2" />
                  <line x1="9.2" y1="4.5" x2="14.8" y2="4.5" />
                  <line x1="9.2" y1="7.2" x2="13" y2="7.2" />
                </motion.g>

                {/* El cuerpo del sobre. Quieto: es el único que no se mueve. */}
                <rect x="2.5" y="9" width="19" height="12.5" rx="2" />

                {/*
                  La solapa, que cae cuando la hoja ya está dentro. Gira sobre
                  su borde de arriba —de ahí el `originY` en 9— porque una
                  solapa pivota sobre el pliegue, no sobre su centro.
                */}
                <motion.path
                  d="M2.5 10 L12 16.5 L21.5 10"
                  style={{ originX: '12px', originY: '9px' }}
                  animate={{ scaleY: [0.15, 1], opacity: [0.35, 1] }}
                  transition={{
                    duration: seg(ACTOS.cerrar),
                    delay: seg(ACTOS.doblar),
                    ease: curva.salida,
                  }}
                />
              </motion.g>
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </Boton>
  )
}
