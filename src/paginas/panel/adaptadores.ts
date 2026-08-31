import type { ClaseMovimiento } from '@/datos'
import { formatearMonto } from '@/utils/moneda'
import type { CategoriaGasto, Movimiento as MovimientoAPI, Totales } from '@/types'

/*
  Traducción de la respuesta de `GET /reports/dashboard` a lo que pintan las
  piezas del UI Kit.

  Aquí solo se formatea: se elige el signo, se compone la segunda línea y se
  saca la inicial. Ninguna función suma, resta ni calcula porcentajes — esos
  llegan resueltos del backend, que es la regla del proyecto.
*/

/** `expense` → `gasto`, para no arrastrar el inglés del API a los componentes. */
const CLASES: Record<MovimientoAPI['type'], ClaseMovimiento> = {
  expense: 'gasto',
  income: 'ingreso',
  transfer: 'transferencia',
}

/** El signo es obligatorio: el color por sí solo no distingue con daltonismo. */
const SIGNOS: Record<MovimientoAPI['type'], string> = {
  expense: '− ',
  income: '+ ',
  transfer: '',
}

/**
 * "Hoy", "Ayer" o "28 ago". La fecha absoluta a partir de anteayer: más atrás
 * "hace 5 días" obliga a contar con los dedos.
 */
function cuando(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''

  const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dias = Math.round((dia(new Date()) - dia(fecha)) / 86_400_000)

  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

/** Nombre que se lee en la fila: la categoría, o la nota, o el tipo. */
function titulo(m: MovimientoAPI): string {
  if (m.type === 'transfer') return 'Pasaste plata'
  return m.category?.name ?? m.note ?? (m.type === 'income' ? 'Ingreso' : 'Gasto')
}

/** Segunda línea: de dónde salió y cuándo. En transferencias, el recorrido. */
function detalle(m: MovimientoAPI): string {
  if (m.type === 'transfer' && m.counter_account) {
    return `${m.account.name} → ${m.counter_account.name}`
  }
  return [m.account.name, cuando(m.occurred_at)].filter(Boolean).join(' · ')
}

export type FilaMovimiento = {
  id: string
  inicial: string
  nombre: string
  detalle: string
  monto: string
  clase: ClaseMovimiento
}

/** Movimientos del backend → filas del historial. */
export function aFilas(movimientos: MovimientoAPI[] = []): FilaMovimiento[] {
  return movimientos.map((m) => {
    const nombre = titulo(m)
    return {
      id: m.id,
      inicial: nombre.charAt(0).toUpperCase(),
      nombre,
      detalle: detalle(m),
      monto: `${SIGNOS[m.type]}${formatearMonto(m.amount)}`,
      clase: CLASES[m.type],
    }
  })
}

export type FilaReparto = {
  id: string
  nombre: string
  /** Ya calculado por el backend. */
  porcentaje: number
  monto: string
  color: string | null
}

/** Categorías con más gasto → filas del reparto. */
export function aReparto(categorias: CategoriaGasto[] = []): FilaReparto[] {
  return categorias.map((c) => ({
    id: c.category.id,
    nombre: c.category.name,
    porcentaje: c.percentage,
    monto: c.amount,
    color: c.category.color,
  }))
}

/**
 * Totales del mes → las dos barras y el resultado.
 *
 * `neto` se toma de `summary.net`, no de restar entró menos salió: el backend
 * ya lo manda resuelto y puede incluir reglas que aquí no se conocen.
 */
export function aEntroSalio(totales?: Totales) {
  return {
    entro: totales?.total_income ?? '0,00',
    salio: totales?.total_expense ?? '0,00',
    neto: totales?.net ?? '0,00',
  }
}
