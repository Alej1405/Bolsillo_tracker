import { NavLink } from 'react-router-dom'
import {
  ChartLineUpIcon,
  ChartPieSliceIcon,
  ChatCircleTextIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  GearSixIcon,
  HouseIcon,
  MinusIcon,
  UserIcon,
  UsersThreeIcon,
  WalletIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/useAppStore'

type Destino = { a: string; etiqueta: string; Icono: Icon }

/*
  Cuatro destinos y una acción. Es el reparto de una aplicación de verdad: por
  encima de cinco huecos el pulgar deja de acertar y las etiquetas se abrevian
  hasta no decir nada.

  Los que no caben no desaparecen: viven en "Más", que abre una hoja desde
  abajo. Lo que se queda fuera es lo que se usa una vez al mes —reportes,
  rendimiento, la cuenta—; lo que se queda dentro es lo de todos los días.
*/
const CLIENTE: Destino[] = [
  { a: '/dashboard', etiqueta: 'Inicio', Icono: HouseIcon },
  { a: '/historial', etiqueta: 'Historial', Icono: ClockCounterClockwiseIcon },
  { a: '/bolsillos', etiqueta: 'Bolsillos', Icono: WalletIcon },
]

const ADMIN: Destino[] = [
  { a: '/dashboard', etiqueta: 'Inicio', Icono: HouseIcon },
  { a: '/usuarios', etiqueta: 'Usuarios', Icono: UsersThreeIcon },
  { a: '/consultas', etiqueta: 'Consultas', Icono: ChatCircleTextIcon },
]

/** Lo que va dentro de la hoja de "Más", según el rol. */
export const MAS_CLIENTE: Destino[] = [
  { a: '/reportes', etiqueta: 'Reportes', Icono: ChartPieSliceIcon },
  { a: '/rendimiento', etiqueta: 'Rendimiento', Icono: ChartLineUpIcon },
  { a: '/soporte', etiqueta: 'Soporte', Icono: ChatCircleTextIcon },
  { a: '/mi-cuenta', etiqueta: 'Mi cuenta', Icono: UserIcon },
]

export const MAS_ADMIN: Destino[] = [
  { a: '/sitio', etiqueta: 'La web', Icono: GearSixIcon },
  { a: '/mi-cuenta', etiqueta: 'Mi cuenta', Icono: UserIcon },
]

const enlace =
  'flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-borde-foco'

/**
 * La barra del panel, al alcance del pulgar.
 *
 * El botón de anotar va en el centro y sobresale: es la acción que se hace
 * varias veces al día y la única razón por la que alguien abre esto de camino
 * a casa. En una barra plana competiría con los destinos; elevado, no compite
 * con nada.
 *
 * Un administrador no lo tiene: no viene a apuntar sus gastos, y un botón que
 * no va a usar en el sitio más accesible de la pantalla es ruido.
 *
 * `env(safe-area-inset-bottom)` no es opcional: sin eso, en un iPhone la barra
 * queda bajo el indicador de inicio y el último destino no se puede tocar.
 */
export function NavegacionPanel({ onMas }: { onMas: () => void }) {
  const rol = useAppStore((e) => e.usuario?.role)
  const abrirGasto = useAppStore((e) => e.abrirGasto)
  const esAdmin = rol === 'super_admin'
  const destinos = esAdmin ? ADMIN : CLIENTE

  return (
    <nav
      aria-label="Navegación del panel"
      className="vidrio fixed inset-x-0 bottom-0 z-40 border-t border-borde-sutil pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[520px] items-stretch">
        {destinos.map(({ a, etiqueta, Icono }) => (
          <li key={a} className="flex-1">
            <NavLink
              to={a}
              end
              className={({ isActive }) =>
                `${enlace} ${isActive ? 'text-lavanda-900' : 'text-texto-tenue'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icono size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                  <span className="text-micro font-medium">{etiqueta}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}

        {!esAdmin && (
          <li className="flex-1">
            {/*
              Sobresale sobre la barra, no dentro: lo que se levanta se lee como
              lo principal sin necesidad de ser más grande ni de otro color que
              el resto.
            */}
            <button
              type="button"
              onClick={abrirGasto}
              className={`${enlace} w-full text-texto-tenue`}
              aria-label="Anotar un gasto"
            >
              <span className="grid size-11 -translate-y-3 place-items-center rounded-full bg-lavanda-900 text-texto-inverso shadow-[0_10px_24px_-8px_color-mix(in_srgb,var(--color-lavanda-900)_70%,transparent)]">
                <MinusIcon size={20} weight="bold" aria-hidden />
              </span>
              <span className="-mt-3 text-micro font-medium">Gasto</span>
            </button>
          </li>
        )}

        <li className="flex-1">
          <button type="button" onClick={onMas} className={`${enlace} w-full text-texto-tenue`}>
            <DotsThreeIcon size={22} weight="bold" aria-hidden />
            <span className="text-micro font-medium">Más</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
