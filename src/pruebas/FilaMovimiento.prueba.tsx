/**
 * La fila del historial.
 *
 * Es el componente que más veces se pinta en toda la aplicación, y el que
 * lleva las acciones destructivas. Las pruebas miran dos cosas: que lo que se
 * lee sea lo que llega, y que borrar se pueda distinguir SIN pasar el ratón,
 * porque con el dedo no hay `hover`.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FilaMovimiento } from '@/piezas/FilaMovimiento'

const base = {
  inicial: 'M',
  nombre: 'Mercado',
  detalle: 'Efectivo · Ayer',
  monto: '− $62,40',
  clase: 'gasto' as const,
}

describe('lo que se lee', () => {
  it('muestra nombre, detalle y monto tal como llegan', () => {
    render(<FilaMovimiento {...base} />)
    expect(screen.getByText('Mercado')).toBeVisible()
    expect(screen.getByText('Efectivo · Ayer')).toBeVisible()
    expect(screen.getByText('− $62,40')).toBeVisible()
  })

  it('sin acciones no pinta ningún botón', () => {
    /* El bloque del panel la usa así: es una lista de solo lectura. */
    render(<FilaMovimiento {...base} />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('las acciones', () => {
  it('el botón de borrar dice qué borra, no solo "borrar"', () => {
    /*
      Quien navega con lector de pantalla oye el nombre accesible fuera de
      contexto: "Borrar" a secas no dice cuál de las quince filas es.
    */
    render(<FilaMovimiento {...base} onBorrar={() => {}} />)
    expect(
      screen.getByRole('button', { name: 'Borrar el movimiento Mercado de − $62,40' }),
    ).toBeVisible()
  })

  it('el de corregir, igual', () => {
    render(<FilaMovimiento {...base} onEditar={() => {}} />)
    expect(
      screen.getByRole('button', { name: 'Corregir el movimiento Mercado de − $62,40' }),
    ).toBeVisible()
  })

  it('avisa a quien la usa cuando se pulsa borrar', async () => {
    const alBorrar = vi.fn()
    render(<FilaMovimiento {...base} onBorrar={alBorrar} />)
    await userEvent.click(screen.getByRole('button', { name: /Borrar/ }))
    expect(alBorrar).toHaveBeenCalledOnce()
  })

  it('la fila NO borra por su cuenta: solo avisa', () => {
    /*
      La confirmación es de quien la usa, no de la fila. Si la fila borrara,
      cada pantalla tendría que acordarse de confirmar por separado.
    */
    const alBorrar = vi.fn()
    render(<FilaMovimiento {...base} onBorrar={alBorrar} />)
    expect(alBorrar).not.toHaveBeenCalled()
  })

  it('borrar se distingue en reposo, sin pasar el ratón', () => {
    /*
      El fallo que encontró la auditoría: el rojo estaba solo en `hover`, que
      en un teléfono no existe. Se comprueba que la clase del estado normal
      —no la de hover— ya lleva el tono de peligro.
    */
    render(<FilaMovimiento {...base} onEditar={() => {}} onBorrar={() => {}} />)
    const borrar = screen.getByRole('button', { name: /Borrar/ })
    const corregir = screen.getByRole('button', { name: /Corregir/ })

    expect(borrar.className).toMatch(/(^|\s)bg-gasto-sutil/)
    expect(borrar.className).toMatch(/(^|\s)text-gasto/)
    expect(corregir.className).not.toMatch(/(^|\s)bg-gasto-sutil/)
  })

  it('el área táctil llega a 44 px', () => {
    /* `size-11` son 44px, el mínimo para tocar con el dedo sin fallar. */
    render(<FilaMovimiento {...base} onBorrar={() => {}} />)
    expect(screen.getByRole('button', { name: /Borrar/ }).className).toContain('size-11')
  })

  it('en móvil ofrece un solo botón de acciones, no dos', () => {
    /*
      Dos botones se comen 88 de los 390 px de ancho y el nombre acaba en
      "Merca…", que es justo el dato que distingue una fila de otra.
    */
    render(<FilaMovimiento {...base} onAcciones={() => {}} />)
    expect(screen.getByRole('button', { name: 'Acciones para Mercado de − $62,40' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /Borrar/ })).toBeNull()
  })
})

describe('el color del monto', () => {
  it.each([
    ['gasto', 'text-gasto'],
    ['ingreso', 'text-ingreso'],
    ['transferencia', 'text-texto-principal'],
  ])('un %s se pinta con %s', (clase, esperada) => {
    render(<FilaMovimiento {...base} clase={clase as never} />)
    expect(screen.getByText('− $62,40').className).toContain(esperada)
  })
})
