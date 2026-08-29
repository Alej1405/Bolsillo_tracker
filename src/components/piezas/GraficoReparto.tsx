import { BarraHorizontal, CifraAnimada, escalonado } from '@/movimiento'

// Datos de muestra de la landing. En el dash vendrán calculados del backend:
// el porcentaje ya viene resuelto, el frontend no lo divide.
const categorias = [
  { nombre: 'Comida', pct: 33, monto: 186.4, color: 'var(--color-grafico-1)' },
  { nombre: 'Transporte', pct: 22, monto: 124.0, color: 'var(--color-grafico-2)' },
  { nombre: 'Servicios', pct: 17, monto: 96.5, color: 'var(--color-grafico-3)' },
  { nombre: 'Casa', pct: 15, monto: 84.2, color: 'var(--color-grafico-4)' },
  { nombre: 'Ocio', pct: 13, monto: 74.9, color: 'var(--color-grafico-5)' },
]

/** Las cinco categorías con más gasto, en barras horizontales. */
export function GraficoReparto() {
  return (
    <div className="rounded-extra bg-fondo-superficie p-6">
      <p className="text-rotulo font-semibold text-texto-principal">En qué se fue</p>
      <p className="text-nota text-texto-tenue">Las cinco categorías con más gasto</p>
      <ul className="mt-5 flex flex-col gap-3.5">
        {categorias.map((c, i) => (
          <li key={c.nombre} className="flex items-center gap-3">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="w-24 shrink-0 text-nota text-texto-secundario">{c.nombre}</span>
            <BarraHorizontal porcentaje={c.pct} color={c.color} retraso={i * escalonado} />
            <span className="w-9 shrink-0 text-right text-nota text-texto-tenue tabular-nums">{c.pct}%</span>
            <CifraAnimada
              valor={c.monto}
              className="w-16 shrink-0 text-right text-nota font-medium text-texto-principal tabular-nums"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
