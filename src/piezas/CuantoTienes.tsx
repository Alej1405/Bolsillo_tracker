import { CifraAnimada } from '@/movimiento'

/** Tarjeta de saldo: una etiqueta, una cifra grande que cuenta y un detalle. */
export function CuantoTienes({
  tono,
  etiqueta,
  valor,
  prefijo = '$ ',
  detalle,
  animar = true,
}: {
  /** `marca` va sobre el azul-pizarra; `superficie`, sobre blanco con borde. */
  tono: 'marca' | 'superficie'
  etiqueta: string
  valor: number
  prefijo?: string
  detalle: string
  /** El panel la pinta sin contar: ver `CifraAnimada`. */
  animar?: boolean
}) {
  const esMarca = tono === 'marca'
  return (
    <div
      /*
        `/95` y no `/70`: con el 70% el morado quedaba en #9e8aab, y sobre él
        ni el blanco puro pasaba de 3,1:1 —por debajo del 4,5 que pide un texto
        de 11 px—. Medido en 17 vistas, era el fallo de contraste más repetido
        del producto. A 95 el color es el mismo, apenas más asentado, y sube a
        4,8:1.
      */
      className={`flex flex-col justify-between rounded-extra p-6 ${
        esMarca ? 'bg-lavanda-700/95' : 'bg-fondo-superficie'
      }`}
    >
      <p
        className={`text-micro font-semibold uppercase tracking-[0.08em] ${
          esMarca ? 'text-texto-sobre-marca' : 'text-texto-tenue'
        }`}
      >
        {etiqueta}
      </p>
      <CifraAnimada animar={animar}
        valor={valor}
        prefijo={prefijo}
        className={`mt-2 text-cifra font-bold leading-none tabular-nums ${
          esMarca ? 'text-texto-sobre-marca' : 'text-texto-principal'
        }`}
      />
      {/*
        Sin `/80`: la jerarquía ya la marca el tamaño —11 y 13 px frente a los
        44 de la cifra—, y rebajar además la opacidad restaba lo único que
        mantenía legible el texto pequeño sobre un fondo de color.
      */}
      <p className={`mt-2 text-nota ${esMarca ? 'text-texto-sobre-marca' : 'text-texto-tenue'}`}>
        {detalle}
      </p>
    </div>
  )
}
