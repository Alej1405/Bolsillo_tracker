/**
 * Los helpers compartidos: fechas, categorías y nombres.
 *
 * Se prueban aquí y no en cada pantalla porque viven en un solo sitio para
 * eso. Si `rangoDelMes` se equivoca, se equivocan el historial, los reportes
 * y el rendimiento a la vez.
 */

import { describe, expect, it, vi, afterEach } from 'vitest'

import { ATAJOS_DE_FECHA, etiquetaDeCategoria, hojasDeCategorias, iniciales, nombreDelMes, rangoDelMes, ultimosAnios } from '@/helpers'

afterEach(() => vi.useRealTimers())

describe('el rango de un mes', () => {
  it('va del día 1 al último', () => {
    expect(rangoDelMes(2026, 9)).toEqual({ desde: '2026-09-01', hasta: '2026-09-30' })
  })

  it('acierta con los meses de 31', () => {
    expect(rangoDelMes(2026, 8).hasta).toBe('2026-08-31')
  })

  it('acierta con febrero', () => {
    expect(rangoDelMes(2026, 2).hasta).toBe('2026-02-28')
  })

  it('y con febrero de un año bisiesto', () => {
    // 2028 es bisiesto. Si esto falla, el filtro de febrero pierde un día.
    expect(rangoDelMes(2028, 2).hasta).toBe('2028-02-29')
  })

  it('rellena con cero los meses de un dígito', () => {
    expect(rangoDelMes(2026, 3).desde).toBe('2026-03-01')
  })
})

describe('los atajos de fecha del historial', () => {
  it('"Este mes" da el mes en curso completo', () => {
    vi.setSystemTime(new Date(2026, 8, 15)) // 15 de septiembre
    const a = ATAJOS_DE_FECHA.find((x) => x.id === 'este-mes')!
    expect(a.rango()).toEqual({ desde: '2026-09-01', hasta: '2026-09-30' })
  })

  it('"Mes pasado" retrocede uno', () => {
    vi.setSystemTime(new Date(2026, 8, 15))
    const a = ATAJOS_DE_FECHA.find((x) => x.id === 'mes-pasado')!
    expect(a.rango()).toEqual({ desde: '2026-08-01', hasta: '2026-08-31' })
  })

  it('en enero, "Mes pasado" es diciembre del año anterior', () => {
    /*
      El caso que rompe una resta hecha a mano. `new Date(2026, -1, 1)` retrocede
      solo al diciembre anterior, y por eso el helper no hace la cuenta él.
    */
    vi.setSystemTime(new Date(2026, 0, 10)) // 10 de enero de 2026
    const a = ATAJOS_DE_FECHA.find((x) => x.id === 'mes-pasado')!
    expect(a.rango()).toEqual({ desde: '2025-12-01', hasta: '2025-12-31' })
  })

  it('"Últimos 30 días" cuenta 30 contando hoy', () => {
    vi.setSystemTime(new Date(2026, 8, 30))
    const a = ATAJOS_DE_FECHA.find((x) => x.id === 'ultimos-30')!
    // del 1 al 30 de septiembre son 30 días, no 31
    expect(a.rango()).toEqual({ desde: '2026-09-01', hasta: '2026-09-30' })
  })

  it('cruza el cambio de mes sin perderse', () => {
    vi.setSystemTime(new Date(2026, 8, 5)) // 5 de septiembre
    const a = ATAJOS_DE_FECHA.find((x) => x.id === 'ultimos-30')!
    expect(a.rango().desde).toBe('2026-08-07')
  })
})

describe('el nombre del mes', () => {
  it('traduce lo que llega de la API', () => {
    expect(nombreDelMes('2026-09')).toBe('septiembre')
    expect(nombreDelMes('2026-01')).toBe('enero')
  })

  it('sin mes devuelve vacío, no "undefined"', () => {
    expect(nombreDelMes()).toBe('')
    expect(nombreDelMes('')).toBe('')
  })
})

describe('el árbol de categorías', () => {
  /*
    El catálogo llega en árbol: padres con hijos. Los selectores solo pueden
    ofrecer las HOJAS —no se anota un gasto en "Alimentación" a secas, sino en
    "Mercado"— así que hay que recorrerlo y quedarse con las puntas.
  */
  const catalogo = [
    {
      id: 'p1',
      name: 'Alimentación',
      children: [
        { id: 'h1', name: 'Mercado', children: [] },
        { id: 'h2', name: 'Restaurantes', children: [] },
      ],
    },
    { id: 'p2', name: 'Otros gastos', children: [] },
  ] as never

  it('devuelve las hojas, no los padres', () => {
    const hojas = hojasDeCategorias(catalogo)
    expect(hojas.map((h) => h.nombre)).toEqual(['Mercado', 'Restaurantes', 'Otros gastos'])
  })

  it('una categoría sin hijos es ella misma una opción', () => {
    const hojas = hojasDeCategorias(catalogo)
    expect(hojas.find((h) => h.nombre === 'Otros gastos')?.padre).toBeUndefined()
  })

  it('cada hoja recuerda de quién viene', () => {
    const hojas = hojasDeCategorias(catalogo)
    expect(hojas.find((h) => h.nombre === 'Mercado')?.padre).toBe('Alimentación')
  })

  it('la etiqueta junta padre e hijo', () => {
    expect(etiquetaDeCategoria({ id: 'x', nombre: 'Mercado', padre: 'Alimentación' })).toBe(
      'Alimentación · Mercado',
    )
  })

  it('sin padre, solo el nombre', () => {
    expect(etiquetaDeCategoria({ id: 'x', nombre: 'Otros gastos' })).toBe('Otros gastos')
  })
})

describe('las iniciales del avatar', () => {
  it('toma la primera letra de nombre y apellido', () => {
    expect(iniciales('Pablo Revilla')).toBe('PR')
  })

  it('con un solo nombre, una letra', () => {
    expect(iniciales('Pablo')).toBe('P')
  })

  it('sin nombre no deja el círculo vacío', () => {
    // Dos puntos ocupan el mismo sitio mientras carga la sesión.
    expect(iniciales()).toBe('··')
    expect(iniciales('   ')).toBe('··')
  })

  it('aguanta espacios de más entre nombres', () => {
    expect(iniciales('  María   Guerrero ')).toBe('MG')
  })
})

describe('los años del selector', () => {
  it('empieza en el actual y va hacia atrás', () => {
    vi.setSystemTime(new Date(2026, 5, 1))
    expect(ultimosAnios(3)).toEqual([2026, 2025, 2024])
  })
})
