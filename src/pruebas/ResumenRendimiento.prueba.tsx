/**
 * El resumen del mes.
 *
 * Interrumpe para contar cómo fue el mes, así que lo que más importa probar es
 * cuándo NO debe interrumpir: un diálogo que aparece para decir "no tienes
 * nada" enseña a cerrarlo sin leer, y entonces tampoco se lee el que sí
 * importa.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ResumenRendimiento } from '@/piezas/ResumenRendimiento'
import { useAppStore } from '@/stores/useAppStore'

vi.mock('@/stores/useAppStore', () => ({ useAppStore: vi.fn() }))

/* En escritorio se ven las seis medidas; en el teléfono, dos. */
let pantalla: 'celular' | 'escritorio' = 'escritorio'
vi.mock('@/pantalla', () => ({ useTipoPantalla: () => pantalla }))

const medida = (key: string, value: string | number, unit = 'USD', level = 'bien') => ({
  key,
  label: key,
  value,
  unit,
  reading: `lectura de ${key}`,
  level,
})

/* Un mes con movimiento de verdad. */
const conDatos = {
  period: { from: '2026-09-01', to: '2026-09-30' },
  saved_in_period: '659.60',
  net_worth: '659.60',
  metrics: [
    medida('cuanto_tengo', '659.60'),
    medida('cuanto_guarde', '659.60'),
    medida('de_cada_cien', 67.3, '%'),
    medida('cuanto_aguanta', 2.1, 'meses', 'atencion'),
    medida('gasto_diario', '10.68'),
    medida('comparado_con_antes', '659.60'),
  ],
}

/* Un mes recién empezado: lo acumulado sigue dando cifras, el periodo no. */
const mesVacio = {
  period: { from: '2026-09-01', to: '2026-09-30' },
  saved_in_period: '0',
  net_worth: '3152.85',
  metrics: [
    medida('cuanto_tengo', '3152.85'),
    medida('cuanto_guarde', '0'),
    medida('de_cada_cien', 0, '%'),
    medida('cuanto_aguanta', 6, 'meses'),
    medida('gasto_diario', '0.00'),
    medida('comparado_con_antes', '-1902.85'),
  ],
}

function montarCon(estado: Record<string, unknown>) {
  const base = {
    usuario: { id: '1', role: 'client', full_name: 'Quien Sea', email: 'q@e.com' },
    rendimiento: conDatos,
    cargandoRendimiento: false,
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
  return render(<ResumenRendimiento />)
}

beforeEach(() => {
  pantalla = 'escritorio'
  localStorage.clear()
  /* Se congela el reloj: el resumen solo sale para el mes en curso. */
  vi.setSystemTime(new Date('2026-09-15T12:00:00'))
})
afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('cuándo interrumpe', () => {
  it('con movimientos del mes, aparece', () => {
    montarCon({})
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('NO aparece si el mes todavía no tiene movimientos', () => {
    /*
      El fallo que se corrigió al probarlo: "cuánto tienes" y "cuánto te dura"
      siguen dando cifras el día 1 porque hablan de lo acumulado, y el resumen
      salía a anunciar "$0,00, todavía no hay movimientos". Interrumpía para no
      contar nada.
    */
    montarCon({ rendimiento: mesVacio })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece mientras se está cargando', () => {
    montarCon({ cargandoRendimiento: true })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece si el periodo no es el mes en curso', () => {
    /*
      La pantalla de Rendimiento deja elegir el mes y escribe en el mismo sitio
      del store. Sin esta condición, mirar mayo desde ahí abriría el resumen de
      mayo encima: un diálogo que aparece por usar un filtro es un diálogo roto.
    */
    montarCon({ rendimiento: { ...conDatos, period: { from: '2026-05-01', to: '2026-05-31' } } })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO aparece al super admin', () => {
    montarCon({ usuario: { id: '9', role: 'super_admin', full_name: 'Jefa', email: 'j@e.com' } })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('NO vuelve si ya se vio este periodo', () => {
    localStorage.setItem('bolsillo_resumen_visto', '2026-09-01_2026-09-30')
    montarCon({})
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('sí vuelve cuando cambia el mes: hay cifras nuevas', () => {
    localStorage.setItem('bolsillo_resumen_visto', '2026-08-01_2026-08-31')
    montarCon({})
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('qué muestra según la pantalla', () => {
  it('en escritorio, las seis medidas', () => {
    montarCon({})
    for (const k of ['cuanto_tengo', 'cuanto_guarde', 'de_cada_cien', 'gasto_diario']) {
      expect(screen.getByText(`lectura de ${k}`)).toBeInTheDocument()
    }
  })

  it('en el teléfono, solo cuánto guardó y cuánto le dura', () => {
    /* Se lee de pie y en treinta segundos: la tercera cifra ya no se lee. */
    pantalla = 'celular'
    montarCon({})
    expect(screen.getByText('lectura de cuanto_guarde')).toBeInTheDocument()
    expect(screen.getByText('lectura de cuanto_aguanta')).toBeInTheDocument()
    expect(screen.queryByText('lectura de gasto_diario')).toBeNull()
  })

  it('las frases vienen del backend, no se escriben aquí', () => {
    /*
      Si el número y su explicación se escribieran en sitios distintos, tarde o
      temprano dirían cosas diferentes.
    */
    montarCon({})
    expect(screen.getByText('lectura de cuanto_tengo')).toBeInTheDocument()
  })
})

describe('cerrar', () => {
  it('"Entendido" lo cierra y lo recuerda', async () => {
    montarCon({})
    await userEvent.click(screen.getByRole('button', { name: 'Entendido' }))
    expect(localStorage.getItem('bolsillo_resumen_visto')).toBe('2026-09-01_2026-09-30')
  })

  it('dice dónde volver a verlo', () => {
    montarCon({})
    expect(screen.getByText(/volver a verlo cuando quieras en Rendimiento/i)).toBeInTheDocument()
  })
})
