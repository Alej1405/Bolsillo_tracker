import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { SignOutIcon } from '@phosphor-icons/react'
import { Hoja } from '@/layout/celular/Hoja'
import {
  MAS_ADMIN,
  MAS_CLIENTE,
  NavegacionPanel,
} from '@/layout/celular/NavegacionPanel'
import { tituloDe } from '@/layout/panel/destinos'
import { Fondo } from '@/layout/landing/Fondo'
import { AnotarGasto } from '@/paginas/panel/AnotarGasto'
import { FormularioBolsillo } from '@/paginas/panel/FormularioBolsillo'
import { Modal } from '@/ui/Modal'
import { iniciales, nombreDelMes, rangoDelMes, useCerrarSesion } from '@/helpers'
import { urlDeMedio } from '@/utils/medios'
import { formatearMonto } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'

/**
 * El panel en un teléfono.
 *
 * No es la versión de escritorio encogida: la navegación baja al pulgar, la
 * cabecera se reduce a lo que cabe en una línea y lo que no entra en la barra
 * vive en una hoja que sube desde abajo. El contenido de cada pantalla sí es
 * el mismo — son los mismos datos y las mismas reglas, y duplicarlas obligaría
 * a arreglar cada fallo dos veces.
 *
 * Lo que cambia es el marco, que es exactamente lo que distingue una
 * aplicación de una web estrechada.
 */
export function ArmazonPanelCelular() {
  const { pathname } = useLocation()
  const usuario = useAppStore((e) => e.usuario)
  const dashboard = useAppStore((e) => e.dashboard)
  const cargar = useAppStore((e) => e.cargarDashboard)
  const cargarRendimiento = useAppStore((e) => e.cargarRendimiento)
  const cargarEstadisticas = useAppStore((e) => e.cargarEstadisticas)
  const estadisticas = useAppStore((e) => e.estadisticas)
  const gastoAbierto = useAppStore((e) => e.movimientoAbierto)
  const cerrarMovimiento = useAppStore((e) => e.cerrarMovimiento)
  const crearAbierto = useAppStore((e) => e.crearAbierto)
  const cerrarCrearBolsillo = useAppStore((e) => e.cerrarCrearBolsillo)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const cerrarSesion = useCerrarSesion()

  const [masAbierto, setMasAbierto] = useState(false)
  const esAdmin = usuario?.role === 'super_admin'

  useEffect(() => {
    if (!esAdmin) cargar()
  }, [cargar, esAdmin])

  useEffect(() => {
    if (esAdmin) {
      void cargarEstadisticas()
      return
    }
    const hoy = new Date()
    const { desde, hasta } = rangoDelMes(hoy.getFullYear(), hoy.getMonth() + 1)
    void cargarRendimiento(desde, hasta)
  }, [cargarRendimiento, cargarEstadisticas, esAdmin])

  /*
    Al cambiar de pestaña la vista vuelve arriba y la hoja se cierra. En una
    aplicación, tocar una pestaña siempre deja al inicio de esa pestaña; sin
    esto se entra a media pantalla y parece que no pasó nada.
  */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMasAbierto(false)
  }, [pathname])

  const foto = urlDeMedio(usuario?.avatar_url)
  const neto = dashboard?.summary?.net
  const enContra = neto?.trim().startsWith('-')
  const activos = estadisticas?.users.active

  const extras = esAdmin ? MAS_ADMIN : MAS_CLIENTE

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <Fondo sereno />

      {/*
        La cabecera se queda arriba al desplazar. En un teléfono es la única
        referencia de dónde estás: la barra de abajo dice a dónde puedes ir,
        no en qué pantalla estás.
      */}
      <header className="vidrio sticky top-0 z-30 flex items-center gap-3 border-b border-borde-sutil px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <NavLink
          to="/mi-cuenta"
          aria-label="Tu cuenta"
          className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-lavanda-200 text-micro font-semibold text-lavanda-950"
        >
          {foto ? (
            <img src={foto} alt="" className="size-full object-cover" />
          ) : (
            iniciales(usuario?.full_name)
          )}
        </NavLink>

        <h1 className="min-w-0 flex-1 truncate font-cuerpo text-nota font-bold text-texto-principal">
          {tituloDe(pathname)}
        </h1>

        {/*
          Una sola cifra, la que importa según quién entra. En 375px no caben
          dos píldoras sin que una se parta en dos líneas y empuje la cabecera.
        */}
        {esAdmin
          ? activos !== undefined && (
              <span className="shrink-0 rounded-full bg-ingreso-sutil px-3 py-1 text-micro font-bold text-ingreso tabular-nums">
                {activos} activos
              </span>
            )
          : neto && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-micro font-bold tabular-nums ${
                  enContra ? 'bg-gasto-sutil text-gasto' : 'bg-ingreso-sutil text-ingreso'
                }`}
              >
                {enContra ? '−' : '+'} ${formatearMonto(neto.replace('-', ''))}
              </span>
            )}
      </header>

      {/*
        El hueco de abajo reserva la barra más el área segura. Sin esto el
        último bloque de cada pantalla queda debajo y no se puede tocar: es el
        error clásico al llevar una web a formato de aplicación.
      */}
      <main className="px-4 pt-4 pb-[calc(58px+env(safe-area-inset-bottom)+1.5rem)]">
        <Outlet />
      </main>

      <NavegacionPanel onMas={() => setMasAbierto(true)} />

      <Hoja abierta={masAbierto} onCerrar={() => setMasAbierto(false)} titulo="Más">
        <ul className="flex flex-col py-2">
          {extras.map(({ a, etiqueta, Icono }) => (
            <li key={a}>
              <NavLink
                to={a}
                className="flex min-h-[52px] items-center gap-3 rounded-grande px-2 text-cuerpo text-texto-principal transition-colors active:scale-[0.99] active:bg-fondo-sutil"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
                  <Icono size={18} aria-hidden />
                </span>
                {etiqueta}
              </NavLink>
            </li>
          ))}

          <li className="mt-2 border-t border-borde-sutil pt-2">
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-grande px-2 text-cuerpo text-texto-principal transition-colors active:scale-[0.99] active:bg-fondo-sutil"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
                <SignOutIcon size={18} aria-hidden />
              </span>
              Cerrar sesión
            </button>
          </li>
        </ul>

        {!esAdmin && dashboard?.current_month && (
          <p className="px-2 pt-2 text-micro text-texto-tenue">
            Estás viendo {nombreDelMes(dashboard.current_month) || 'este mes'}.
          </p>
        )}
      </Hoja>

      {/* Los mismos diálogos que en escritorio: las reglas de anotar no cambian. */}
      <Modal
        abierto={gastoAbierto !== null}
        onCerrar={cerrarMovimiento}
        titulo={
          gastoAbierto === 'income'
            ? 'Registrar un ingreso'
            : gastoAbierto === 'transfer'
              ? 'Mover a ahorro'
              : 'Anotar un gasto'
        }
      >
        {gastoAbierto && <AnotarGasto tipo={gastoAbierto} onCerrar={cerrarMovimiento} />}
      </Modal>

      <Modal abierto={crearAbierto} onCerrar={cerrarCrearBolsillo} titulo="Crear un bolsillo">
        <FormularioBolsillo
          onListo={() => {
            cerrarCrearBolsillo()
            void cargarBolsillos()
            void cargar()
          }}
        />
      </Modal>
    </div>
  )
}
