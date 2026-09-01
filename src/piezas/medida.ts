import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { conSimbolo } from '@/utils/moneda'
import type { Medida } from '@/types'

/*
  Cómo se lee una medida de rendimiento, sin dibujar nada.

  Está separado de `TarjetaMedida` a propósito: una medida puede aparecer en
  sitios donde la tarjeta no cabe —una píldora en la cabecera, una línea en el
  panel— y ahí solo hace falta el número bien escrito y su color. Importando
  desde aquí se obtiene eso sin arrastrar el componente.

  Aquí no se decide si un número está bien o mal: eso llega resuelto del backend
  en `level`, junto con la frase de `reading`. Esto solo lo viste.
*/

/** El semáforo del backend, traducido a color e icono. */
export const SEMAFORO: Record<Medida['level'], { texto: string; fondo: string; Icono: Icon }> = {
  bien: { texto: 'text-ingreso', fondo: 'bg-ingreso-sutil', Icono: CheckCircleIcon },
  atencion: { texto: 'text-aviso', fondo: 'bg-aviso-sutil', Icono: WarningIcon },
  mal: { texto: 'text-gasto', fondo: 'bg-gasto-sutil', Icono: WarningCircleIcon },
}

/**
 * El valor de una medida, escrito como se lee en Ecuador.
 *
 * El dinero llega en texto ("1500.00") y lo formatea `utils/moneda`. Los
 * porcentajes y los meses llegan como número y se pasan por `toLocaleString`
 * para que 2.1 se lea "2,1" y no "2.1".
 */
export function valorDe({ value, unit }: Medida): string {
  if (unit === 'USD') return conSimbolo(String(value))

  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return String(value)

  const texto = n.toLocaleString('es-EC', { maximumFractionDigits: 1 })
  if (unit === '%') return `${texto}%`
  return `${texto} ${unit}`
}
