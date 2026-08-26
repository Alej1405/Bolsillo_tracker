import { useSyncExternalStore } from 'react'

export type TipoPantalla = 'celular' | 'tableta' | 'escritorio'

/*
  Espejo de los breakpoints de Tailwind (md = 48rem, lg = 64rem). Si cambias
  uno en `@theme`, cambia el otro.

  La desincronización aquí no se paga como en una media query suelta: esto no
  decide cómo se ve algo, decide QUÉ se renderiza. Un desfase no se nota como
  un estilo raro, se nota como el componente equivocado en pantalla.
*/
const CONSULTAS = {
  celular: '(max-width: 47.999rem)',
  tableta: '(min-width: 48rem) and (max-width: 63.999rem)',
} as const

/**
 * Lee el tipo de pantalla en el momento, sin estado intermedio. Se llama en el
 * primer render, así que no hay un fotograma con la versión equivocada antes
 * de que un efecto corrija — que es el defecto clásico de resolver esto con
 * `useState` + `useEffect`.
 */
function leer(): TipoPantalla {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'escritorio'
  }
  if (window.matchMedia(CONSULTAS.celular).matches) return 'celular'
  if (window.matchMedia(CONSULTAS.tableta).matches) return 'tableta'
  return 'escritorio'
}

function suscribir(alCambiar: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  // Las dos consultas, porque cruzar cualquiera de los dos umbrales cambia el
  // tipo: de celular a tableta y de tableta a escritorio.
  const listas = Object.values(CONSULTAS).map((c) => window.matchMedia(c))
  listas.forEach((l) => l.addEventListener('change', alCambiar))
  return () => listas.forEach((l) => l.removeEventListener('change', alCambiar))
}

/**
 * Tipo de pantalla por la que se conecta el usuario, para decidir qué se
 * renderiza. Reacciona al rotar el dispositivo y al redimensionar la ventana.
 *
 *     const pantalla = useTipoPantalla()
 *     if (pantalla === 'celular') return <VersionDeApp />
 */
export function useTipoPantalla(): TipoPantalla {
  return useSyncExternalStore(suscribir, leer, () => 'escritorio')
}
