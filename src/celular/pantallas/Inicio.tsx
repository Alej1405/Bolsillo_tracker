import { motion } from 'motion/react'
import logo from '@/assets/logo.png'
import { Boton } from '@/components/ui/Boton'
import { FilaMovimiento } from '@/components/piezas'
import { movimientos } from '@/datos'
import { useAparicion } from '@/movimiento'

/**
 * Primera pantalla del celular. No usa el envoltorio `Pantalla` porque es la
 * única que lleva marca y un titular de portada en vez de un título de sección.
 */
export function Inicio() {
  const aparece = useAparicion()

  return (
    <main className="min-h-screen px-5 pt-10 pb-[calc(58px+env(safe-area-inset-bottom)+2.5rem)]">
      <motion.div {...aparece(0.04)} className="flex items-center gap-1">
        <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
        <span className="font-titulo text-[22px] font-bold tracking-[0.045em] text-marca-800">
          olsillo
        </span>
      </motion.div>

      <motion.h1
        {...aparece(0.12)}
        className="mt-9 font-titulo text-despliegue leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-texto-principal"
      >
        Sabes exactamente a dónde se fue tu mes
      </motion.h1>

      <motion.p
        {...aparece(0.2)}
        className="mt-5 text-cuerpo leading-relaxed text-texto-secundario"
      >
        Anota un gasto en dos toques. Bolsillo lo ordena por categoría y te muestra en qué se te
        está yendo la plata.
      </motion.p>

      {/* El producto, no una foto: es lo primero que se ve al bajar la vista */}
      <motion.div
        {...aparece(0.28)}
        className="vidrio mt-8 flex flex-col gap-2 rounded-[var(--radius-extra)] p-3"
      >
        {movimientos.map((m) => (
          <FilaMovimiento
            key={m.id}
            inicial={m.inicial}
            nombre={m.nombre}
            detalle={m.detalle}
            monto={m.monto}
            clase={m.clase}
          />
        ))}
      </motion.div>

      <motion.div {...aparece(0.36)} className="mt-9 flex flex-col items-stretch gap-3">
        <Boton to="/empezar" variante="destacado" className="w-full">
          Crear cuenta gratis
        </Boton>
        <p className="text-nota text-texto-tenue">Gratis · sin tarjeta de crédito</p>
      </motion.div>
    </main>
  )
}
