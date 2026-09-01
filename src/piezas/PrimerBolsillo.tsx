import { useEffect, useState } from 'react'
import { BankIcon, MoneyWavyIcon, PiggyBankIcon, WalletIcon } from '@phosphor-icons/react'
import { listarCuentas } from '@/services/CuentasService'
import { foco, useCerrarSesion } from '@/helpers'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { useAppStore } from '@/stores/useAppStore'

/*
  Los tres sitios donde la gente guarda plata, para que "bolsillo" deje de ser
  una palabra abstracta. Se entiende antes viendo el banco, el efectivo y el
  chanchito que leyendo una definición.
*/
const EJEMPLOS = [
  { Icono: BankIcon, titulo: 'Tu banco', pie: 'La cuenta donde te pagan' },
  { Icono: MoneyWavyIcon, titulo: 'Efectivo', pie: 'Lo que llevas encima' },
  { Icono: PiggyBankIcon, titulo: 'Ahorro', pie: 'Lo que no piensas tocar' },
]

/**
 * La bienvenida de quien todavía no tiene ningún bolsillo.
 *
 * Sin bolsillos el panel no está vacío por casualidad: es que no hay de dónde
 * sacar ni a dónde meter nada, y todas las pantallas —historial, reportes,
 * rendimiento— muestran cero. Un tablero en cero no dice "te falta un paso",
 * dice "esto no sirve", y quien entra por primera vez se va.
 *
 * Por eso interrumpe en lugar de esperar en una esquina: es el único momento
 * de la aplicación en el que no hay nada más que hacer, y el único camino
 * hacia adelante es crear el primero.
 *
 * No se cierra hasta que haya un bolsillo: sin equis, sin Escape y sin clic
 * fuera. No es para atrapar a nadie —el botón que resuelve está aquí dentro y
 * es lo único que hay que tocar—, es que detrás no hay nada. Dejar salir a un
 * panel donde todas las cifras son cero no da libertad, da una pantalla en
 * blanco sin explicar por qué.
 *
 * Hay exactamente dos salidas, y las dos son honestas: crear el bolsillo, o
 * irse. "Hacerlo en otro momento" cierra la sesión en vez de dejar a medias,
 * porque quedarse dentro sin bolsillos no es un estado que la aplicación
 * pueda mostrar. Vuelve a aparecer en la siguiente sesión hasta que exista el
 * primero.
 */
export function PrimerBolsillo() {
  const usuario = useAppStore((e) => e.usuario)
  const bolsillos = useAppStore((e) => e.bolsillos)
  const cargar = useAppStore((e) => e.cargarBolsillos)
  const abrirCrear = useAppStore((e) => e.abrirCrearBolsillo)
  const crearAbierto = useAppStore((e) => e.crearAbierto)

  const esCliente = usuario ? usuario.role !== 'super_admin' : false
  const cerrarSesion = useCerrarSesion()

  /*
    Cuantos bolsillos tiene EN TOTAL, archivados incluidos.

    Se consulta aparte y no se lee de `bolsillos` del store por un bug real:
    esa lista viene sin archivados, asi que alguien que archivo su unico
    bolsillo tenia cero en la lista y la bienvenida se le abria encima —con
    sus movimientos ya registrados y sin poder cerrarla, porque este dialogo
    no tiene salida—. Archivar no es empezar de cero.

    `undefined` mientras no se sabe: hasta que el servidor conteste no se abre
    nada, que es la unica forma de no hacerlo parpadear a quien si tiene.
  */
  const [cuantos, setCuantos] = useState<number | undefined>(undefined)

  /*
    La lista se pide una sola vez. Sin esto, quien entra directo a una pantalla
    que no consulta bolsillos —reportes, por ejemplo— nunca sabría que no tiene
    ninguno, y la bienvenida no aparecería justo donde más falta hace.
  */
  useEffect(() => {
    if (!esCliente) return
    let vigente = true
    listarCuentas(true)
      .then((r) => vigente && setCuantos(r.items.length))
      /* Si falla la consulta no se interrumpe: mejor no abrir que abrir mal. */
      .catch(() => vigente && setCuantos(1))
    return () => {
      vigente = false
    }
    /* `bolsillos.length` en las dependencias: al crear el primero se recuenta
       y la bienvenida se cierra sola. */
  }, [esCliente, bolsillos.length])

  /* La lista normal la sigue necesitando el resto del panel. */
  useEffect(() => {
    if (esCliente) void cargar()
  }, [esCliente, cargar])

  /*
    Mientras el formulario de crear está abierto la bienvenida se aparta: son
    dos diálogos, y encadenarlos uno encima de otro tapa el que importa.
  */
  const abierta = esCliente && cuantos === 0 && !crearAbierto

  return (
    <Modal
      abierto={abierta}
      obligatorio
      onCerrar={() => {}}
      titulo="Crea tu primer bolsillo"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="grid size-12 place-items-center rounded-full bg-lavanda-200 text-lavanda-900">
            <WalletIcon size={24} weight="fill" aria-hidden />
          </span>
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Empieza por tu primer bolsillo
          </h2>
          <p className="text-cuerpo leading-relaxed text-texto-secundario">
            Un bolsillo es cada sitio donde tienes plata. No es una categoría de gasto: es el
            lugar del que sale y al que entra el dinero.
          </p>
        </div>

        <ul className="flex flex-col gap-1.5">
          {EJEMPLOS.map(({ Icono, titulo, pie }) => (
            <li key={titulo} className="flex items-center gap-3 rounded-grande bg-fondo-sutil px-3 py-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fondo-superficie text-texto-secundario">
                <Icono size={18} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-cuerpo font-medium text-texto-principal">{titulo}</span>
                <span className="block text-nota text-texto-tenue">{pie}</span>
              </span>
            </li>
          ))}
        </ul>

        {/*
          El porqué, y no solo el qué. Separar la plata por bolsillos es lo que
          convierte "gasté 300" en "gasté 300 y me quedan 40 en efectivo", que
          es la respuesta que la gente viene a buscar.
        */}
        <p className="rounded-grande border border-borde-sutil px-4 py-3 text-nota leading-relaxed text-texto-secundario">
          Separarlos es lo que permite saber <strong className="font-semibold">cuánto te queda
          en cada sitio</strong>, y no solo cuánto gastaste en total. Puedes crear los que
          quieras y cambiarlos después.
        </p>

        <div className="flex flex-col gap-2">
          {/*
            `cta` no trae fondo propio —cada uso le pone el suyo, como hacen
            los botones del nav—, así que va el mismo que "Anotar un gasto":
            es la acción principal del panel y debe leerse igual.
          */}
          <Boton
            onClick={abrirCrear}
            variante="cta"
            className="min-h-12 w-full bg-marca-700 hover:bg-tinta-400"
          >
            {/*
              El tamaño va en un span propio, no heredado de la variante: `cta`
              se comparte con botones pequeños y este es la acción principal de
              un diálogo que tiene que leerse sin esfuerzo.
            */}
            <span className="text-cuerpo">Crear mi primer bolsillo</span>
          </Boton>
          <p className="text-center text-micro text-texto-tenue">
            Toma menos de un minuto. Solo necesitas un nombre y cuánto tienes ahí.
          </p>

          {/*
            La otra salida. Dice lo que hace —cerrar la sesión— en vez de
            insinuar que la pantalla de detrás se puede usar: descubrirlo al
            pulsar sería peor que no ofrecerlo.
          */}
          <button
            type="button"
            onClick={cerrarSesion}
            className={`mt-1 min-h-11 rounded-full text-nota font-medium text-texto-tenue transition-colors hover:text-texto-principal ${foco}`}
          >
            Hacerlo en otro momento y salir
          </button>

        </div>
      </div>
    </Modal>
  )
}
