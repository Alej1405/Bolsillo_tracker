import { BarraVertical, CifraAnimada } from '@/movimiento'

// Datos de muestra de la landing. En el dash vendrán calculados del backend.
const entro = 820
const salio = 566

/** Comparación de dos barras: lo que entró contra lo que salió en el mes. */
export function GraficoEntroSalio() {
  return (
    <div className="rounded-[var(--radius-extra)] bg-fondo-superficie p-6">
      <p className="text-[20px] font-semibold text-texto-principal">Entró y salió</p>
      <p className="text-[13px] text-texto-tenue">Este mes</p>
      <div className="mt-6 flex items-end justify-center gap-10" style={{ height: 180 }}>
        <div className="flex flex-col items-center gap-2">
          <CifraAnimada valor={entro} className="text-[13px] font-semibold text-ingreso tabular-nums" />
          <BarraVertical alto={150} clase="bg-ingreso" />
          <span className="text-[12px] text-texto-tenue">Entró</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CifraAnimada valor={salio} className="text-[13px] font-semibold text-gasto tabular-nums" />
          <BarraVertical alto={104} clase="bg-gasto" retraso={0.1} />
          <span className="text-[12px] text-texto-tenue">Salió</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-[var(--radius-medio)] bg-ingreso-sutil px-4 py-2.5">
        <span className="text-[13px] text-texto-secundario">Te sobró</span>
        <CifraAnimada
          valor={entro - salio}
          prefijo="+ "
          className="text-[15px] font-semibold text-ingreso tabular-nums"
        />
      </div>
    </div>
  )
}
