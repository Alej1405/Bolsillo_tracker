import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { aFilas } from '@/paginas/panel/adaptadores'
import { FilaMovimiento } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Paginacion } from '@/piezas'
import { Ficha } from '@/ui/Ficha'
import { control, etiquetaDeCategoria, foco, hojasDeCategorias, selector } from '@/helpers'
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

  const hayFiltros = Boolean(
    tipo !== 'todo' || bolsillo || categoria || desde || hasta || busqueda,
  )

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

      <div className="flex flex-col gap-3 rounded-extra bg-fondo-superficie p-4">
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
      </div>

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
    </section>
  )
}
