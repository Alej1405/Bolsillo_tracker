/**
 * La bienvenida de quien no tiene ningún bolsillo.
 *
 * Es un diálogo del que no se sale, así que las pruebas verifican justo eso:
 * que aparece cuando debe, que NO aparece cuando no debe —un falso positivo
 * aquí bloquea la aplicación entera— y que no tiene salidas escondidas.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PrimerBolsillo } from '@/piezas/PrimerBolsillo'
import { useAppStore } from '@/stores/useAppStore'

const cargarBolsillos = vi.fn()
const abrirCrearBolsillo = vi.fn()
const cerrarSesion = vi.fn()

vi.mock('@/helpers', async () => {
  const real = await vi.importActual<typeof import('@/helpers')>('@/helpers')
  return { ...real, useCerrarSesion: () => cerrarSesion }
})

/* Zustand se consume con selectores, así que se sustituye el hook entero. */
function montarCon(estado: Record<string, unknown>) {
  const base = {
    usuario: { id: '1', role: 'client', full_name: 'Quien Sea', email: 'q@e.com' },
    bolsillos: [],
    bolsillosPedidos: true,
    crearAbierto: false,
    cargarBolsillos,
    abrirCrearBolsillo,
    ...estado,
  }
  /*
    El store se consume con selectores —`useAppStore((e) => e.usuario)`—, así
    que el doble tiene que aceptar la función y aplicarla sobre el estado de
    mentira. El `as never` es para TypeScript: la firma real del hook de
    Zustand tiene más sobrecargas de las que hace falta imitar aquí.
  */
  vi.mocked(useAppStore).mockImplementation(((selector: (e: unknown) => unknown) =>
    typeof selector === 'function' ? selector(base) : base) as never)
  return render(<PrimerBolsillo />)
}

vi.mock('@/stores/useAppStore', () => ({ useAppStore: vi.fn() }))

afterEach(() => vi.clearAllMocks())

describe('cuándo aparece', () => {
  it('aparece si la lista ya se pidió y está vacía', () => {
    montarCon({})
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Empieza por tu primer bolsillo')).toBeVisible()
  })

  it('NO aparece antes de saber si tiene bolsillos', () => {
    /*
      La distinción que hace falta el flag `bolsillosPedidos`: al arrancar, la
      lista también está vacía. Sin esto, la bienvenida parpadearía un instante
      para TODO el mundo, tenga bolsillos o no.
    */
    montarCon({ bolsillosPedidos: false })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece si ya tiene alguno', () => {
    montarCon({ bolsillos: [{ id: 'b1', name: 'Efectivo' }] })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO le aparece al super admin', () => {
    /* Un administrador no lleva sus finanzas aquí: no tiene por qué crear uno. */
    montarCon({ usuario: { id: '9', role: 'super_admin', full_name: 'Jefa', email: 'j@e.com' } })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('se aparta mientras el formulario de crear está abierto', () => {
    /* Dos diálogos encadenados taparían el que importa. */
    montarCon({ crearAbierto: true })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('no tiene salidas escondidas', () => {
  it('no hay botón de cerrar', () => {
    montarCon({})
    expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull()
  })

  it('Escape no lo cierra', async () => {
    montarCon({})
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeVisible()
  })

  it('las dos únicas salidas son crear o salir', () => {
    montarCon({})
    const botones = screen.getAllByRole('button').map((b) => b.textContent?.trim())
    expect(botones).toEqual(['Crear mi primer bolsillo', 'Hacerlo en otro momento y salir'])
  })
})

describe('qué hacen los botones', () => {
  it('el principal abre el formulario de crear', async () => {
    montarCon({})
    await userEvent.click(screen.getByRole('button', { name: 'Crear mi primer bolsillo' }))
    expect(abrirCrearBolsillo).toHaveBeenCalledOnce()
  })

  it('el otro cierra la sesión, que es lo que su texto anuncia', async () => {
    montarCon({})
    await userEvent.click(screen.getByRole('button', { name: /Hacerlo en otro momento/ }))
    expect(cerrarSesion).toHaveBeenCalledOnce()
  })
})

describe('lo que explica', () => {
  it('define qué es un bolsillo, no solo pide crear uno', () => {
    montarCon({})
    expect(screen.getByText(/cada sitio donde tienes plata/i)).toBeVisible()
  })

  it('da ejemplos concretos en vez de una definición abstracta', () => {
    montarCon({})
    for (const ej of ['Tu banco', 'Efectivo', 'Ahorro']) {
      expect(screen.getByText(ej)).toBeVisible()
    }
  })

  it('dice POR QUÉ importa separarlos', () => {
    montarCon({})
    /*
      El texto está partido por un <strong>, así que `getByText` con una
      cadena no lo encuentra: hay que mirar el texto ya compuesto del párrafo.
    */
    expect(
      screen.getByText((_, el) => /cuánto te queda en cada sitio/i.test(el?.textContent ?? ''), {
        selector: 'p',
      }),
    ).toBeVisible()
  })
})
