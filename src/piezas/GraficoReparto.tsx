import { BarraHorizontal, CifraAnimada, escalonado } from '@/movimiento'

export type CategoriaReparto = {
  id?: string
  nombre: string
  /** Ya resuelto por el backend: el frontend no lo divide. */
  pct: number
  monto: number
  color: string
}

/* Los cinco colores de serie del sistema, en orden. */
const SERIES = [
  'var(--color-grafico-1)',
  'var(--color-grafico-2)',
  'var(--color-grafico-3)',
  'var(--color-grafico-4)',
  'var(--color-grafico-5)',
]

/* Datos de vitrina: los usa la landing, que llama sin props. */
const MUESTRA: CategoriaReparto[] = [
  { nombre: 'Comida', pct: 33, monto: 186.4, color: SERIES[0] },
  { nombre: 'Transporte', pct: 22, monto: 124.0, color: SERIES[1] },
  { nombre: 'Servicios', pct: 17, monto: 96.5, color: SERIES[2] },
  { nombre: 'Casa', pct: 15, monto: 84.2, color: SERIES[3] },
  { nombre: 'Ocio', pct: 13, monto: 74.9, color: SERIES[4] },
]

/** Las cinco categorías con más gasto, en barras horizontales. */
export function GraficoReparto({
  categorias = MUESTRA,
  animar = true,
}: {
  categorias?: CategoriaReparto[]
  /** El panel las pinta sin contar. */
  animar?: boolean
}) {
  return (
    <div className="rounded-extra bg-fondo-superficie p-6">
      <p className="text-rotulo font-semibold text-texto-principal">En qué se fue</p>
      <p className="text-nota text-texto-tenue">Las cinco categorías con más gasto</p>

      {categorias.length === 0 ? (
        <p className="mt-5 text-nota text-texto-tenue">
          Todavía no hay gastos con categoría este mes.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3.5">
          {categorias.map((c, i) => (
            <li key={c.id ?? c.nombre} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color || SERIES[i % SERIES.length] }}
              />
              <span className="w-24 shrink-0 truncate text-nota text-texto-secundario">
                {c.nombre}
              </span>
              <BarraHorizontal
                animar={animar}
                porcentaje={c.pct}
                color={c.color || SERIES[i % SERIES.length]}
                retraso={i * escalonado}
              />
              <span className="w-9 shrink-0 text-right text-nota text-texto-tenue tabular-nums">
                {Math.round(c.pct)}%
              </span>
              <CifraAnimada animar={animar}
                valor={c.monto}
                className="w-16 shrink-0 text-right text-nota font-medium text-texto-principal tabular-nums"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
