import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ChartLineUpIcon,
  ChartPieSliceIcon,
  ChatCircleTextIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  GearSixIcon,
  HouseIcon,
  MinusIcon,
  PiggyBankIcon,
  PlusIcon,
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

/*
  Las tres formas de anotar, en el orden en que se usan. La más frecuente va
  abajo, pegada al botón: es la que el pulgar alcanza sin estirarse, y en un
  desplegable que sube la distancia se paga en cada uso.
*/
type Accion = { id: string; etiqueta: string; Icono: Icon; clase: string }

const ACCIONES: Accion[] = [
  { id: 'ahorro', etiqueta: 'Mover a ahorro', Icono: PiggyBankIcon, clase: 'bg-lavanda-700' },
  { id: 'ingreso', etiqueta: 'Registrar un ingreso', Icono: PlusIcon, clase: 'bg-ingreso' },
  { id: 'gasto', etiqueta: 'Anotar un gasto', Icono: MinusIcon, clase: 'bg-lavanda-900' },
]

/**
 * El botón de anotar, desplegado en sus tres opciones.
 *
 * Antes solo abría el gasto, y las otras dos formas de anotar —un ingreso y un
 * movimiento a ahorro— existían únicamente en la barra lateral de escritorio.
 * Una función que solo está en una pantalla obliga a cambiarse de dispositivo
 * para usarla, y entonces la versión de teléfono no es la aplicación: es un
 * recorte.
 *
 * Sube en escalón y no de golpe: las tres salen de debajo del botón con 40 ms
 * de diferencia, que es lo que deja leer que son tres cosas distintas y no un
 * bloque que aparece.
 */
function Desplegable({
  abierto,
  onCerrar,
  onElegir,
}: {
  abierto: boolean
  onCerrar: () => void
  onElegir: (id: string) => void
}) {
  const menosMovimiento = useReducedMotion()

  /* Escape cierra. Es la salida que espera cualquiera que venga del teclado. */
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, onCerrar])

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <>
          {/*
            El velo apaga la pantalla de detrás y recoge el toque que cierra.
            Va por debajo de la barra en z para que el botón siga visible: si lo
            tapara, cerrar exigiría buscar dónde tocar.
          */}
          <motion.div
            aria-hidden
            onClick={onCerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-tinta-950/45 backdrop-blur-[2px]"
          />

          <div
            role="menu"
            aria-label="Qué quieres anotar"
            className="fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom)+0.75rem)] z-[85] flex flex-col items-center gap-2.5 px-5"
          >
            {ACCIONES.map(({ id, etiqueta, Icono, clase }, i) => (
              <motion.button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => onElegir(id)}
                /*
                  Nunca desde `scale(0)`: nada en el mundo real aparece de la
                  nada. Arranca casi entero y un poco más abajo, que es como se
                  mueve algo que sube.
                */
                initial={menosMovimiento ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={menosMovimiento ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
                transition={{
                  duration: 0.22,
                  ease: [0.23, 1, 0.32, 1],
                  /* de abajo arriba: la última de la lista sale primero */
                  delay: menosMovimiento ? 0 : (ACCIONES.length - 1 - i) * 0.04,
                }}
                className="flex min-h-[52px] w-full max-w-[320px] items-center gap-3 rounded-maximo bg-fondo-superficie py-3 pr-5 pl-3 text-cuerpo font-medium text-texto-principal shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--color-tinta-950)_45%,transparent)] transition-transform active:scale-[0.97]"
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-texto-inverso ${clase}`}>
                  <Icono size={20} weight="bold" aria-hidden />
                </span>
                {etiqueta}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

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
  const abrirIngreso = useAppStore((e) => e.abrirIngreso)
  const abrirAhorro = useAppStore((e) => e.abrirAhorro)
  const esAdmin = rol === 'super_admin'
  const destinos = esAdmin ? ADMIN : CLIENTE

  const [desplegado, setDesplegado] = useState(false)

  const elegir = (id: string) => {
    setDesplegado(false)
    if (id === 'gasto') abrirGasto()
    else if (id === 'ingreso') abrirIngreso()
    else abrirAhorro()
  }

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
              onClick={() => setDesplegado((v) => !v)}
              className={`${enlace} w-full text-texto-tenue`}
              aria-label="Anotar un movimiento"
              aria-expanded={desplegado}
              aria-haspopup="menu"
            >
              {/*
                El mismo signo gira 45° y se convierte en la cruz de cerrar. Un
                icono que se transforma dice que es el mismo botón en otro
                estado; cambiarlo por otro distinto haría pensar que es otro.
              */}
              <span className="grid size-11 -translate-y-3 place-items-center rounded-full bg-lavanda-900 text-texto-inverso shadow-[0_10px_24px_-8px_color-mix(in_srgb,var(--color-lavanda-900)_70%,transparent)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ transform: `translateY(-0.75rem) rotate(${desplegado ? 45 : 0}deg)` }}
              >
                <PlusIcon size={20} weight="bold" aria-hidden />
              </span>
              <span className="-mt-3 text-micro font-medium">Anotar</span>
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

      <Desplegable
        abierto={desplegado}
        onCerrar={() => setDesplegado(false)}
        onElegir={elegir}
      />
    </nav>
  )
}
