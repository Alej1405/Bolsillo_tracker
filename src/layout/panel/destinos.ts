import {
  ChartPieSliceIcon,
  ClockCounterClockwiseIcon,
  HouseIcon,
  UserIcon,
  WalletIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export type Destino = {
  a: string
  etiqueta: string
  Icono: Icon
  /** Los cinco de la barra lateral; `false` para rutas sin entrada propia. */
  enNav: boolean
}

/*
  Las rutas del panel, en un solo sitio.

  La barra lateral las pinta y la cabecera saca de aquí el título de la
  pantalla. Antes el título era la cadena "Inicio" escrita a mano en el panel,
  así que al navegar a Historial la cabecera seguía diciendo Inicio.

  Añadir una pantalla es añadir una línea aquí y su `<Route>` en `app/App.tsx`.
*/
export const DESTINOS: Destino[] = [
  { a: '/dashboard', etiqueta: 'Inicio', Icono: HouseIcon, enNav: true },
  { a: '/historial', etiqueta: 'Historial', Icono: ClockCounterClockwiseIcon, enNav: true },
  { a: '/bolsillos', etiqueta: 'Bolsillos', Icono: WalletIcon, enNav: true },
  { a: '/reportes', etiqueta: 'Reportes', Icono: ChartPieSliceIcon, enNav: true },
  { a: '/mi-cuenta', etiqueta: 'Mi cuenta', Icono: UserIcon, enNav: true },
]

/**
 * Título de la pantalla en la que estás.
 *
 * Compara por prefijo para que una ruta hija —`/bolsillos/cta-1`— siga
 * mostrando "Bolsillos" en vez de quedarse sin título.
 */
export function tituloDe(ruta: string): string {
  const destino = DESTINOS.find((d) => ruta === d.a || ruta.startsWith(`${d.a}/`))
  return destino?.etiqueta ?? 'Inicio'
}
