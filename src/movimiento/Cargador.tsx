import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento/curvas'

/** Diámetro del punto en px. De aquí sale cuánto tiene que crecer para manchar. */
const DIAMETRO = 28

/**
 * Altura del punto en cada keyframe, en px. El suelo es el 0.
 * Toca tres veces —índices 1, 3 y 5— y cada bote sube menos que el anterior.
 * El tercer contacto no rebota: ahí revienta.
 */
const ALTURAS = [-300, 0, -168, 0, -76, 0]

/** Cuándo cae cada keyframe dentro de la duración del rebote, de 0 a 1. */
const TIEMPOS = [0, 0.3, 0.5, 0.72, 0.86, 1]

/** Achatado y estirado del punto: se aplasta al tocar el suelo y se estira al subir. */
const ANCHO = [1, 1.28, 1, 1.2, 1, 1.14]
const ALTO = [1, 0.74, 1, 0.82, 1, 0.88]

type Fase = 'rebote' | 'mancha' | 'fuera' | 'listo'

/**
 * Cuánto hay que escalar el punto para que su círculo tape la pantalla entera.
 * La mancha crece desde el centro del punto, que está en el centro del
 * viewport: el radio que debe alcanzar es media diagonal, o sea un diámetro
 * de una diagonal completa. El 1.15 es margen para que ninguna esquina se
 * quede corta por el redondeo o por un cambio de tamaño a media animación.
 */
function factorMancha() {
  return (Math.hypot(window.innerWidth, window.innerHeight) * 1.15) / DIAMETRO
}

/**
 * Pantalla de carga de Bolsillo. Sobre blanco cae un punto lavanda que rebota
 * dos veces; al tercer impacto revienta hasta manchar la pantalla entera, y la
 * mancha se desvanece dejando ver la web que ya estaba montada debajo.
 *
 * Bajo prefers-reduced-motion no se muestra: la web aparece directamente. La
 * visibilidad del sitio nunca queda condicionada a que una animación termine.
 */
export function Cargador() {
  const menosMovimiento = useReducedMotion()
  const [fase, setFase] = useState<Fase>('rebote')
  const [factor] = useState(factorMancha)

  const oculto = menosMovimiento || fase === 'listo'

  // Mientras el cargador tapa la pantalla no se puede hacer scroll detrás.
  useEffect(() => {
    if (oculto) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [oculto])

  if (oculto) return null

  const manchando = fase === 'mancha' || fase === 'fuera'

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center bg-white"
      animate={{ opacity: fase === 'fuera' ? 0 : 1 }}
      transition={{ duration: duracion.descubierta, ease: curva.salida }}
      onAnimationComplete={() => {
        if (fase === 'fuera') setFase('listo')
      }}
    >
      <motion.span
        className="block rounded-full bg-lavanda-900"
        /*
          El origen cambia con la fase, y por eso la mancha llena la pantalla:
          rebotando es `bottom`, para que al aplastarse el punto se hunda contra
          el suelo y no atraviese; al manchar pasa a `center`, porque con el
          origen en la base el círculo solo crecería hacia arriba y dejaría sin
          pintar la mitad de abajo. El cambio no se nota: en ese instante el
          punto está casi sin deformar y el salto es de un par de píxeles.
        */
        style={{
          width: DIAMETRO,
          height: DIAMETRO,
          transformOrigin: manchando ? 'center' : 'center bottom',
        }}
        initial={{ y: ALTURAS[0], scaleX: 1, scaleY: 1 }}
        animate={
          manchando
            ? { y: 0, scaleX: factor, scaleY: factor }
            : { y: ALTURAS, scaleX: ANCHO, scaleY: ALTO }
        }
        transition={
          manchando
            ? { duration: duracion.mancha, ease: curva.salida }
            : { duration: duracion.rebote, times: TIEMPOS, ease: [...curva.rebote] }
        }
        onAnimationComplete={() => {
          if (fase === 'rebote') setFase('mancha')
          else if (fase === 'mancha') setFase('fuera')
        }}
      />
    </motion.div>
  )
}
