type Clase = 'gasto' | 'ingreso' | 'transferencia'

/** Color del círculo de la inicial según el tipo de movimiento. */
const colorInicial: Record<Clase, string> = {
  gasto: 'bg-gasto-sutil text-gasto',
  ingreso: 'bg-ingreso-sutil text-ingreso',
  transferencia: 'bg-lavanda-100 text-lavanda-700',
}

/**
 * Una línea del listado de movimientos: inicial, nombre, detalle y monto.
 * Estática a propósito — es una lista que puede tener muchas filas.
 */
export function FilaMovimiento({
  inicial,
  nombre,
  detalle,
  monto,
  clase,
}: {
  inicial: string
  nombre: string
  /** Segunda línea: bolsillo y fecha, p. ej. "Efectivo · Hoy". */
  detalle: string
  /** Monto ya formateado, con su signo. El backend manda el número final. */
  monto: string
  clase: Clase
}) {
  const montoColor =
    clase === 'ingreso' ? 'text-ingreso' : clase === 'gasto' ? 'text-gasto' : 'text-texto-principal'
  return (
    <div className="flex items-center gap-3 rounded-grande bg-fondo-superficie px-4 py-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-nota font-semibold ${colorInicial[clase]}`}
      >
        {inicial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-cuerpo font-medium text-texto-principal">{nombre}</p>
        <p className="truncate text-nota text-texto-tenue">{detalle}</p>
      </div>
      <span className={`text-cuerpo font-semibold tabular-nums ${montoColor}`}>{monto}</span>
    </div>
  )
}
