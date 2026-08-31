import { BarraVertical, CifraAnimada } from '@/movimiento'

/*
  Comparación de dos barras: lo que entró contra lo que salió en el mes.

  Los tres valores llegan calculados. `neto` no se deriva restando: el backend
  lo manda resuelto y puede aplicar reglas que aquí no se conocen.

  Los defaults son los datos de vitrina de la landing, que la usa sin props.
  El panel le pasa los del usuario.
*/
const ALTO_MAXIMO = 150

export function GraficoEntroSalio({
  entro = 820,
  salio = 566,
  neto = 254,
  animar = true,
}: {
  entro?: number
  salio?: number
  neto?: number
  /** El panel las pinta sin contar. */
  animar?: boolean
}) {
  // Altura relativa a la barra mayor. Es proporción de dibujo, no un cálculo
  // sobre el dato: los montos se muestran tal como llegan.
  const mayor = Math.max(entro, salio, 1)
  const alto = (v: number) => Math.max(Math.round((v / mayor) * ALTO_MAXIMO), 4)

  return (
    <div className="rounded-extra bg-fondo-superficie p-6">
      <p className="text-rotulo font-semibold text-texto-principal">Entró y salió</p>
      <p className="text-nota text-texto-tenue">Este mes</p>
      <div className="mt-6 flex items-end justify-center gap-10" style={{ height: 180 }}>
        <div className="flex flex-col items-center gap-2">
          <CifraAnimada animar={animar} valor={entro} className="text-nota font-semibold text-ingreso tabular-nums" />
          <BarraVertical animar={animar} alto={alto(entro)} clase="bg-ingreso" />
          <span className="text-leyenda text-texto-tenue">Entró</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CifraAnimada animar={animar} valor={salio} className="text-nota font-semibold text-gasto tabular-nums" />
          <BarraVertical animar={animar} alto={alto(salio)} clase="bg-gasto" retraso={0.1} />
          <span className="text-leyenda text-texto-tenue">Salió</span>
        </div>
      </div>
      <div
        className={`mt-4 flex items-center justify-between rounded-medio px-4 py-2.5 ${
          neto < 0 ? 'bg-gasto-sutil' : 'bg-ingreso-sutil'
        }`}
      >
        <span className="text-nota text-texto-secundario">
          {neto < 0 ? 'Te faltó' : 'Te sobró'}
        </span>
        <CifraAnimada animar={animar}
          valor={Math.abs(neto)}
          prefijo={neto < 0 ? '− ' : '+ '}
          className={`text-cuerpo font-semibold tabular-nums ${
            neto < 0 ? 'text-gasto' : 'text-ingreso'
          }`}
        />
      </div>
    </div>
  )
}
