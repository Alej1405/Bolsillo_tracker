import {
  ChartLineUpIcon,
  ChartPieSliceIcon,
  ClockCounterClockwiseIcon,
  HouseIcon,
  ChatCircleTextIcon,
  GearSixIcon,
  UserIcon,
  UsersThreeIcon,
  WalletIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export type Destino = {
  a: string
  etiqueta: string
  Icono: Icon
  /** Los de la barra lateral; `false` para rutas sin entrada propia. */
  enNav: boolean
  /*
    Solo lo ve `super_admin`. Esconderlo no protege nada —el backend rechaza
    con 403 a quien no lo sea—, evita ofrecer una pantalla que no va a poder
    usar.
  */
  soloAdmin?: boolean
  /*
    Al revés: no lo ve `super_admin`. Son las pantallas de las finanzas
    personales, y quien entra a administrar la plataforma no viene a mirar sus
    propios gastos. La ruta sigue existiendo y funciona si se teclea: esto solo
    quita el ruido de la barra.
  */
  soloCliente?: boolean
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
  { a: '/historial', etiqueta: 'Historial', Icono: ClockCounterClockwiseIcon, enNav: true, soloCliente: true },
  { a: '/bolsillos', etiqueta: 'Bolsillos', Icono: WalletIcon, enNav: true, soloCliente: true },
  { a: '/reportes', etiqueta: 'Reportes', Icono: ChartPieSliceIcon, enNav: true, soloCliente: true },
  { a: '/rendimiento', etiqueta: 'Rendimiento', Icono: ChartLineUpIcon, enNav: true, soloCliente: true },
  { a: '/mi-cuenta', etiqueta: 'Mi cuenta', Icono: UserIcon, enNav: true },
  { a: '/usuarios', etiqueta: 'Usuarios', Icono: UsersThreeIcon, enNav: true, soloAdmin: true },
  { a: '/consultas', etiqueta: 'Consultas', Icono: ChatCircleTextIcon, enNav: true, soloAdmin: true },
  { a: '/sitio', etiqueta: 'La web', Icono: GearSixIcon, enNav: true, soloAdmin: true },
  //Soporte lo usa quien tiene cuenta, no quien administra: para el equipo esa
  //misma conversación aparece en Consultas.
  { a: '/soporte', etiqueta: 'Soporte', Icono: ChatCircleTextIcon, enNav: true, soloCliente: true },
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
