/**
 * `valorDe`: cómo se escribe cada medida de rendimiento.
 *
 * El backend manda el número y la unidad por separado —"USD", "%", "meses"—
 * porque cada una se escribe distinto. Esta función es la que traduce, y es
 * fácil equivocarse: durante el desarrollo se intentó usarla para formatear
 * algo que no era dinero y salió un "$ 6,00" donde debía decir "6 meses".
 */

import { describe, expect, it } from 'vitest'

import { valorDe } from '@/piezas/medida'

const medida = (value: string | number, unit: string) =>
  ({ key: 'k', label: 'l', value, unit, reading: 'r', level: 'bien' }) as never

describe('valorDe', () => {
  it('el dinero lleva símbolo y formato de aquí', () => {
    expect(valorDe(medida('3152.85', 'USD'))).toBe('$ 3.152,85')
  })

  it('un porcentaje no lleva símbolo de moneda', () => {
    expect(valorDe(medida(85.7, '%'))).toBe('85,7%')
  })

  it('los meses se escriben con su palabra', () => {
    expect(valorDe(medida(6, 'meses'))).toBe('6 meses')
  })

  it('redondea a un decimal lo que no es dinero', () => {
    expect(valorDe(medida(2.14159, 'meses'))).toBe('2,1 meses')
  })

  it('el dinero en contra mantiene el signo delante', () => {
    expect(valorDe(medida('-133.70', 'USD'))).toBe('− $133,70')
  })

  it('si el valor no es un número, lo devuelve tal cual en vez de romper', () => {
    expect(valorDe(medida('sin datos', 'meses'))).toBe('sin datos')
  })
})
