import { Revelar } from '@/movimiento'
import {
  GraficoEntroSalio,
  GraficoReparto,
  GraficoMesAMes,
  CuantoTienes,
  FilaMovimiento,
} from '@/components/piezas'

export function SeccionQueHace() {
  return (
    <section id="que-hace" className="seccion py-24">
      <div className="contenedor flex flex-col items-center gap-10">
        <Revelar className="text-center">
          <h2 className="font-titulo text-portada font-bold text-texto-principal">
            Las cuentas ya salen hechas
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-cuerpo-amplio text-texto-secundario">
            Tú registras. Bolsillo suma, reparte y compara. Cada número que ves aquí lo calcula la
            aplicación, no tú.
          </p>
        </Revelar>

        <Revelar retraso={0.1} className="w-full">
          <div className="vidrio flex flex-col gap-6 rounded-maximo p-8">
            {/* Fila superior: dos gráficos + saldos */}
            <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr_1fr]">
              <GraficoEntroSalio />
              <GraficoReparto />
              <div className="flex flex-col gap-5">
                <CuantoTienes
                  tono="marca"
                  etiqueta="Todo tu dinero"
                  valor={1248.5}
                  detalle="en 3 bolsillos"
                />
                <CuantoTienes
                  tono="superficie"
                  etiqueta="Disponible este mes"
                  valor={486.3}
                  detalle="después de lo comprometido"
                />
              </div>
            </div>

            {/* Fila inferior: mes a mes + últimos movimientos */}
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <GraficoMesAMes />
              <div className="flex flex-col gap-2">
                <FilaMovimiento
                  inicial="C"
                  nombre="Comida"
                  detalle="Efectivo · Hoy"
                  monto="− 12,75"
                  clase="gasto"
                />
                <FilaMovimiento
                  inicial="S"
                  nombre="Sueldo"
                  detalle="Banco · 1 sep"
                  monto="+ 820,00"
                  clase="ingreso"
                />
                <FilaMovimiento
                  inicial="P"
                  nombre="Pasaste plata"
                  detalle="Efectivo → Ahorro"
                  monto="100,00"
                  clase="transferencia"
                />
              </div>
            </div>
          </div>
        </Revelar>
      </div>
    </section>
  )
}
