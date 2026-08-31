import { NavLink } from 'react-router-dom'
import { HouseIcon, ChartPieSliceIcon, PlayCircleIcon, UserPlusIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

type Destino = {
  a: string
  etiqueta: string
  Icono: Icon
}

/*
  Cuatro y no más: en una barra inferior cada destino compite por el mismo
  pulgar, y por encima de cuatro las etiquetas dejan de caber sin abreviarse.
  Las seis secciones de la landing de escritorio están repartidas entre estas
  cuatro pantallas.
*/
const destinos: Destino[] = [
  { a: '/', etiqueta: 'Inicio', Icono: HouseIcon },
  { a: '/que-hace', etiqueta: 'Qué hace', Icono: ChartPieSliceIcon },
  { a: '/miralo', etiqueta: 'Míralo', Icono: PlayCircleIcon },
  { a: '/empezar', etiqueta: 'Empezar', Icono: UserPlusIcon },
]

/**
 * Barra de navegación al pie, al alcance del pulgar. Es lo que separa una web
 * responsive de algo que se usa como aplicación.
 *
 * `env(safe-area-inset-bottom)` no es opcional: sin eso, en un iPhone la barra
 * queda debajo del indicador de inicio y el último destino no se puede tocar.
 */
export function NavegacionInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="vidrio fixed inset-x-0 bottom-0 z-50 border-t border-borde-sutil pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[520px]">
        {destinos.map(({ a, etiqueta, Icono }) => (
          <li key={a} className="flex-1">
            <NavLink
              to={a}
              end={a === '/'}
              className={({ isActive }) =>
                `flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta-900 ${
                  isActive ? 'text-lavanda-900' : 'text-texto-tenue'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icono size={23} weight={isActive ? 'fill' : 'regular'} />
                  <span className={`text-micro ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {etiqueta}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
