import { NavLink } from 'react-router-dom'
import {
  HouseIcon,
  ChartPieSliceIcon,
  PlayCircleIcon,
  SignInIcon,
  UserPlusIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

type Destino = {
  a: string
  etiqueta: string
  Icono: Icon
}

/*
  Cuatro destinos y una acción. Los cuatro reparten las seis secciones de la
  landing de escritorio; por encima de eso las etiquetas dejan de caber sin
  abreviarse hasta no decir nada.

  Van partidos en dos porque entrar no es un destino más: se cuela en el medio,
  elevado, y estos son los que quedan a cada lado.
*/
const IZQUIERDA: Destino[] = [
  { a: '/', etiqueta: 'Inicio', Icono: HouseIcon },
  { a: '/que-hace', etiqueta: 'Qué hace', Icono: ChartPieSliceIcon },
]

const DERECHA: Destino[] = [
  { a: '/miralo', etiqueta: 'Míralo', Icono: PlayCircleIcon },
  { a: '/empezar', etiqueta: 'Empezar', Icono: UserPlusIcon },
]

const enlace =
  'flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta-900'

/**
 * Barra de navegación al pie, al alcance del pulgar. Es lo que separa una web
 * responsive de algo que se usa como aplicación.
 *
 * `env(safe-area-inset-bottom)` no es opcional: sin eso, en un iPhone la barra
 * queda debajo del indicador de inicio y el último destino no se puede tocar.
 */
/** Un destino de la barra. Cinco huecos y dos listas: se repite lo justo. */
function Destino({ a, etiqueta, Icono }: Destino) {
  return (
    <li className="flex-1">
      <NavLink
        to={a}
        end={a === '/'}
        className={({ isActive }) =>
          `${enlace} ${isActive ? 'text-lavanda-900' : 'text-texto-tenue'}`
        }
      >
        {({ isActive }) => (
          <>
            <Icono size={23} weight={isActive ? 'fill' : 'regular'} aria-hidden />
            <span className={`text-micro ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {etiqueta}
            </span>
          </>
        )}
      </NavLink>
    </li>
  )
}

export function NavegacionInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="vidrio fixed inset-x-0 bottom-0 z-50 border-t border-borde-sutil pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[520px] items-stretch">
        {IZQUIERDA.map((d) => (
          <Destino key={d.a} {...d} />
        ))}

        {/*
          Entrar, en el medio y elevado. En la landing es la acción que cierra
          el recorrido —quien ya tiene cuenta viene solo a esto— y repartida
          entre los destinos costaba buscarla. Sobresalir la separa de ellos sin
          hacerla más grande ni de otro color que el resto.
        */}
        <li className="flex-1">
          <NavLink to="/login" className={`${enlace} w-full text-texto-tenue`}>
            <span className="grid size-11 -translate-y-3 place-items-center rounded-full bg-lavanda-900 text-texto-inverso shadow-[0_10px_24px_-8px_color-mix(in_srgb,var(--color-lavanda-900)_70%,transparent)]">
              <SignInIcon size={20} weight="bold" aria-hidden />
            </span>
            <span className="-mt-3 text-micro font-medium">Ingresar</span>
          </NavLink>
        </li>

        {DERECHA.map((d) => (
          <Destino key={d.a} {...d} />
        ))}
      </ul>
    </nav>
  )
}
