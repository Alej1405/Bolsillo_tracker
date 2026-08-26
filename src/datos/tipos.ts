/*
  Formas de los datos que la landing muestra. Están escritas pensando en la
  respuesta del backend, no en lo que le conviene al componente: cuando existan
  las APIs, esto se llena con `fetch` y los componentes no cambian.

  Regla del proyecto: el backend calcula, el frontend formatea. Por eso los
  totales, porcentajes y saldos llegan resueltos — aquí no se suma ni se
  promedia nada.
*/

export type ClaseMovimiento = 'gasto' | 'ingreso' | 'transferencia'

export type Movimiento = {
  id: string
  /** Letra del círculo. La manda el backend para no derivarla del nombre. */
  inicial: string
  nombre: string
  /** Segunda línea ya compuesta: bolsillo y fecha, p. ej. "Efectivo · Hoy". */
  detalle: string
  /** Monto ya formateado y con signo. El backend decide separadores y moneda. */
  monto: string
  clase: ClaseMovimiento
}

export type ClaseBolsillo = 'Efectivo' | 'Banco' | 'Tarjeta' | 'Ahorro'

export type Bolsillo = {
  id: string
  clase: ClaseBolsillo
  /** Nombre que le puso el usuario, p. ej. "Viaje a la playa". */
  nombre: string
  monto: string
  /** Saldo en contra: tarjetas de crédito y similares. */
  negativo?: boolean
}

export type Saldo = {
  etiqueta: string
  /** Número crudo: `CifraAnimada` lo cuenta al entrar en vista. */
  valor: number
  detalle: string
}

export type Paso = {
  titulo: string
  cuerpo: string
}
