import type { Bolsillo, Movimiento, Paso, Saldo } from '@/datos/tipos'

/*
  Datos de muestra de la landing. Son los mismos que ya se veían repartidos por
  las secciones de escritorio; aquí están juntos para que se cambien en un solo
  lugar y para que, cuando entren las APIs, este archivo sea lo único que se
  reemplaza por llamadas reales.

  No son datos de un usuario: son la vitrina del producto.
*/

export const movimientos: Movimiento[] = [
  {
    id: 'mov-1',
    inicial: 'C',
    nombre: 'Comida',
    detalle: 'Efectivo · Hoy',
    monto: '− $12,75',
    clase: 'gasto',
  },
  {
    id: 'mov-2',
    inicial: 'S',
    nombre: 'Sueldo',
    detalle: 'Banco · 1 sep',
    monto: '+ $820,00',
    clase: 'ingreso',
  },
  {
    id: 'mov-3',
    inicial: 'T',
    nombre: 'Transporte',
    detalle: 'Efectivo · Ayer',
    monto: '− $3,50',
    clase: 'gasto',
  },
]

export const bolsillos: Bolsillo[] = [
  { id: 'bol-1', clase: 'Efectivo', nombre: 'Mi efectivo', monto: '420,00' },
  { id: 'bol-2', clase: 'Banco', nombre: 'Cuenta del banco', monto: '680,50' },
  { id: 'bol-3', clase: 'Tarjeta', nombre: 'Tarjeta Visa', monto: '− 120,00', negativo: true },
  { id: 'bol-4', clase: 'Ahorro', nombre: 'Viaje a la playa', monto: '268,00' },
]

export const saldos: Record<'todo' | 'disponible', Saldo> = {
  todo: { etiqueta: 'Todo tu dinero', valor: 1248.5, detalle: 'en 3 bolsillos' },
  disponible: {
    etiqueta: 'Disponible este mes',
    valor: 486.3,
    detalle: 'después de lo comprometido',
  },
}

export const pasos: Paso[] = [
  {
    titulo: 'Crea tus bolsillos',
    cuerpo:
      'Efectivo, banco, tarjeta y ahorro. Pones el saldo con el que arrancas y ya está listo para usarse.',
  },
  {
    titulo: 'Registra lo que pasa',
    cuerpo:
      'Cada gasto o ingreso entra con su categoría y su bolsillo. No hay formularios largos ni campos obligatorios de más.',
  },
  {
    titulo: 'Lee tus reportes',
    cuerpo:
      'La aplicación arma el reparto por categoría, el mes a mes y lo que te queda disponible. Tú solo lees.',
  },
]
