/*
  Lo que necesita cada prueba antes de arrancar.

  `jest-dom` añade comprobaciones que leen como una frase —`toBeVisible`,
  `toHaveAccessibleName`— en vez de comparar propiedades del DOM a mano. Una
  prueba que dice qué se espera se puede leer sin saber testing.
*/
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/* Cada prueba parte de una pantalla vacía; si no, se contaminan entre ellas. */
afterEach(cleanup)

/*
  `motion` fuera de las pruebas.

  Los componentes animados entran con `opacity: 0` y suben a 1 con el
  navegador; jsdom no ejecuta animaciones, así que el elemento existe pero
  jamás llega a ser "visible" y cualquier comprobación de visibilidad falla
  sin que haya nada roto.

  Se sustituye por elementos planos: las pruebas verifican QUÉ se muestra y
  cuándo, no cómo entra. La animación se revisa mirando la pantalla, que es
  donde se puede juzgar.
*/
import { vi } from 'vitest'
import * as React from 'react'

vi.mock('motion/react', () => {
  const plano = (etiqueta: string) =>
    React.forwardRef(function Plano(props: Record<string, unknown>, ref: unknown) {
      /* Se descartan las props de animación: no son atributos válidos del DOM. */
      const {
        initial, animate, exit, transition, whileHover, whileTap, drag,
        dragConstraints, dragElastic, onDragEnd, layout, layoutId, variants,
        ...resto
      } = props
      return React.createElement(etiqueta, { ...resto, ref })
    })

  /* `motion.create(Componente)` envuelve un componente ajeno —`Link`, en el
     caso de `Boton`—. Aquí simplemente lo devuelve sin envolver. */
  const envolver = (Comp: React.ElementType) =>
    React.forwardRef(function Envuelto(props: Record<string, unknown>, ref: unknown) {
      const {
        initial, animate, exit, transition, whileHover, whileTap, drag,
        dragConstraints, dragElastic, onDragEnd, layout, layoutId, variants,
        ...resto
      } = props
      return React.createElement(Comp, { ...resto, ref })
    })

  return {
    motion: new Proxy(
      { create: envolver },
      {
        get: (destino: Record<string, unknown>, etiqueta: string) =>
          etiqueta === 'create' ? destino.create : plano(etiqueta),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => true,
  }
})
