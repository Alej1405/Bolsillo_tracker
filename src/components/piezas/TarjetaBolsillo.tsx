/** Inicial y color de cada tipo de bolsillo. */
const bolsillos = {
  Efectivo: { inicial: 'E', color: 'bg-ingreso-sutil text-ingreso' },
  Banco: { inicial: 'B', color: 'bg-lavanda-100 text-lavanda-700' },
  Tarjeta: { inicial: 'T', color: 'bg-gasto-sutil text-gasto' },
  Ahorro: { inicial: 'A', color: 'bg-aviso-sutil text-aviso' },
} as const

/** Fila del listado de bolsillos, con su saldo. Estática. */
export function TarjetaBolsillo({
  clase,
  nombre,
  monto,
  negativo = false,
}: {
  clase: keyof typeof bolsillos
  /** Nombre que le puso el usuario, p. ej. "Viaje a la playa". */
  nombre: string
  monto: string
  /** Pinta el monto en rojo. Para tarjetas de crédito y saldos en contra. */
  negativo?: boolean
}) {
  const b = bolsillos[clase]
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-grande)] bg-fondo-superficie px-4 py-3.5">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${b.color}`}>
        {b.inicial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-texto-principal">{nombre}</p>
        <p className="truncate text-[13px] text-texto-tenue">{clase}</p>
      </div>
      <span
        className={`text-[15px] font-semibold tabular-nums ${negativo ? 'text-gasto' : 'text-texto-principal'}`}
      >
        {monto}
      </span>
    </div>
  )
}
