import type { Hilo } from '@/types'

/*
  Cómo se lee una conversación de soporte, sin dibujar nada.

  Separado del componente por lo mismo que `piezas/medida`: la etiqueta de
  estado y la fecha hacen falta en sitios donde no cabe la conversación entera
  —una fila de la bandeja, un aviso— y así se importan sin arrastrar el JSX.
*/

/** "2026-08-31T14:22:00Z" → "31 ago, 14:22". */
export function cuando(iso: string): string {
  return new Date(iso).toLocaleString('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/*
  El estado de una conversación, vestido.

  Los tres colores dicen quién tiene la pelota: ámbar si esperamos nosotros,
  verde si ya se contestó, gris si terminó. Va en una tabla y no en condiciones
  sueltas para que las dos pantallas de soporte no se contradigan.
*/
export const ESTADOS: Record<Hilo['status'], { texto: string; clases: string }> = {
  abierto: { texto: 'Esperando respuesta', clases: 'bg-aviso-sutil text-aviso' },
  respondido: { texto: 'Respondida', clases: 'bg-ingreso-sutil text-ingreso' },
  cerrado: { texto: 'Cerrada', clases: 'bg-fondo-sutil text-texto-tenue' },
}
