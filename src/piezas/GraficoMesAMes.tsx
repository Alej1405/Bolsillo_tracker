import { BarraVertical } from '@/movimiento'

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Un mes de la serie: lo que entró y lo que salió, ya calculados. */
export type MesDelAnio = { entro: number; salio: number }

const ALTO_MAXIMO = 80

// Datos de vitrina de la landing, en pares [entró, salió]. El panel le pasa
// los del usuario por props.
const MUESTRA: Array<[number, number]> = [
  [40, 30],
  [55, 44],
  [48, 60],
  [62, 38],
  [50, 52],
  [70, 40],
  [0, 0],
  [66, 58],
  [72, 62],
  [0, 0],
  [0, 0],
  [0, 0],
]

// Escalonado propio, más corto que el general: son 24 barras y con el valor
// por defecto la última entraría casi un segundo después de la primera.
const escalonadoBarra = 0.04

/**
 * Los doce meses del año, con un par de barras (entró / salió) por mes.
 *
 * Las alturas son proporción de dibujo sobre el mes de mayor movimiento, no un
 * cálculo sobre el dato: los montos llegan resueltos del backend.
 */
export function GraficoMesAMes({
  meses: datos,
  animar = true,
}: {
  /** Doce entradas, de enero a diciembre. Sin esto usa los de vitrina. */
  meses?: MesDelAnio[]
  animar?: boolean
} = {}) {
  const barras: Array<[number, number]> = datos
    ? (() => {
        const mayor = Math.max(...datos.flatMap((m) => [m.entro, m.salio]), 1)
        const alto = (v: number) => (v <= 0 ? 0 : Math.max(Math.round((v / mayor) * ALTO_MAXIMO), 3))
        return datos.map((m) => [alto(m.entro), alto(m.salio)] as [number, number])
      })()
    : MUESTRA
  return (
    <div className="rounded-extra bg-fondo-superficie p-6">
      <p className="text-rotulo font-semibold text-texto-principal">Mes a mes</p>
      <p className="text-nota text-texto-tenue">Los doce meses del año. Los meses sin datos se muestran en cero</p>
      <div className="mt-4 flex items-center gap-4 text-leyenda text-texto-secundario">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-ingreso" /> Entró
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-gasto" /> Salió
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 100 }}>
        {meses.map((m, i) => (
          <div key={m} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex items-end gap-[3px]" style={{ height: 80 }}>
              <BarraVertical
                animar={animar}
                alto={barras[i]?.[0] ?? 0}
                clase="bg-ingreso"
                ancho="w-[5px]"
                retraso={i * escalonadoBarra}
              />
              <BarraVertical
                animar={animar}
                alto={barras[i]?.[1] ?? 0}
                clase="bg-gasto"
                ancho="w-[5px]"
                retraso={i * escalonadoBarra + 0.02}
              />
            </div>
            <span className="text-diminuto text-texto-tenue">{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
