import { XIcon } from '@phosphor-icons/react'
import { foco } from '@/helpers'

/**
 * Una pastilla de filtro: "Todo", "Gastos", "Ingresos".
 *
 * La usan el historial completo y el bloque de últimos movimientos del panel,
 * que antes tenían cada uno su copia con un color distinto por descuido.
 *
 * `tono` conserva esa diferencia a propósito: en el panel la pastilla activa es
 * lavanda, el acento de la marca, porque comparte pantalla con el botón de
 * anotar y no debe competir con él; en la pantalla de historial, donde no hay
 * ese botón, se usa el azul de acción.
 *
 * `conQuitar` añade la cruz a la pastilla activa cuando pulsarla otra vez
 * quita el filtro. En "Todo" no aparece: no hay nada que quitar.
 */
export function Ficha({
  texto,
  activa,
  onClick,
  tono = 'accion',
  conQuitar = false,
}: {
  texto: string
  activa: boolean
  onClick: () => void
  tono?: 'accion' | 'marca'
  conQuitar?: boolean
}) {
  const encendida =
    tono === 'marca'
      ? 'border-lavanda-800 bg-lavanda-800 text-texto-sobre-marca'
      : 'border-accion-principal bg-accion-principal text-texto-sobre-marca'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-nota font-medium transition-colors active:scale-[0.97] ${foco} ${
        activa
          ? encendida
          : 'border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil'
      }`}
    >
      {texto}
      {conQuitar && activa && <XIcon size={12} weight="bold" aria-hidden />}
    </button>
  )
}
