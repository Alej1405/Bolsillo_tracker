/*
  Capa de datos. Hoy sirve muestras estáticas; mañana, respuestas del backend.

    tipos.ts    las formas, escritas como las devolverá la API
    muestra.ts  los valores de vitrina de la landing

  Los componentes importan de '@/datos', nunca de los archivos sueltos: cuando
  `muestra.ts` se reemplace por un cliente HTTP, no habrá que tocar ni un
  import en las pantallas.
*/
export { movimientos, bolsillos, saldos, pasos, canales, asuntos, videos } from '@/datos/muestra'
export type {
  Movimiento,
  ClaseMovimiento,
  Bolsillo,
  ClaseBolsillo,
  Saldo,
  Paso,
  Canal,
  ClaseCanal,
  Asunto,
} from '@/datos/tipos'
