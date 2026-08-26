/*
  Única fuente de verdad del movimiento de Bolsillo.

  Nada de esto se escribe suelto en un componente: si una animación necesita
  una curva, una duración o un umbral de scroll, sale de aquí. Así un cambio
  de ritmo se hace en un solo archivo y toda la interfaz se mueve igual.

  La curva `salida` es la misma que `--ease-salida` en index.css. Si cambias
  una, cambia la otra.
*/

/** Curvas de easing, en el formato de `motion` (cubic-bezier como tupla). */
export const curva = {
  /** Ease-out fuerte: arranca rápido y frena largo. La curva por defecto. */
  salida: [0.23, 1, 0.32, 1],
  /** Ease-in-out simétrico, para movimientos que van y vuelven. */
  suave: [0.77, 0, 0.175, 1],
  /**
   * Rebote del punto de carga: una curva por tramo, no una sola para todo.
   * Cae acelerando, sube frenando, y así hasta el tercer impacto. Son once
   * tramos porque son doce keyframes de altura en `Cargador.tsx`: si añades o
   * quitas uno allá, aquí tiene que haber uno menos que keyframes.
   *
   * El último tramo es `easeOut` a propósito: el derretimiento tiene que
   * frenar, no golpear. Es lo contrario de un impacto.
   */
  rebote: [
    'easeIn',
    'easeIn',
    'easeOut',
    'easeOut',
    'easeIn',
    'easeIn',
    'easeOut',
    'easeOut',
    'easeIn',
    'easeIn',
    'easeOut',
  ],
} as const

/**
 * Duraciones en segundos, nombradas por lo que hace la animación y no por
 * su valor, para que el nombre siga siendo cierto si el número cambia.
 */
export const duracion = {
  /** Feedback táctil: el botón que se hunde al presionar. */
  toque: 0.14,
  /** Cambio de contenido dentro de un contenedor que no se mueve. */
  cambio: 0.25,
  /** Paneles y tarjetas que se desplazan a lo ancho de la pantalla. */
  panel: 0.45,
  /** Bloque que se revela al entrar en vista. */
  revelado: 0.6,
  /** Entrada del hero al cargar la página. */
  aparicion: 0.7,
  /** Barras que crecen desde cero. */
  crecimiento: 0.8,
  /** Cifra que cuenta desde cero hasta su valor. */
  conteo: 1.1,
  /**
   * Los tres botes del punto de carga, desde que cae hasta que se derrite en el
   * suelo. Va holgado a propósito: la deformación de la gota es el detalle que
   * se mira, y a menos de esto pasa demasiado rápido para leerse.
   */
  rebote: 1.9,
  /** El punto que revienta y mancha la pantalla entera. */
  mancha: 0.8,
  /** La mancha que se desvanece y descubre la web. */
  descubierta: 0.6,
  /**
   * Vuelta completa de los rosetones del fondo. Son minutos, no segundos: no
   * es una animación que se mire, es una deriva que impide que el fondo esté
   * dos veces igual. Los dos valores son distintos a propósito — si giraran
   * al mismo ritmo el moiré se repetiría.
   */
  derivaFondo: 260,
  derivaFondoLenta: 340,
} as const

/**
 * Umbrales de scroll: cuánto del elemento debe verse para disparar su
 * animación. Todos son `once`, la animación no se repite al volver a subir.
 *
 * Cuanto más pequeño el elemento, más alto el umbral: un bloque grande nunca
 * llega a verse al 60%, y una cifra que se anima al 30% cuenta fuera de vista.
 */
export const vista = {
  /** Secciones y tarjetas grandes. */
  bloque: { once: true, amount: 0.3 },
  /** Piezas medianas: barras, filas de un gráfico. */
  pieza: { once: true, amount: 0.5 },
  /** Elementos pequeños que hay que leer: cifras que cuentan. */
  cifra: { once: true, amount: 0.6 },
} as const

/** Escalonado por defecto entre hermanos de una misma fila, en segundos. */
export const escalonado = 0.08
