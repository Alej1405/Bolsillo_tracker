import { useEffect, useMemo, useState } from 'react'
import {
  MagnifyingGlassIcon,
  XIcon,
  CaretDownIcon,
  FunnelIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { aFilas } from '@/paginas/panel/adaptadores'
import { FilaMovimiento } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Paginacion } from '@/piezas'
import { Ficha } from '@/ui/Ficha'
import { control, etiquetaDeCategoria, foco, hojasDeCategorias, selector } from '@/helpers'
import { EditarMovimiento } from '@/paginas/panel/EditarMovimiento'
import { Modal } from '@/ui/Modal'
import { Hoja } from '@/layout/celular/Hoja'
import { useTipoPantalla } from '@/pantalla'
import { useAppStore } from '@/stores/useAppStore'
import type { FiltrosMovimientos } from '@/services/MovimientosService'

const POR_PAGINA = 12

type Tipo = 'todo' | 'expense' | 'income' | 'transfer'

const TIPOS: { id: Tipo; texto: string }[] = [
  { id: 'todo', texto: 'Todo' },
  { id: 'expense', texto: 'Gastos' },
  { id: 'income', texto: 'Ingresos' },
  { id: 'transfer', texto: 'Transferencias' },
]

/**
 * Pantalla de historial: todos los movimientos, con filtros.
 *
 * A diferencia del bloque del panel, aquí **filtra y pagina el backend**. Es la
 * diferencia que importa: la tabla entera puede tener miles de filas, y traerlas
 * para recortarlas en el navegador no escala. Cada cambio de filtro es una
 * consulta nueva con `page` en 1.
 *
 * Los filtros se combinan entre sí, que es lo que hace útil la pantalla: "solo
 * gastos, de la tarjeta, en agosto, que digan mercado".
 */
export function Historial() {
  const historial = useAppStore((e) => e.historial)
  const cargando = useAppStore((e) => e.cargandoHistorial)
  const error = useAppStore((e) => e.errorHistorial)
  const cargarHistorial = useAppStore((e) => e.cargarHistorial)
  const bolsillos = useAppStore((e) => e.bolsillos)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const borrarMovimiento = useAppStore((e) => e.borrarMovimiento)
  const cargarDashboard = useAppStore((e) => e.cargarDashboard)
  /* Las de gasto: son las que se usan para filtrar el historial. */
  const categorias = useAppStore((e) => e.categorias).expense
  const cargarCategorias = useAppStore((e) => e.cargarCategorias)

  const [tipo, setTipo] = useState<Tipo>('todo')
  const [bolsillo, setBolsillo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    void cargarBolsillos()
    void cargarCategorias()
  }, [cargarBolsillos, cargarCategorias])

  /*
    La búsqueda espera 350 ms antes de consultar. Sin eso, escribir "mercado"
    dispara siete peticiones y la última en llegar no tiene por qué ser la de
    la palabra completa.
  */
  const [buscado, setBuscado] = useState('')
  useEffect(() => {
    const t = window.setTimeout(() => setBuscado(busqueda.trim()), 350)
    return () => window.clearTimeout(t)
  }, [busqueda])

  const filtros = useMemo<FiltrosMovimientos>(
    () => ({
      ...(tipo !== 'todo' ? { type: tipo } : {}),
      ...(bolsillo ? { account_id: bolsillo } : {}),
      ...(categoria ? { category_id: categoria } : {}),
      ...(desde ? { from: desde } : {}),
      ...(hasta ? { to: hasta } : {}),
      ...(buscado ? { search: buscado } : {}),
      page: pagina,
      page_size: POR_PAGINA,
    }),
    [tipo, bolsillo, categoria, desde, hasta, buscado, pagina],
  )

  useEffect(() => {
    void cargarHistorial(filtros)
  }, [cargarHistorial, filtros])

  /* Cambiar un filtro vuelve a la primera página: la cuarta puede no existir. */
  const cambiar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPagina(1)
  }

  const cuantosFiltros = [tipo !== 'todo', bolsillo, categoria, desde, hasta, busqueda].filter(
    Boolean,
  ).length
  const hayFiltros = cuantosFiltros > 0

  const limpiar = () => {
    setTipo('todo')
    setBolsillo('')
    setCategoria('')
    setDesde('')
    setHasta('')
    setBusqueda('')
    setPagina(1)
  }

  const filas = aFilas(historial?.items)
  const paginas = historial?.total_pages ?? 1
  const total = historial?.total ?? 0
  const elegibles = useMemo(() => hojasDeCategorias(categorias), [categorias])
  const esCelular = useTipoPantalla() === 'celular'
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  /*
    El movimiento que se va a borrar, o `null`. Se guarda la fila entera y no
    solo el id porque la confirmación tiene que enseñar QUÉ se borra: "¿borrar
    este movimiento?" a secas obliga a recordar cuál se pulsó.
  */
  const [porBorrar, setPorBorrar] = useState<(typeof filas)[number] | null>(null)
  const [porEditar, setPorEditar] = useState<string | null>(null)
  /* En el teléfono las acciones no caben en la fila: salen en una hoja. */
  const [conAcciones, setConAcciones] = useState<(typeof filas)[number] | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  /*
    Desde el historial no es deshacer, es borrar: puede ser de hace semanas y
    el backend no sabe restaurar. Por eso pasa por confirmación, mientras que
    justo después de anotar basta con un toque.
  */
  const confirmarBorrado = async () => {
    if (!porBorrar) return
    setBorrando(true)
    setErrorBorrado(null)
    try {
      await borrarMovimiento(porBorrar.id)
      setPorBorrar(null)
      void cargarHistorial(filtros)
      void cargarDashboard()
      void cargarBolsillos()
    } catch (error) {
      setErrorBorrado(
        error instanceof Error ? error.message : 'No pudimos borrar el movimiento.',
      )
    } finally {
      setBorrando(false)
    }
  }

  /*
    Los campos, escritos una sola vez. En el teléfono viven dentro de la hoja y
    en pantallas grandes dentro de la tarjeta: es el mismo formulario en dos
    marcos, y tenerlo duplicado obligaría a arreglar cada fallo dos veces.
  */
  const camposDeFiltro = (
    <>


      <div className="flex flex-wrap items-center gap-2">
        {TIPOS.map((t) => (
          <Ficha
            key={t.id}
            texto={t.texto}
            activa={tipo === t.id}
            onClick={() => cambiar(setTipo)(t.id)}
          />
        ))}

        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlassIcon
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-tenue"
          />
          {/* El backend busca solo en `note`, comprobado contra el servidor:
              "Alimentación" no encuentra los movimientos de esa categoría.
              Para filtrar por categoría está su propio selector. */}
          <label htmlFor="buscar-historial" className="sr-only">
            Buscar en las notas de tus movimientos
          </label>
          <input
            id="buscar-historial"
            type="search"
            value={busqueda}
            onChange={(e) => cambiar(setBusqueda)(e.target.value)}
            placeholder="Buscar en las notas…"
            className={`${control} w-full rounded-full pr-4 pl-9`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <label htmlFor="bolsillo-historial" className="text-micro text-texto-tenue">
            Bolsillo
          </label>
          <div className="relative">
            <select
              id="bolsillo-historial"
              value={bolsillo}
              onChange={(e) => cambiar(setBolsillo)(e.target.value)}
              className={`${selector} w-full`}
            >
              <option value="">Todos</option>
              {bolsillos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <CaretDownIcon
              size={14}
              weight="bold"
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-texto-tenue"
            />
          </div>
        </div>

        <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <label htmlFor="categoria-historial" className="text-micro text-texto-tenue">
            Categoría
          </label>
          <div className="relative">
            <select
              id="categoria-historial"
              value={categoria}
              onChange={(e) => cambiar(setCategoria)(e.target.value)}
              className={`${selector} w-full`}
            >
              <option value="">Todas</option>
              {elegibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {etiquetaDeCategoria(c)}
                </option>
              ))}
            </select>
            <CaretDownIcon
                size={14}
                weight="bold"
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-texto-tenue"
              />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="desde-historial" className="text-micro text-texto-tenue">
            Desde
          </label>
          <input
            id="desde-historial"
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(e) => cambiar(setDesde)(e.target.value)}
            className={control}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="hasta-historial" className="text-micro text-texto-tenue">
            Hasta
          </label>
          <input
            id="hasta-historial"
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => cambiar(setHasta)(e.target.value)}
            className={control}
          />
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-nota font-medium text-texto-secundario transition-colors hover:bg-fondo-sutil ${foco}`}
          >
            <XIcon size={14} weight="bold" aria-hidden />
            Quitar filtros
          </button>
        )}
      </div>
    </>
  )

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Historial</h2>
        <p className="text-nota text-texto-tenue">
          {cargando
            ? 'Buscando…'
            : total === 0
              ? 'Sin movimientos que mostrar'
              : `${total} ${total === 1 ? 'movimiento' : 'movimientos'}${hayFiltros ? ' con estos filtros' : ''}`}
        </p>
      </div>

      {/*
        En el teléfono los filtros no se muestran, se piden.

        Desplegados ocupaban 700 de los 844 px de la pantalla: nueve controles
        por delante de lo que la persona vino a ver. Aquí son un botón que dice
        cuántos hay puestos y una hoja que sube cuando hace falta, y la lista
        empieza arriba. En pantallas grandes sí caben al lado del contenido y se
        quedan donde estaban: ahí esconderlos sería un toque de más por nada.
      */}
      {esCelular ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltrosAbiertos(true)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-borde-fuerte bg-fondo-superficie px-4 text-nota font-medium text-texto-principal transition-colors active:scale-[0.98] ${foco}`}
          >
            <FunnelIcon size={16} weight={hayFiltros ? 'fill' : 'regular'} aria-hidden />
            Filtrar
            {hayFiltros && (
              <span className="grid size-5 place-items-center rounded-full bg-lavanda-900 text-micro font-bold text-texto-inverso tabular-nums">
                {cuantosFiltros}
              </span>
            )}
          </button>

          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              aria-label="Quitar todos los filtros"
              className={`grid size-11 shrink-0 place-items-center rounded-full border border-borde-fuerte text-texto-secundario transition-colors active:scale-[0.95] ${foco}`}
            >
              <XIcon size={16} weight="bold" aria-hidden />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-extra bg-fondo-superficie p-4">
          {camposDeFiltro}
        </div>
      )}

      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargarHistorial(filtros)}>
            Reintentar
          </Boton>
        </div>
      ) : cargando ? (
        <EsperandoLista filas={6} alto={60} />
      ) : filas.length > 0 ? (
        /*
          La lista se desplaza dentro de sí misma, no arrastrando la página: el
          título, los filtros y la paginación se quedan donde están. Sin esto
          hay que bajar hasta el final de las doce filas para cambiar de página
          y volver arriba para tocar un filtro.

          El tope va en `max-h` y no en `flex-1` para no depender de la altura
          de los padres: esto afecta solo a esta tarjeta y a nada más de la
          pantalla. `pr-1` deja sitio a la barra para que no se monte sobre los
          montos.
        */
        <div className="flex flex-col gap-1 md:max-h-[60dvh] md:overflow-y-auto md:pr-1">
          {filas.map((m) => (
            <FilaMovimiento
              key={m.id}
              inicial={m.inicial}
              nombre={m.nombre}
              detalle={m.detalle}
              monto={m.monto}
              clase={m.clase}
              {...(esCelular
                ? { onAcciones: () => setConAcciones(m) }
                : {
                    onEditar: () => setPorEditar(m.id),
                    onBorrar: () => {
                      setErrorBorrado(null)
                      setPorBorrar(m)
                    },
                  })}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-extra bg-fondo-superficie px-5 py-10 text-center text-cuerpo text-texto-secundario">
          {hayFiltros
            ? 'Ningún movimiento coincide con estos filtros.'
            : 'Todavía no registras movimientos. El primero que anotes aparece aquí.'}
        </p>
      )}

      {!cargando && !error && paginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-nota text-texto-tenue">
            Página {pagina} de {paginas}
          </p>
          {/* `pasos` y no números: aquí las páginas las decide el servidor y
              pueden ser decenas. */}
          <Paginacion pagina={pagina} paginas={paginas} ir={setPagina} variante="pasos" />
        </div>
      )}
      <Modal
        abierto={porEditar !== null}
        onCerrar={() => setPorEditar(null)}
        titulo="Corregir movimiento"
      >
        {porEditar && (
          <EditarMovimiento
            id={porEditar}
            onCerrar={() => setPorEditar(null)}
            onListo={() => {
              setPorEditar(null)
              void cargarHistorial(filtros)
              void cargarDashboard()
              void cargarBolsillos()
            }}
          />
        )}
      </Modal>

      <Modal
        abierto={porBorrar !== null}
        onCerrar={() => setPorBorrar(null)}
        titulo="Borrar movimiento"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
              ¿Borrar este movimiento?
            </h2>
            <p className="text-cuerpo leading-relaxed text-texto-secundario">
              Dejará de contar en tus bolsillos y en tus reportes. Esto no se puede deshacer.
            </p>
          </div>

          {/* Qué se borra, con las mismas palabras con que aparece en la lista. */}
          {porBorrar && (
            <div className="flex items-center gap-3 rounded-extra bg-fondo-sutil px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-cuerpo font-medium text-texto-principal">
                  {porBorrar.nombre}
                </p>
                <p className="truncate text-nota text-texto-tenue">{porBorrar.detalle}</p>
              </div>
              <span className="text-cuerpo font-semibold tabular-nums text-texto-principal">
                {porBorrar.monto}
              </span>
            </div>
          )}

          {errorBorrado && (
            <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
              {errorBorrado}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Boton type="button" variante="secundario" onClick={() => setPorBorrar(null)}>
              Cancelar
            </Boton>
            {/*
              `peligro` y no el botón por defecto: es la única acción de esta
              pantalla que no se puede revertir, y tiene que verse distinta.
            */}
            <Boton
              type="button"
              variante="peligro"
              onClick={() => void confirmarBorrado()}
              disabled={borrando}
            >
              {borrando ? 'Borrando…' : 'Sí, borrar'}
            </Boton>
          </div>
        </div>
      </Modal>

      {/*
        Las acciones, con su nombre escrito. En la fila eran dos iconos sin
        etiqueta; aquí se lee "Corregir" y "Borrar", y borrar puede ir en rojo
        sin competir con el monto de la lista.
      */}
      <Hoja
        abierta={conAcciones !== null}
        onCerrar={() => setConAcciones(null)}
        titulo={conAcciones ? conAcciones.nombre : 'Movimiento'}
      >
        <ul className="flex flex-col py-2">
          <li>
            <button
              type="button"
              onClick={() => {
                const m = conAcciones
                setConAcciones(null)
                if (m) setPorEditar(m.id)
              }}
              className={`flex min-h-[52px] w-full items-center gap-3 rounded-grande px-2 text-cuerpo text-texto-principal transition-colors active:scale-[0.99] active:bg-fondo-sutil ${foco}`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
                <PencilSimpleIcon size={18} aria-hidden />
              </span>
              Corregir
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                const m = conAcciones
                setConAcciones(null)
                setErrorBorrado(null)
                if (m) setPorBorrar(m)
              }}
              className={`flex min-h-[52px] w-full items-center gap-3 rounded-grande px-2 text-cuerpo text-gasto transition-colors active:scale-[0.99] active:bg-gasto-sutil ${foco}`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-gasto-sutil text-gasto">
                <TrashIcon size={18} aria-hidden />
              </span>
              Borrar
            </button>
          </li>
        </ul>
      </Hoja>

      <Hoja
        abierta={esCelular && filtrosAbiertos}
        onCerrar={() => setFiltrosAbiertos(false)}
        titulo="Filtrar movimientos"
      >
        <div className="flex flex-col gap-3 pb-2">{camposDeFiltro}</div>
      </Hoja>
    </section>
  )
}
