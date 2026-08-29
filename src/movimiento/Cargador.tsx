import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento/curvas'

/** Diámetro de la moneda en px. De aquí sale cuánto tiene que crecer para manchar. */
const DIAMETRO = 48

/**
 * Altura de la moneda en cada keyframe, en px. El suelo es el 0 y lo negativo
 * es hacia arriba.
 *
 * Arranca en positivo —por debajo del suelo— porque la moneda no cae: sale
 * lanzada, como la del árbitro antes del saque. Sube hasta el ápice del índice
 * 3, cae, y de ahí toca tres veces (índices 6, 8 y 10) con botes cada vez más
 * cortos hasta asentarse.
 *
 * Los keyframes de la subida y la caída están repartidos a propósito: con solo
 * el ápice y el suelo, el vuelo se lee como un movimiento lineal y se pierde
 * la gravedad. Son los intermedios los que dejan ver que frena arriba y
 * acelera abajo.
 */
const ALTURAS = [60, -170, -300, -330, -250, -100, 0, -95, 0, -34, 0, -11, 0]

/**
 * Cuándo cae cada keyframe dentro de la duración del vuelo, de 0 a 1.
 * El vuelo se lleva más de la mitad: es donde la moneda gira, y es lo que hay
 * que ver. Los botes finales se atropellan a propósito, que es como rebota
 * algo pequeño y duro.
 */
const TIEMPOS = [0, 0.12, 0.24, 0.3, 0.38, 0.47, 0.55, 0.66, 0.75, 0.83, 0.89, 0.94, 1]

/*
  Vueltas de la moneda, en grados, un valor por keyframe de altura.

  Gira rápido mientras vuela y va perdiendo fuerza con cada bote, como una
  moneda de verdad: al final apenas se mueve. Termina en 1800 —cinco vueltas
  exactas— y eso no es casualidad: 1800 es múltiplo de 360, así que la moneda
  se asienta de cara al frente y no de canto. Tiene que quedar redonda, porque
  desde ahí crece hasta manchar la pantalla.
*/
const GIROS = [0, 300, 620, 780, 1000, 1270, 1460, 1600, 1700, 1755, 1785, 1795, 1800]

type Fase = 'vuelo' | 'mancha' | 'fuera' | 'listo'

/**
 * Cuánto hay que escalar la moneda para que su círculo tape la pantalla entera.
 * La mancha crece desde el centro de la moneda, que está en el centro del
 * viewport: el radio que debe alcanzar es media diagonal, o sea un diámetro
 * de una diagonal completa. El 1.15 es margen para que ninguna esquina se
 * quede corta por el redondeo o por un cambio de tamaño a media animación.
 */
function factorMancha() {
  return (Math.hypot(window.innerWidth, window.innerHeight) * 1.15) / DIAMETRO
}

/**
 * Cuánto encoger el vuelo para que la moneda no se salga por arriba.
 *
 * El lanzamiento llega a 330px sobre el centro, y eso da por supuesto un
 * viewport alto. En un teléfono pequeño con las barras del navegador abiertas
 * —un SE ronda los 550px útiles— el ápice quedaría fuera de pantalla y la
 * moneda desaparecería en lo alto del vuelo, que es justo cuando más gira.
 * Devuelve 1 en cuanto hay sitio, así que en escritorio no cambia nada.
 */
function factorAltura() {
  const disponible = (window.innerHeight - DIAMETRO) / 2
  return Math.min(1, disponible / 340)
}

/**
 * Una cara de la moneda.
 *
 * Son dos, enfrentadas: la de delante y la de detrás girada 180°. Con
 * `backfaceVisibility: 'hidden'` cada una desaparece cuando le toca dar la
 * espalda, así que a media vuelta se ve la otra — que es lo que convierte el
 * giro en volumen en vez de en un disco que se aplasta.
 *
 * El relieve son tres capas de sombra sobre un degradado diagonal: la luz
 * entra por arriba a la izquierda, el borde inferior queda en penumbra y el
 * `inset` oscuro del contorno hace de canto. Es el mismo truco de una moneda
 * troquelada, que no tiene color propio — tiene una forma que atrapa la luz.
 */
function CaraMoneda({ reverso = false }: { reverso?: boolean }) {
  return (
    <span
      className="absolute inset-0 grid place-items-center rounded-full"
      style={{
        backfaceVisibility: 'hidden',
        transform: reverso ? 'rotateX(180deg)' : undefined,
        background:
          'radial-gradient(circle at 34% 26%, var(--color-lavanda-700) 0%, var(--color-lavanda-900) 52%, var(--color-lavanda-950) 100%)',
        boxShadow: [
          'inset 0 2px 3px color-mix(in srgb, var(--color-lavanda-300) 45%, transparent)',
          'inset 0 -3px 5px color-mix(in srgb, var(--color-lavanda-950) 75%, transparent)',
          'inset 0 0 0 2px color-mix(in srgb, var(--color-lavanda-950) 55%, transparent)',
        ].join(', '),
      }}
    >
      {/* El filete grabado, un poco por dentro del borde. */}
      <span
        className="absolute inset-[6px] rounded-full"
        style={{
          boxShadow:
            'inset 0 1px 1px color-mix(in srgb, var(--color-lavanda-950) 60%, transparent), 0 1px 0 color-mix(in srgb, var(--color-lavanda-300) 30%, transparent)',
        }}
      />
      {/*
        La B de Bolsillo, en hueco: sombra oscura arriba y luz abajo, al revés
        que un texto en relieve. Grabada, como en una moneda de verdad.
      */}
      <span
        className="font-titulo font-bold leading-none text-lavanda-950/70"
        style={{
          fontSize: DIAMETRO * 0.42,
          textShadow:
            '0 1px 0 color-mix(in srgb, var(--color-lavanda-300) 55%, transparent)',
        }}
      >
        B
      </span>
    </span>
  )
}

/**
 * Pantalla de carga de Bolsillo. Sobre blanco sale lanzada una moneda lavanda
 * que gira en el aire y cae rebotando; al asentarse revienta hasta manchar la
 * pantalla entera, y la mancha se desvanece dejando ver la web que ya estaba
 * montada debajo.
 *
 * Bajo prefers-reduced-motion no se muestra: la web aparece directamente. La
 * visibilidad del sitio nunca queda condicionada a que una animación termine.
 */
export function Cargador() {
  const menosMovimiento = useReducedMotion()
  const [fase, setFase] = useState<Fase>('vuelo')
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
    const margen = (duracion.vuelo + duracion.mancha + duracion.descubierta) * 1.6 * 1000
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
      /*
        La perspectiva va aquí y no en la moneda. Como propiedad CSS afecta a
        los hijos transformados, no al propio elemento: puesta en el span que
        gira no haría nada, y el `rotateX` se quedaría en un aplastamiento
        plano. Aquí es la cámara, y por eso la moneda tiene volumen.
      */
      style={{ perspective: 900 }}
      animate={{ opacity: fase === 'fuera' ? 0 : 1 }}
      transition={{ duration: duracion.descubierta, ease: curva.salida }}
      onAnimationComplete={() => {
        if (fase === 'fuera') setFase('listo')
      }}
    >
      <motion.span
        className="relative block rounded-full"
        style={{ width: DIAMETRO, height: DIAMETRO, transformStyle: 'preserve-3d' }}
        initial={{ y: alturas[0], rotateX: GIROS[0], scale: 1 }}
        /*
          Al manchar, `rotateX` se queda en el grado donde lo dejó el vuelo. Es
          deliberado: volverlo a 0 se ve igual de quieto en el fotograma final
          —1800 es múltiplo de 360— pero motion anima el camino, y la moneda
          deshace las cinco vueltas mientras crece. La expansión no gira.
        */
        animate={
          manchando
            ? { y: 0, rotateX: GIROS[GIROS.length - 1], scale: factor }
            : { y: alturas, rotateX: GIROS }
        }
        transition={
          manchando
            ? { duration: duracion.mancha, ease: curva.salida }
            : { duration: duracion.vuelo, times: TIEMPOS, ease: [...curva.vuelo] }
        }
        onAnimationComplete={() => {
          if (fase === 'vuelo') setFase('mancha')
          else if (fase === 'mancha') setFase('fuera')
        }}
      >
        {/*
          Manchando, la moneda deja de ser una moneda: un disco liso, porque a
          media pantalla el relieve y la letra se verían como un cartel.
          Girando son dos caras enfrentadas, que es lo que le da el volumen.
        */}
        {manchando ? (
          <span className="block size-full rounded-full bg-lavanda-900" />
        ) : (
          <>
            <CaraMoneda />
            <CaraMoneda reverso />
          </>
        )}
      </motion.span>
    </motion.div>
  )
}
