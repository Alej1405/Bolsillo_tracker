import { Pantalla } from '@/celular/Pantalla'
import { CuantoTienes, GraficoReparto, TarjetaBolsillo } from '@/components/piezas'
import { bolsillos, saldos } from '@/datos'

/**
 * Lo que la aplicación calcula sola. En escritorio esto son dos secciones
 * ("Las cuentas ya salen hechas" y "Tu plata, separada como la piensas");
 * en el celular van juntas porque responden a la misma pregunta.
 *
 * De los tres gráficos de escritorio aquí entra solo el reparto: los otros dos
 * piden un ancho que un teléfono no tiene, y apilarlos convierte la pantalla
 * en un desfile de tarjetas.
 */
export function QueHace() {
  return (
    <Pantalla
      titulo="Las cuentas ya salen hechas"
      entradilla="Tú registras. Bolsillo suma, reparte y compara. Cada número de aquí lo calcula la aplicación, no tú."
    >
      <div className="flex flex-col gap-5">
        {/* Apiladas, no en dos columnas: la cifra de `CuantoTienes` es de 44px
            y a media columna de un teléfono se corta a media cifra. */}
        <div className="flex flex-col gap-3">
          <CuantoTienes
            tono="marca"
            etiqueta={saldos.todo.etiqueta}
            valor={saldos.todo.valor}
            detalle={saldos.todo.detalle}
          />
          <CuantoTienes
            tono="superficie"
            etiqueta={saldos.disponible.etiqueta}
            valor={saldos.disponible.valor}
            detalle={saldos.disponible.detalle}
          />
        </div>

        <GraficoReparto />

        <div>
          <h2 className="font-titulo text-rotulo font-bold text-texto-principal">
            Tu plata, separada como la piensas
          </h2>
          <p className="mt-2 text-cuerpo leading-relaxed text-texto-secundario">
            El efectivo del bolsillo no es lo mismo que el ahorro del banco. Bolsillo los mantiene
            aparte y te dice cuánto tienes disponible de verdad.
          </p>

          <div className="vidrio mt-5 flex flex-col gap-2.5 rounded-[var(--radius-extra)] p-3">
            {bolsillos.map((b) => (
              <TarjetaBolsillo
                key={b.id}
                clase={b.clase}
                nombre={b.nombre}
                monto={b.monto}
                negativo={b.negativo}
              />
            ))}
          </div>
        </div>
      </div>
    </Pantalla>
  )
}
