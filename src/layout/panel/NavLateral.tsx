import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Boton } from '@/ui/Boton'
import { DESTINOS } from '@/layout/panel/destinos'
import type { Destino } from '@/layout/panel/destinos'
import { escalonado, useAparicion } from '@/movimiento'
import { useAppStore } from '@/stores/useAppStore'
import logo from '@/assets/logo.png'

/** Iniciales del nombre. El registro no pide foto, solo nombre y correo. */
function iniciales(nombre?: string): string {
  if (!nombre) return '··'
  const partes = nombre.trim().split(/\s+/)
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}

/*
  Un destino.

  El activo se marca con lavanda, que es el acento de la marca en toda la
  landing, y no con el azul-pizarra lleno: ese azul es el color de los botones
  de acción, y usarlo también como fondo de navegación hacía que la barra
  compitiera con el botón de anotar, que es la única acción de la columna.

  Por debajo de 1280 la columna se queda en iconos: a 768 una barra de 225px se
  come casi un tercio del ancho. El rótulo no se pierde, sigue ahí para
  lectores de pantalla y en la pista al pasar el mouse.
*/
function Enlace({ a, etiqueta, Icono }: Destino) {
  return (
    <NavLink
      to={a}
      end
      title={etiqueta}
      className={({ isActive }) =>
        `relative flex min-h-11 items-center justify-center gap-3 rounded-grande px-3 py-2.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco active:scale-[0.98] xl:justify-start ${
          isActive
            ? 'text-lavanda-950'
            : 'text-texto-secundario hover:bg-lavanda-100/60 hover:text-texto-principal'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/*
            El relleno del activo es su propia capa para poder deslizarse de un
            destino a otro en vez de encenderse y apagarse. `layoutId` hace que
            motion trate los dos como el mismo objeto: la marca viaja.
          */}
          {isActive && (
            <motion.span
              layoutId="destino-activo"
              className="absolute inset-0 -z-10 rounded-grande bg-lavanda-200"
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            />
          )}
          <Icono size={20} weight={isActive ? 'fill' : 'regular'} aria-hidden />
          <span className="sr-only xl:not-sr-only xl:text-cuerpo xl:font-medium">{etiqueta}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * Columna de navegación del panel.
 *
 * Es una pieza de vidrio sobre el papel de valores, igual que las tarjetas de
 * la landing: el mismo material en las dos mitades del producto. Antes era una
 * caja blanca con borde, que sobre este fondo se leía como pegada encima.
 */
export function NavLateral() {
  const usuario = useAppStore((e) => e.usuario)
  const nombre = usuario?.full_name
  const aparece = useAparicion()
  const abrirGasto = useAppStore((e) => e.abrirGasto)

  const principales = DESTINOS.filter((d) => d.a !== '/mi-cuenta')
  const cuenta = DESTINOS.find((d) => d.a === '/mi-cuenta')

  return (
    <motion.div
      {...aparece()}
      className="flex 'w-[88px]' shrink-0 flex-col items-center gap-4 'xl:w-[232px]'"
    >
      <p
        className="grid size-12 shrink-0 place-items-center rounded-full bg-lavanda-200 font-titulo text-nota-mayor font-semibold text-lavanda-950 xl:size-16 xl:text-cuerpo-amplio"
        title={nombre}
      >
        <span className="sr-only">{nombre ?? 'Tu cuenta'}</span>
        <span aria-hidden>{iniciales(nombre)}</span>
      </p>

      <nav
        aria-label="Navegación del panel"
        className="vidrio-transparente flex w-full flex-1 flex-col gap-1 rounded-maximo p-3 xl:p-4 "
      >
        <div className="flex items-center justify-center gap-2.5 px-1 pt-1 pb-5 xl:justify-start">
          <a href="#inicio" className="flex items-center gap-1" aria-label="Bolsillo, inicio">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-titulo-menor font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </a>
        </div>

        <Boton
          onClick={abrirGasto}
          variante="cta"
          title="Anotar un gasto"
          tamano="pequeno"
          className="mb-5 w-full px-0! xl:px-6!"
        >
          <span className="xl:hidden" aria-hidden>
            +
          </span>
          <span className="sr-only xl:not-sr-only">Anotar un gasto</span>
        </Boton>

        {principales.map((d, i) => (
          <motion.div key={d.a} {...aparece(0.06 + i * escalonado)}>
            <Enlace {...d} />
          </motion.div>
        ))}

        {/* Empuja "Mi cuenta" al pie de la columna. */}
        <div className="flex-1" />

        {cuenta && (
          <motion.div {...aparece(0.06 + principales.length * escalonado)}>
            <Enlace {...cuenta} />
          </motion.div>
        )}
      </nav>
    </motion.div>
  )
}
