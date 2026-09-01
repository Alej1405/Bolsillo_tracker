import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Boton } from '@/ui/Boton'
import { DESTINOS } from '@/layout/panel/destinos'
import type { Destino } from '@/layout/panel/destinos'
import { escalonado, useAparicion } from '@/movimiento'
import { iniciales } from '@/helpers'
import { urlDeMedio } from '@/utils/medios'
import { useAppStore } from '@/stores/useAppStore'
import logo from '@/assets/logo.png'

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
          <span className="text-nota font-medium xl:text-cuerpo">{etiqueta}</span>
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
  const foto = urlDeMedio(usuario?.avatar_url)
  const aparece = useAparicion()
  const abrirGasto = useAppStore((e) => e.abrirGasto)
  const abrirIngreso = useAppStore((e) => e.abrirIngreso)
  const abrirAhorro = useAppStore((e) => e.abrirAhorro)

  /*
    Los destinos que puede ver quien entró. El de administración solo aparece
    para `super_admin`: el resto no puede usarlo y ofrecerlo sería llevarles a
    un 403.
  */
  const esAdmin = usuario?.role === 'super_admin'
  const visibles = DESTINOS.filter(
    (d) => (!d.soloAdmin || esAdmin) && (!d.soloCliente || !esAdmin),
  )
  const principales = visibles.filter((d) => d.a !== '/mi-cuenta')
  const cuenta = visibles.find((d) => d.a === '/mi-cuenta')

  return (
    <motion.div
      {...aparece()}
      className="sticky top-5 flex h-[calc(100dvh-3.25rem)] w-[200px] shrink-0 flex-col gap-4 self-start md:top-6 md:h-[calc(100dvh-3.5rem)] xl:w-[232px]"
    >
      <p
        className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-lavanda-200 font-titulo text-nota-mayor font-semibold text-lavanda-950 xl:size-16 xl:text-cuerpo-amplio"
        title={nombre}
      >
        <span className="sr-only">{nombre ?? 'Tu cuenta'}</span>
        {/*
          Con foto, la foto; sin foto, las iniciales. El fondo lavanda se queda
          debajo en los dos casos: mientras la imagen carga, el círculo ya está
          ahí y la columna no da un salto.

          `alt=""` porque el nombre ya lo lee el `sr-only` de arriba: repetirlo
          haría que un lector de pantalla dijera dos veces lo mismo.
        */}
        {foto ? (
          <img src={foto} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{iniciales(nombre)}</span>
        )}
      </p>

      <nav
        aria-label="Navegación del panel"
        className="vidrio-secundario flex w-full shadow-lg flex-1 flex-col gap-1 rounded-maximo p-3 xl:p-4 "
      >
        <div className="flex items-center justify-center gap-2.5 px-1 pt-1 pb-5 xl:justify-start">
          <a href="#inicio" className="flex items-center gap-1" aria-label="Bolsillo, inicio">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-titulo-menor font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </a>
        </div>

        {/*
          Las dos acciones de anotar, juntas y en ese orden.

          El gasto va lleno y el ingreso con borde a propósito: anotar un gasto
          es lo que se hace varias veces al día y el ingreso una o dos veces al
          mes. Si los dos fueran botones llenos competirían y la columna dejaría
          de tener una acción principal clara.

          Por debajo de 1280 la barra se queda en 88px y no cabe el rótulo: se
          muestra solo el signo, y el texto sigue ahí para los lectores de
          pantalla y en la pista al pasar el ratón.
        */}
        {/*
          Las acciones de anotar no aparecen para `super_admin`: quien entra a
          administrar la plataforma no viene a apuntar sus propios gastos, y
          tres botones que no va a usar son lo primero que se lee de la columna.
        */}
        {!esAdmin && (
        <div className="mb-5 flex w-full flex-col gap-2">
          {/*
            Mover a ahorro no es anotar: el dinero no entra ni sale, cambia de
            bolsillo. Va el tercero porque es lo que menos se hace de los tres.
          */}
          <Boton
            onClick={abrirAhorro}
            variante="cta"
            title="Mover a ahorro"
            tamano="pequeno"
            className="px-4! xl:px-6! bg-lavanda-700 hover:bg-lavanda-600"
          >
            <span className="text-leyenda xl:text-nota">Mover a ahorro</span>
          </Boton>

          <Boton
            onClick={abrirIngreso}
            variante="cta"
            title="Registrar un ingreso"
            tamano="pequeno"
            className="px-4! xl:px-6! bg-marca-700 hover:bg-tinta-400"
          >
            <span className="text-leyenda xl:text-nota">Registrar un ingreso</span>
          </Boton>

          <Boton
            onClick={abrirGasto}
            variante="cta"
            title="Anotar un gasto"
            tamano="pequeno"
            className="px-4! xl:px-6! bg-marca-700 hover:bg-tinta-400"
          >
            <span className="text-leyenda xl:text-nota">Anotar un gasto</span>
          </Boton>
        </div>
        )}

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
