import { DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { foco } from '@/helpers'

type Clase = 'gasto' | 'ingreso' | 'transferencia'

/** Color del círculo de la inicial según el tipo de movimiento. */
const colorInicial: Record<Clase, string> = {
  gasto: 'bg-gasto-sutil text-gasto',
  ingreso: 'bg-ingreso-sutil text-ingreso',
  transferencia: 'bg-lavanda-100 text-lavanda-700',
}

/**
 * Una línea del listado de movimientos: inicial, nombre, detalle y monto.
 *
 * Sin `onBorrar` es estática, que es lo que quiere el bloque del panel: una
 * lista de solo lectura con muchas filas. Con `onBorrar` aparece la papelera,
 * y entonces la fila es la unidad desde la que se corrige un error.
 */
export function FilaMovimiento({
  inicial,
  nombre,
  detalle,
  monto,
  clase,
  onAcciones,
  onEditar,
  onBorrar,
}: {
  inicial: string
  nombre: string
  /** Segunda línea: bolsillo y fecha, p. ej. "Efectivo · Hoy". */
  detalle: string
  /** Monto ya formateado, con su signo. El backend manda el número final. */
  monto: string
  clase: Clase
  /*
    Un único botón que abre las acciones fuera de la fila. Es lo que se usa en
    un teléfono: dos iconos se comen 88 de los 390 px de ancho y el nombre del
    movimiento acaba en "Merca…", justo el dato que distingue una fila de otra.
  */
  onAcciones?: () => void
  /** Si se pasa, la fila ofrece corregir el movimiento. */
  onEditar?: () => void
  /** Si se pasa, la fila ofrece borrar. Quien la usa decide si confirma. */
  onBorrar?: () => void
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

      {/*
        La papelera va siempre visible y siempre en rojo, no en `hover`: en un
        teléfono no hay puntero, y una acción que solo se distingue al pasar el
        ratón no se distingue para media aplicación. Es el mismo criterio que
        en la tarjeta de bolsillo: lo que no tiene vuelta atrás se ve antes de
        pulsarlo, no después.
      */}
      {onAcciones && (
        <button
          type="button"
          onClick={onAcciones}
          aria-label={`Acciones para ${nombre} de ${monto}`}
          className={`grid size-11 shrink-0 place-items-center rounded-full text-texto-tenue transition-colors active:scale-[0.94] active:bg-fondo-sutil ${foco}`}
        >
          <DotsThreeVerticalIcon size={18} weight="bold" aria-hidden />
        </button>
      )}

      {onEditar && (
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Corregir el movimiento ${nombre} de ${monto}`}
          className={`grid size-11 shrink-0 place-items-center rounded-full text-texto-tenue transition-colors hover:bg-fondo-sutil hover:text-texto-principal active:scale-[0.94] ${foco}`}
        >
          <PencilSimpleIcon size={16} aria-hidden />
        </button>
      )}

      {onBorrar && (
        <button
          type="button"
          onClick={onBorrar}
          aria-label={`Borrar el movimiento ${nombre} de ${monto}`}
          className={`grid size-11 shrink-0 place-items-center rounded-full bg-gasto-sutil text-gasto transition-colors hover:bg-gasto hover:text-texto-inverso active:scale-[0.94] ${foco}`}
        >
          <TrashIcon size={16} aria-hidden />
        </button>
      )}
    </div>
  )
}
