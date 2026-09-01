import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { Fondo } from '@/layout/landing/Fondo'
import { CabeceraDash } from '@/layout/panel/CabeceraDash'
import { NavLateral } from '@/layout/panel/NavLateral'
import { AnotarGasto } from '@/paginas/panel/AnotarGasto'
import { FormularioBolsillo } from '@/paginas/panel/FormularioBolsillo'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { useAppStore } from '@/stores/useAppStore'
import { rangoDelMes } from '@/helpers'

/*
  Armazón común de las pantallas del panel: el fondo, la barra lateral y la
  cabecera, con la pantalla de turno dentro del `Outlet`.

  Está aquí y no dentro de cada pantalla por dos razones. La primera es que al
  navegar entre Inicio, Historial o Bolsillos la navegación no se desmonta ni
  parpadea: cambia solo el contenido, que es como se comporta una aplicación y
  no una web. La segunda es que la cabecera puede leer la ruta y decir en qué
  pantalla estás — antes el título era una cadena fija en Inicio.

  La carga de `GET /reports/dashboard` también vive aquí: la cifra del mes sale
  en la cabecera de todas las pantallas, así que el dato tiene que estar
  disponible en todas.
*/
export function ArmazonPanel() {
  const dashboard = useAppStore((e) => e.dashboard)
  const cargando = useAppStore((e) => e.cargandoDashboard)
  const error = useAppStore((e) => e.errorDashboard)
  const cargar = useAppStore((e) => e.cargarDashboard)
  const movimientoAbierto = useAppStore((e) => e.movimientoAbierto)
  const cerrarMovimiento = useAppStore((e) => e.cerrarMovimiento)
  const crearAbierto = useAppStore((e) => e.crearAbierto)
  const cerrarCrearBolsillo = useAppStore((e) => e.cerrarCrearBolsillo)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const cargarRendimiento = useAppStore((e) => e.cargarRendimiento )

  const esAdmin = useAppStore((e) => e.usuario?.role) === 'super_admin'
  const cargarEstadisticas = useAppStore((e) => e.cargarEstadisticas)

  /*
    Una sola carga al entrar al panel. `RutaProtegida` ya garantizó la sesión.

    Un administrador no carga el reporte de sus finanzas: no las mira en ningún
    sitio, y pedirlo sería una petición por cada entrada al panel para un dato
    que nadie va a leer.
  */
  useEffect(() => {
    if (!esAdmin) cargar()
  }, [cargar, esAdmin])

  /* Las estadísticas alimentan la píldora de la cabecera en todas las pantallas. */
  useEffect(() => {
    if (esAdmin) void cargarEstadisticas()
  }, [cargarEstadisticas, esAdmin])

  useEffect(() => {
    if (esAdmin) return
    const hoy = new Date()
    const { desde, hasta} = rangoDelMes(hoy.getFullYear(), hoy.getMonth() +1)
    void cargarRendimiento(desde, hasta)
  }, [cargarRendimiento, esAdmin])
  /*
    `overflow-x-clip` y no `overflow-x-hidden`: los dos recortan lo que se salga
    por los lados, pero `hidden` convierte el elemento en un contenedor de
    desplazamiento —al fijar un eje, el navegador computa el otro como `auto`— y
    eso anula el `sticky` de la barra lateral, que se pegaría a este div en vez
    de a la ventana. `clip` recorta sin crear ese contenedor.
  */
  return (
    <div className="relative flex min-h-screen items-stretch gap-4 overflow-x-clip px-4 pt-5 pb-8 md:px-6 md:pt-6">
      <Fondo sereno />

      <NavLateral />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <CabeceraDash
          neto={dashboard?.summary?.net}
          mes={dashboard?.current_month}
          cargando={cargando}
        />

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4"
          >
            <WarningCircleIcon size={20} weight="fill" aria-hidden className="text-gasto" />
            <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
            <Boton variante="secundario" onClick={() => cargar()}>
              Reintentar
            </Boton>
          </div>
        )}

        {/*
          La hoja de contenido crece hasta el pie, igual que la columna de
          navegación. Sin esto quedaba flotando arriba y el papel de valores
          ocupaba media pantalla vacía por debajo.
        */}
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>

      {/*
        Anotar es un popup y no una pantalla: interrumpe lo que estés mirando y
        te devuelve ahí mismo al cerrarlo. Vive en el armazón para poder abrirse
        desde cualquier pantalla del panel.

        Un solo diálogo para gasto e ingreso. `movimientoAbierto` guarda cuál de
        los dos, y el formulario cambia sus textos y su catálogo con eso: los
        campos son los mismos y duplicarlo obligaría a corregir cada fallo dos
        veces.
      */}
      <Modal
        abierto={movimientoAbierto !== null}
        onCerrar={cerrarMovimiento}
        titulo={
          movimientoAbierto === 'income'
            ? 'Registrar un ingreso'
            : movimientoAbierto === 'transfer'
              ? 'Mover a ahorro'
              : 'Anotar un gasto'
        }
      >
        {movimientoAbierto && (
          <AnotarGasto tipo={movimientoAbierto} onCerrar={cerrarMovimiento} />
        )}
      </Modal>

      {/*
        Crear un bolsillo también vive aquí: se abre desde su pantalla y desde
        el popup de anotar un gasto, cuando todavía no hay ninguno.
      */}
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
