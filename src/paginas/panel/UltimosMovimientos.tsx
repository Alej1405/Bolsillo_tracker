import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { FilaMovimiento } from '@/piezas'
import type { FilaMovimiento as Fila } from '@/paginas/panel/adaptadores'

const POR_PAGINA = 5

type Vista = 'todo' | 'gasto' | 'ingreso' | 'transferencia'

const VISTAS: { id: Vista; texto: string }[] = [
  { id: 'todo', texto: 'Todo' },
  { id: 'gasto', texto: 'Solo gastos' },
  { id: 'ingreso', texto: 'Solo ingresos' },
  { id: 'transferencia', texto: 'Transferencias' },
]

const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco'

/**
 * Ficha de filtro. Se comporta como un grupo de opción única, no como cuatro
 * interruptores sueltos: `aria-pressed` solo dice la verdad si el estado
 * cambia de verdad al pulsar.
 */
function Ficha({
  texto,
  activa,
  onClick,
}: {
  texto: string
  activa: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-nota font-medium transition-colors active:scale-[0.97] ${foco} ${
        activa
          ? 'border-lavanda-800 bg-lavanda-800 text-texto-sobre-marca'
          : 'border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil'
      }`}
    >
      {texto}
      {activa && texto !== 'Todo' && <XIcon size={12} weight="bold" aria-hidden />}
    </button>
  )
}

/** Control de página. Solo aparece cuando hay más de una. */
function Paginacion({
  pagina,
  paginas,
  ir,
}: {
  pagina: number
  paginas: number
  ir: (n: number) => void
}) {
  const boton =
    `grid size-11 place-items-center rounded-medio text-nota font-medium transition-colors active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${foco}`

  return (
    <nav aria-label="Páginas del historial" className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => ir(pagina - 1)}
        disabled={pagina === 1}
        aria-label="Página anterior"
        className={`${boton} border border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil`}
      >
        ‹
      </button>

      {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => ir(n)}
          aria-label={`Página ${n}`}
          aria-current={n === pagina ? 'page' : undefined}
          className={`${boton} ${
            n === pagina
              ? 'bg-accion-principal text-texto-sobre-marca'
              : 'border border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => ir(pagina + 1)}
        disabled={pagina === paginas}
        aria-label="Página siguiente"
        className={`${boton} border border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil`}
      >
        ›
      </button>
    </nav>
  )
}

/**
 * Los últimos movimientos, dentro del panel de inicio.
 *
 * NO es la pantalla de Historial —esa vive en `Historial.tsx` y consulta
 * `GET /transactions` con filtros del servidor. Este bloque solo muestra los
 * que ya vienen en el reporte del panel, y filtra y pagina en memoria sobre
 * ese puñado.
 */
export function UltimosMovimientos({
  movimientos,
  cargando,
}: {
  movimientos: Fila[]
  cargando: boolean
}) {
  const [vista, setVista] = useState<Vista>('todo')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return movimientos.filter((m) => {
      if (vista !== 'todo' && m.clase !== vista) return false
      if (!texto) return true
      return `${m.nombre} ${m.detalle}`.toLowerCase().includes(texto)
    })
  }, [movimientos, vista, busqueda])

  const paginas = Math.max(Math.ceil(filtrados.length / POR_PAGINA), 1)
  // Si al filtrar quedan menos páginas que la actual, se vuelve a la última
  // que existe en vez de mostrar una página vacía.
  const actual = Math.min(pagina, paginas)
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA)

  const cambiarVista = (v: Vista) => {
    setVista(v)
    setPagina(1)
  }

  return (
    <section
      aria-labelledby="historial-titulo"
      className="flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="historial-titulo"
          className="font-titulo text-titulo-medio font-bold text-texto-principal"
        >
          Historial
        </h2>
        <p className="text-nota text-texto-tenue">Todos tus gastos e ingresos</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {VISTAS.map((v) => (
          <Ficha
            key={v.id}
            texto={v.texto}
            activa={vista === v.id}
            onClick={() => cambiarVista(vista === v.id && v.id !== 'todo' ? 'todo' : v.id)}
          />
        ))}

        <div className="relative min-w-[180px] flex-1">
          <MagnifyingGlassIcon
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-tenue"
          />
          <label htmlFor="buscar-movimiento" className="sr-only">
            Buscar en tus movimientos
          </label>
          <input
            id="buscar-movimiento"
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPagina(1)
            }}
            placeholder="Buscar…"
            className={`h-11 w-full rounded-full border border-borde-fuerte bg-fondo-superficie pr-4 pl-9 text-nota text-texto-principal transition-colors outline-none placeholder:text-texto-tenue ${foco}`}
          />
        </div>
      </div>

      <div className="h-px w-full bg-borde-sutil" />

      {cargando ? (
        <EsperandoLista filas={5} alto={60} />
      ) : visibles.length > 0 ? (
        <div className="flex flex-col gap-1">
          {visibles.map((m) => (
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
        <p className="rounded-grande border border-dashed border-borde-fuerte px-5 py-8 text-center text-cuerpo text-texto-secundario">
          {movimientos.length === 0
            ? 'Todavía no registras movimientos. El primero que anotes aparece aquí.'
            : 'Ningún movimiento coincide con lo que buscas.'}
        </p>
      )}

      {!cargando && filtrados.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-nota text-texto-tenue">
            {visibles.length} de {filtrados.length}{' '}
            {filtrados.length === 1 ? 'movimiento' : 'movimientos'}
          </p>
          {paginas > 1 && <Paginacion pagina={actual} paginas={paginas} ir={setPagina} />}
        </div>
      )}
    </section>
  )
}
