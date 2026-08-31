/*
  Montos: cómo se leen y cómo se escriben.

  En Ecuador el separador de miles es el punto y el de decimales la coma:
  1.248,50. El backend no manda los montos con esa forma —responde "1248.50",
  con punto decimal y sin miles—, así que darles formato es trabajo de aquí.
  La regla del proyecto es la de siempre: el backend calcula, el frontend
  formatea.
*/

/**
 * Monto de la API a número.
 *
 * Acepta las dos formas porque llegan las dos: el backend responde "120.50" y
 * el mock de desarrollo "1.248,50". Si hay coma, la coma es el decimal y los
 * puntos son miles; si no hay coma, el punto es el decimal.
 *
 * Sin esta distinción, "120.50" se convertía en 12050 — el saldo salía cien
 * veces más grande.
 */
export function aNumero(monto?: string | number | null): number {
  if (monto == null) return 0
  if (typeof monto === 'number') return Number.isFinite(monto) ? monto : 0

  const crudo = monto.replace(/\s/g, '')
  const normalizado = crudo.includes(',') ? crudo.replace(/\./g, '').replace(',', '.') : crudo

  const n = Number(normalizado.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/**
 * Número o monto de la API a texto ecuatoriano: 1.248,50.
 *
 * Siempre con dos decimales, aunque el backend mande "0": una columna de
 * cifras donde unas tienen centavos y otras no deja de alinearse aunque lleve
 * `tabular-nums`.
 */
export function formatearMonto(monto?: string | number | null): string {
  return aNumero(monto).toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Lo mismo, con el símbolo delante: "$ 1.248,50".
 *
 * En los negativos el signo va antes del símbolo —"− $340,20" y no
 * "$ -340,20"—, que es como se escribe una cantidad en contra. Y es el menos
 * tipográfico (U+2212), no el guion del teclado: tiene el ancho de los dígitos
 * y no rompe la alineación de una columna con `tabular-nums`.
 */
export function conSimbolo(monto?: string | number | null): string {
  const n = aNumero(monto)
  const texto = formatearMonto(Math.abs(n))
  return n < 0 ? `− $${texto}` : `$ ${texto}`
}

/**
 * Monto tecleado por la persona a lo que el backend valida.
 *
 * Misma regla que `aNumero`, y por el mismo motivo: si hay coma, la coma es el
 * decimal y los puntos son miles; si no hay coma, un punto solo puede ser el
 * decimal.
 *
 * Antes quitaba TODOS los puntos sin mirar, así que quien escribía "1000.50"
 * —con punto decimal, que es como está el dato en la base— enviaba "100050" y
 * anotaba un gasto cien veces mayor. Nadie escribe el separador de miles a
 * mano, pero el punto decimal sí se escribe.
 */
export function aMontoDelBackend(valor: string): string {
  const crudo = valor.trim().replace(/\s/g, '')
  return crudo.includes(',') ? crudo.replace(/\./g, '').replace(',', '.') : crudo
}

/** Un saldo va en contra si el backend lo manda con signo. No se calcula aquí. */
export function enContra(monto?: string | null): boolean {
  return Boolean(monto?.trim().startsWith('-'))
}
