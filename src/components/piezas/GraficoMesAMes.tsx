import { BarraVertical } from '@/movimiento'

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Alturas de muestra en px, pares [entró, salió]. Los meses sin datos van en cero.
const barras: Array<[number, number]> = [
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

/** Los doce meses del año, con un par de barras (entró / salió) por mes. */
export function GraficoMesAMes() {
  return (
    <div className="rounded-[var(--radius-extra)] bg-fondo-superficie p-6">
      <p className="text-[20px] font-semibold text-texto-principal">Mes a mes</p>
      <p className="text-[13px] text-texto-tenue">Los doce meses del año. Los meses sin datos se muestran en cero</p>
      <div className="mt-4 flex items-center gap-4 text-[12px] text-texto-secundario">
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
                alto={barras[i][0]}
                clase="bg-ingreso"
                ancho="w-[5px]"
                retraso={i * escalonadoBarra}
              />
              <BarraVertical
                alto={barras[i][1]}
                clase="bg-gasto"
                ancho="w-[5px]"
                retraso={i * escalonadoBarra + 0.02}
              />
            </div>
            <span className="text-[10px] text-texto-tenue">{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
