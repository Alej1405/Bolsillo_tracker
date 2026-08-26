import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento/curvas'

/** Diámetro del punto en px. De aquí sale cuánto tiene que crecer para manchar. */
const DIAMETRO = 28

/**
 * Altura del punto en cada keyframe, en px. El suelo es el 0.
 *
 * Toca tres veces —índices 2, 6 y 10— y cada bote sube menos que el anterior.
 * Entre impacto e impacto hay un keyframe de caída y otro de despegue: son los
 * que dejan ver la deformación. Sin ellos la gota se aplasta y se recupera en
 * el mismo instante, y el ojo no llega a leerlo.
 *
 * Del 10 al 11 no hay vuelo: la gota se queda en el suelo y sigue extendiéndose.
 * Ahí es donde se derrite, justo antes de reventar.
 */
const ALTURAS = [-300, -120, 0, -20, -168, -60, 0, -15, -76, -25, 0, 0]

/**
 * Cuándo cae cada keyframe dentro de la duración del rebote, de 0 a 1.
 * El último tramo se lleva el 10% —el más largo de todos en proporción a lo
 * poco que se mueve— porque es el derretimiento, y es lo que hay que ver.
 */
const TIEMPOS = [0, 0.16, 0.26, 0.33, 0.46, 0.56, 0.64, 0.7, 0.78, 0.85, 0.9, 1]

/*
  Achatado y estirado, el "squash and stretch" de manual: cayendo la gota se
  alarga en el sentido del movimiento (ancho < 1, alto > 1) y al tocar el suelo
  se aplasta (ancho > 1, alto < 1). El volumen se mantiene a ojo — un eje crece
  cuando el otro encoge—, que es lo que hace que se lea como materia y no como
  un círculo que cambia de tamaño.

  El último par es el derretimiento: el aplastado más fuerte de los tres y sin
  recuperación.
*/
const ANCHO = [1, 0.86, 1.34, 0.92, 1, 0.9, 1.28, 0.94, 1, 0.93, 1.4, 1.62]
const ALTO = [1, 1.18, 0.68, 1.12, 1, 1.12, 0.74, 1.08, 1, 1.09, 0.6, 0.44]

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
 * Cuánto encoger el rebote para que el punto no arranque fuera de la pantalla.
 *
 * El punto sale de 300px sobre el centro, y eso da por supuesto un viewport
 * alto. En un teléfono pequeño con las barras del navegador abiertas —un SE
 * ronda los 550px útiles— la caída empezaría por encima del borde y se perdería
 * el primer tramo, que es justo donde la gota se estira. Devuelve 1 en cuanto
 * hay sitio, así que en escritorio no cambia nada.
 */
function factorAltura() {
  const disponible = (window.innerHeight - DIAMETRO) / 2
  return Math.min(1, disponible / 320)
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
  const [alto] = useState(factorAltura)
  const alturas = ALTURAS.map((a) => a * alto)

  const oculto = menosMovimiento || fase === 'listo'

  /*
    Red de seguridad. La secuencia avanza encadenando tres `onAnimationComplete`,
    y si uno solo no dispara —una pestaña que estuvo en segundo plano, un
    remontaje de StrictMode en desarrollo, un fotograma perdido— el cargador se
    queda tapando la web para siempre.

    Que la página sea visible no puede depender de que una animación termine
    bien. Pasado el tiempo total de la secuencia con margen, se descubre igual.
  */
  useEffect(() => {
    const margen = (duracion.rebote + duracion.mancha + duracion.descubierta) * 1.6 * 1000
    const id = setTimeout(() => setFase('listo'), margen)
    return () => clearTimeout(id)
  }, [])

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
          pintar la mitad de abajo.

          El cambio desplaza el punto unos 8px hacia abajo, porque llega
          derretido (alto 0.44) y no redondo. No se ve porque ocurre en el
          mismo fotograma en que empieza a escalar hacia toda la pantalla: para
          cuando el ojo podría notar el salto, el punto ya mide media diagonal.
        */
        style={{
          width: DIAMETRO,
          height: DIAMETRO,
          transformOrigin: manchando ? 'center' : 'center bottom',
        }}
        initial={{ y: alturas[0], scaleX: 1, scaleY: 1 }}
        animate={
          manchando
            ? { y: 0, scaleX: factor, scaleY: factor }
            : { y: alturas, scaleX: ANCHO, scaleY: ALTO }
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
