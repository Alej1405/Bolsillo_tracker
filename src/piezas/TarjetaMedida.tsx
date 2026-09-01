import { SEMAFORO, valorDe } from '@/piezas/medida'
import type { Medida } from '@/types'

/**
 * Una medida en tarjeta: el número grande y debajo la frase que lo explica.
 *
 * La frase viene escrita del backend y no se recorta ni se resume: es la parte
 * que hace entendible el número para quien no sabe qué es una tasa de ahorro, y
 * es el motivo de que la medida exista.
 *
 * El color y el formato salen de `piezas/medida`, que es donde vive esa
 * traducción para poder usarla sin la tarjeta.
 */
export function TarjetaMedida({ medida }: { medida: Medida }) {
  const { texto, fondo, Icono } = SEMAFORO[medida.level]

  return (
    <article className="flex flex-col gap-3 rounded-extra bg-fondo-superficie p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">{medida.label}</p>
        <span className={`grid size-7 shrink-0 place-items-center rounded-full ${fondo} ${texto}`}>
          <Icono size={16} weight="fill" aria-hidden />
        </span>
      </div>

      <p className={`font-cuerpo text-titulo-menor font-bold tabular-nums ${texto}`}>
        {valorDe(medida)}
      </p>

      <p className="text-nota leading-relaxed text-texto-secundario">{medida.reading}</p>
    </article>
  )
}
