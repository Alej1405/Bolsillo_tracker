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
import { listarCuentas } from '@/services/CuentasService'

const cargarBolsillos = vi.fn()
const abrirCrearBolsillo = vi.fn()
const cerrarSesion = vi.fn()

vi.mock('@/helpers', async () => {
  const real = await vi.importActual<typeof import('@/helpers')>('@/helpers')
  return { ...real, useCerrarSesion: () => cerrarSesion }
})

/* Zustand se consume con selectores, así que se sustituye el hook entero. */
function montarCon(estado: Record<string, unknown>, enServidor = 0) {
  vi.mocked(listarCuentas).mockResolvedValue({ items: Array(enServidor).fill({}) } as never)
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

/*
  El componente consulta cuántos bolsillos hay EN TOTAL, archivados incluidos.
  Se dobla el servicio para poder poner cada escenario.
*/
vi.mock('@/services/CuentasService', () => ({ listarCuentas: vi.fn() }))

afterEach(() => vi.clearAllMocks())

describe('cuándo aparece', () => {
  it('aparece si no tiene ningún bolsillo', async () => {
    montarCon({}, 0)
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Empieza por tu primer bolsillo')).toBeVisible()
  })

  it('NO aparece si su único bolsillo está ARCHIVADO', async () => {
    /*
      El bug que dejó la aplicación inservible para una persona real.

      La lista del store viene sin archivados, así que quien archivó su único
      bolsillo tenía cero ahí y se le abría la bienvenida encima —con sus
      movimientos ya registrados y sin poder cerrarla, porque este diálogo no
      tiene salida—. Archivar no es empezar de cero.
    */
    montarCon({ bolsillos: [] }, 1) // cero sin archivar, uno en total
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece mientras el servidor no ha contestado', () => {
    /* Sin esto parpadearía un instante a todo el mundo. */
    vi.mocked(listarCuentas).mockReturnValue(new Promise(() => {}) as never)
    montarCon({}, 0)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece antes de saber si tiene bolsillos', () => {
    /*
      La distinción que hace falta el flag `bolsillosPedidos`: al arrancar, la
      lista también está vacía. Sin esto, la bienvenida parpadearía un instante
      para TODO el mundo, tenga bolsillos o no.
    */
    vi.mocked(listarCuentas).mockReturnValue(new Promise(() => {}) as never)
    montarCon({}, 0)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece si ya tiene alguno', async () => {
    montarCon({ bolsillos: [{ id: 'b1', name: 'Efectivo' }] }, 1)
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO le aparece al super admin', async () => {
    /* Un administrador no lleva sus finanzas aquí: no tiene por qué crear uno. */
    montarCon({ usuario: { id: '9', role: 'super_admin', full_name: 'Jefa', email: 'j@e.com' } }, 0)
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('se aparta mientras el formulario de crear está abierto', async () => {
    /* Dos diálogos encadenados taparían el que importa. */
    montarCon({ crearAbierto: true }, 0)
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('no tiene salidas escondidas', () => {
  it('no hay botón de cerrar', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull()
  })

  it('Escape no lo cierra', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeVisible()
  })

  it('las dos únicas salidas son crear o salir', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    const botones = screen.getAllByRole('button').map((b) => b.textContent?.trim())
    expect(botones).toEqual(['Crear mi primer bolsillo', 'Hacerlo en otro momento y salir'])
  })
})

describe('qué hacen los botones', () => {
  it('el principal abre el formulario de crear', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Crear mi primer bolsillo' }))
    expect(abrirCrearBolsillo).toHaveBeenCalledOnce()
  })

  it('el otro cierra la sesión, que es lo que su texto anuncia', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: /Hacerlo en otro momento/ }))
    expect(cerrarSesion).toHaveBeenCalledOnce()
  })
})

describe('lo que explica', () => {
  it('define qué es un bolsillo, no solo pide crear uno', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    expect(screen.getByText(/cada sitio donde tienes plata/i)).toBeVisible()
  })

  it('da ejemplos concretos en vez de una definición abstracta', async () => {
    montarCon({})
    await screen.findByRole('dialog')
    for (const ej of ['Tu banco', 'Efectivo', 'Ahorro']) {
      expect(screen.getByText(ej)).toBeVisible()
    }
  })

  it('dice POR QUÉ importa separarlos', async () => {
    montarCon({})
    await screen.findByRole('dialog')
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
