import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { duracion } from '@/movimiento'

/*
  ── Fondo de Bolsillo: papel de valores ──────────────────────────────────

  Antes esto eran cinco orbes de color con `blur(190px)`. Ese vocabulario
  —manchas redondas, pastel, sin estructura— es el de una aplicación de
  bienestar, no el del dinero. Se cambió por el material del que el dinero
  está hecho de verdad.

  El fondo es un billete: guilloché sobre papel de contabilidad. El guilloché
  es el grabado de líneas entrelazadas que llevan los billetes, los cheques y
  los certificados de acciones desde el siglo XIX; existe porque es difícil de
  falsificar, y por eso significa exactamente lo que este producto necesita
  significar: precisión, valor, algo que no se improvisa. La retícula de
  debajo es el papel del libro mayor.

  Se prefirió a la trama de cuadrícula con resplandor que usa hoy cualquier
  producto de software: aquella se lee genérica, esta pertenece al rubro.

  El tono más oscuro del lienzo no es libre: sobre el fondo va texto directo
  en `--color-texto-secundario` (#475569), y por debajo de `tinta-300` ese
  texto baja de 4.5:1 y deja de cumplir AA. El degradado llega justo hasta
  ahí y no más.

  Tres capas, de atrás hacia adelante:

    1. Lienzo    degradado vertical en azul-pizarra (la escala `marca`).
                 NO es lavanda: el lavanda es el color de la fotografía del
                 hero, y si el fondo lo repite la foto deja de destacar y el
                 lavanda se vuelve el único color de la página. En pizarra la
                 foto contrasta —azul frío contra violeta— y el lavanda pasa
                 a lo que debe ser: un acento, no el protagonista.
    2. Retícula  papel de contabilidad. Línea fina cada 32 px y línea de
                 registro cada 128 px, como el rayado de un libro mayor.
    3. Rosetones dos guilloches, uno grande arriba a la derecha y otro
                 cortado por el borde inferior izquierdo. Descentrados y
                 salidos del marco, como en un billete real.

  El movimiento —lo que impide que sea una lámina plana— son dos cosas que
  nunca se notan por separado:

    · Paralaje  cada capa se desplaza con el scroll a distinta velocidad. El
                fondo es `fixed`, así que sin esto la página entera se
                deslizaría sobre una imagen muerta. La retícula se mueve poco
                y los rosetones más: eso es lo que se lee como profundidad.
    · Deriva    los rosetones giran una vuelta cada varios minutos, en
                sentidos opuestos. Es demasiado lento para verse como una
                animación, pero las líneas finas al cruzarse producen un
                moiré que cambia todo el tiempo. El fondo nunca está
                exactamente igual que hace un momento.

  Con `prefers-reduced-motion` no hay deriva ni paralaje: queda la lámina
  quieta, que sigue siendo el mismo diseño.
*/

/**
 * Un guilloché: elipses concéntricas giradas un poco cada vez. Al superponerse
 * dibujan el rosetón de los billetes, y como son líneas de medio píxel el
 * resultado es una trama, no un dibujo.
 *
 * `pasos` es cuántas elipses; más elipses, trama más densa y más costosa.
 */
function Roseton({ pasos, rx, ry }: { pasos: number; rx: number; ry: number }) {
  return (
    <>
      {Array.from({ length: pasos }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="0"
          rx={rx}
          ry={ry}
          transform={`rotate(${(360 / pasos) * i})`}
        />
      ))}
    </>
  )
}

/**
 * Capa de fondo de la landing. Va detrás de todo (`-z-10`), no recibe puntero
 * y es `aria-hidden`: es material, no contenido.
 */
export function Fondo() {
  const menosMovimiento = useReducedMotion()
  const { scrollY } = useScroll()

  // Paralaje: cuánto se desplaza cada capa a lo largo de 3000 px de scroll.
  // Los rosetones se mueven casi cuatro veces más que la retícula, y esa
  // diferencia es toda la sensación de profundidad.
  const yReticula = useTransform(scrollY, [0, 3000], [0, -70])
  const yRoseton = useTransform(scrollY, [0, 3000], [0, -260])
  const yRosetonChico = useTransform(scrollY, [0, 3000], [0, -160])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          'linear-gradient(175deg, #f7f9fb 0%, #eef2f7 26%, #e0e7f0 54%, #d3dce8 80%, #c9d4e2 100%)',
      }}
    >
      {/* Papel de contabilidad. La máscara lo apaga en los bordes para que la
          trama no llegue nunca a un canto duro. */}
      <motion.div
        className="absolute -inset-y-40 inset-x-0"
        style={{
          y: menosMovimiento ? undefined : yReticula,
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--color-marca-900) 10%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-marca-900) 10%, transparent) 1px, transparent 1px),
            linear-gradient(to right, color-mix(in srgb, var(--color-marca-900) 17%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-marca-900) 17%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px, 32px 32px, 128px 128px, 128px 128px',
          maskImage:
            'radial-gradient(120% 80% at 50% 35%, #000 30%, color-mix(in srgb, #000 35%, transparent) 65%, transparent 100%)',
        }}
      />

      {/* Rosetón mayor: arriba a la derecha, saliéndose del marco. */}
      <motion.svg
        className="absolute -right-[18%] -top-[22%] h-[132vmin] w-[132vmin]"
        viewBox="-500 -500 1000 1000"
        fill="none"
        stroke="color-mix(in srgb, var(--color-marca-900) 17%, transparent)"
        strokeWidth="0.5"
        style={{ y: menosMovimiento ? undefined : yRoseton }}
        animate={menosMovimiento ? undefined : { rotate: 360 }}
        transition={{ duration: duracion.derivaFondo, repeat: Infinity, ease: 'linear' }}
      >
        <Roseton pasos={72} rx={470} ry={190} />
      </motion.svg>

      {/* Rosetón menor: abajo a la izquierda, cortado por el borde. Gira al
          revés que el grande — es el cruce de los dos lo que da el moiré. */}
      <motion.svg
        className="absolute -bottom-[26%] -left-[20%] h-[92vmin] w-[92vmin]"
        viewBox="-500 -500 1000 1000"
        fill="none"
        stroke="color-mix(in srgb, var(--color-marca-900) 15%, transparent)"
        strokeWidth="0.6"
        style={{ y: menosMovimiento ? undefined : yRosetonChico }}
        animate={menosMovimiento ? undefined : { rotate: -360 }}
        transition={{ duration: duracion.derivaFondoLenta, repeat: Infinity, ease: 'linear' }}
      >
        <Roseton pasos={54} rx={430} ry={205} />
      </motion.svg>

      {/* Luz alta: una sola fuente, arriba a la izquierda, para que el papel no
          quede iluminado de forma uniforme. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 60% at 18% 0%, color-mix(in srgb, #ffffff 55%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Asiento: sombra al pie, para que la página apoye en algo. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-marca-900) 12%, transparent), transparent)',
        }}
      />
    </div>
  )
}
