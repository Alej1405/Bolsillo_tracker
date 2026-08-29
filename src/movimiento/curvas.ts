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
   * Vuelo de la moneda del cargador: una curva por tramo, no una sola para
   * todo. Es gravedad, y la gravedad no tiene una sola curva — subiendo frena
   * (`easeOut`) y cayendo acelera (`easeIn`).
   *
   * Son doce tramos porque son trece keyframes de altura en `Cargador.tsx`:
   * si añades o quitas uno allá, aquí tiene que haber uno menos que keyframes.
   *
   * Los tres primeros son la subida tras el lanzamiento, cada vez más lenta
   * hasta el ápice; de ahí al suelo, tres de caída. El resto son los botes.
   */
  vuelo: [
    'easeOut',
    'easeOut',
    'easeOut',
    'easeIn',
    'easeIn',
    'easeIn',
    'easeOut',
    'easeIn',
    'easeOut',
    'easeIn',
    'easeOut',
    'easeIn',
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
   * Acuse de un botón que navega: lo que el botón se queda cambiando de color
   * con la flecha en marcha antes de cambiar de pantalla.
   *
   * La navegación es instantánea —es una SPA, no hay nada que esperar—, así
   * que esta espera es del todo perceptual: sin ella el clic no deja rastro y
   * la pantalla nueva aparece sin que nada acuse recibo. Corta a propósito:
   * pasado un cuarto de segundo deja de leerse como respuesta y empieza a
   * leerse como lentitud.
   */
  acuse: 0.34,
  /**
   * El mensaje que se dobla, entra en el sobre y sale despachado. Es una
   * secuencia de tres actos, y necesita aire: por debajo de esto la hoja y la
   * solapa se pisan y no se entiende qué pasó.
   */
  despacho: 1.6,
  /**
   * El lanzamiento de la moneda: desde que sale disparada hasta que se asienta
   * tras el tercer bote. Va holgado a propósito — el giro en el aire es el
   * detalle que se mira, y a menos de esto las vueltas se vuelven un borrón.
   */
  vuelo: 2.1,
  /** La moneda que revienta y mancha la pantalla entera. */
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
