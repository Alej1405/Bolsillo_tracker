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
      className={`flex flex-col justify-between rounded-extra p-6 ${
        esMarca ? 'bg-lavanda-700/70' : 'bg-fondo-superficie'
      }`}
    >
      <p
        className={`text-micro font-semibold uppercase tracking-[0.08em] ${
          esMarca ? 'text-texto-sobre-marca/80' : 'text-texto-tenue'
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
      <p className={`mt-2 text-nota ${esMarca ? 'text-texto-sobre-marca/80' : 'text-texto-tenue'}`}>
        {detalle}
      </p>
    </div>
  )
}
