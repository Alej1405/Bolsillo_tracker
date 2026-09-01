/**
 * El dinero: la parte donde un error se ve en el saldo de alguien.
 *
 * Todo esto es formato y lectura, nunca cálculo: el backend manda la cifra
 * final y aquí solo se escribe como se escribe en Ecuador. Por eso las pruebas
 * miran la forma —el punto de miles, la coma decimal, el signo delante del
 * símbolo— y no si la suma está bien, que no es trabajo del frontend.
 */

import { describe, expect, it } from 'vitest'

import { aMontoDelBackend, aNumero, conSimbolo, enContra, formatearMonto } from '@/utils/moneda'

describe('leer lo que llega del backend', () => {
  it('entiende el punto decimal de la API', () => {
    expect(aNumero('12.40')).toBe(12.4)
  })

  it('entiende el formato de aquí, con coma decimal', () => {
    expect(aNumero('1.248,50')).toBe(1248.5)
  })

  it('no se rompe con lo que no hay', () => {
    expect(aNumero(null)).toBe(0)
    expect(aNumero(undefined)).toBe(0)
    expect(aNumero('')).toBe(0)
  })
})

describe('escribirlo como se escribe aquí', () => {
  it('miles con punto y decimales con coma', () => {
    expect(formatearMonto('1248.5')).toBe('1.248,50')
  })

  it('siempre dos decimales, aunque el backend mande un entero', () => {
    // Sin esto, una columna donde unas cifras llevan centavos y otras no
    // deja de alinearse por mucho `tabular-nums` que tenga.
    expect(formatearMonto('800')).toBe('800,00')
  })

  it('el signo va delante del símbolo, no pegado al número', () => {
    // "− $340,20" es como se escribe una cantidad en contra. "$ -340,20" no.
    expect(conSimbolo('-340.20')).toBe('− $340,20')
    expect(conSimbolo('340.20')).toBe('$ 340,20')
  })

  it('usa el menos tipográfico y no el guion del teclado', () => {
    // U+2212 tiene el ancho de los dígitos; el guion no, y desalinea la columna.
    expect(conSimbolo('-1')).toContain('−')
    expect(conSimbolo('-1')).not.toContain('-')
  })
})

describe('lo que la persona teclea, hacia el backend', () => {
  it('con coma, la coma es el decimal', () => {
    expect(aMontoDelBackend('1.248,50')).toBe('1248.50')
  })

  it('el punto decimal se respeta: es como está el dato en la base', () => {
    /*
      Esta es la prueba que más importa de este archivo.

      La versión anterior quitaba TODOS los puntos sin mirar, así que quien
      escribía "1000.50" enviaba "100050" y anotaba un gasto CIEN VECES mayor.
      Nadie teclea el separador de miles a mano; el punto decimal sí.
    */
    expect(aMontoDelBackend('1000.50')).toBe('1000.50')
  })

  it('aguanta espacios de más', () => {
    expect(aMontoDelBackend('  12,75  ')).toBe('12.75')
  })
})

describe('saber si un saldo está en contra', () => {
  it('lo dice el signo que manda el backend, no una cuenta de aquí', () => {
    expect(enContra('-133.70')).toBe(true)
    expect(enContra('133.70')).toBe(false)
    expect(enContra('0')).toBe(false)
    expect(enContra(null)).toBe(false)
  })
})
