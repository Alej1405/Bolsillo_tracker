import { Revelar } from '@/movimiento'
import { Boton } from '@/components/ui/Boton'
import { TarjetaBolsillo } from '@/components/piezas'

export function SeccionBolsillos() {
  return (
    <section id="bolsillos" className="seccion py-24">
      <div className="contenedor grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <Revelar>
          <h2 className="max-w-[440px] font-titulo text-portada font-bold leading-tight text-texto-principal">
            Tu plata, separada como la piensas
          </h2>
          <p className="mt-4 max-w-[460px] text-cuerpo-amplio text-texto-secundario">
            El efectivo del bolsillo no es lo mismo que el ahorro del banco. Bolsillo los mantiene
            aparte y te dice cuánto tienes disponible de verdad, sin mezclar lo que ya está
            comprometido.
          </p>
          <div className="mt-8">
            <Boton variante="secundario">Ver cómo funciona</Boton>
          </div>
        </Revelar>

        <Revelar retraso={0.08}>
          <div className="vidrio flex flex-col gap-3 rounded-maximo p-6">
            <TarjetaBolsillo clase="Efectivo" nombre="Mi efectivo" monto="420,00" />
            <TarjetaBolsillo clase="Banco" nombre="Cuenta del banco" monto="680,50" />
            <TarjetaBolsillo clase="Tarjeta" nombre="Tarjeta Visa" monto="− 120,00" negativo />
            <TarjetaBolsillo clase="Ahorro" nombre="Viaje a la playa" monto="268,00" />
          </div>
        </Revelar>
      </div>
    </section>
  )
}
