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
  const gastoAbierto = useAppStore((e) => e.gastoAbierto)
  const cerrarGasto = useAppStore((e) => e.cerrarGasto)
  const crearAbierto = useAppStore((e) => e.crearAbierto)
  const cerrarCrearBolsillo = useAppStore((e) => e.cerrarCrearBolsillo)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)

  // Una sola carga al entrar al panel. `RutaProtegida` ya garantizó la sesión.
  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div className="relative flex min-h-screen items-stretch gap-4 overflow-x-hidden px-4 pt-5 pb-8 md:px-6 md:pt-6">
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
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>

      {/*
        Anotar un gasto es un popup y no una pantalla: interrumpe lo que estés
        mirando y te devuelve ahí mismo al cerrarlo. Vive en el armazón para
        poder abrirse desde cualquier pantalla del panel.
      */}
      <Modal abierto={gastoAbierto} onCerrar={cerrarGasto} titulo="Anotar un gasto">
        <AnotarGasto onCerrar={cerrarGasto} />
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
