import logo from '@/assets/logo.png'
import { Fondo } from '@/components/Fondo'
import { useAparicion } from '@/movimiento'
import { motion } from 'motion/react'

/**
 * Lo que ve quien entra desde un celular, mientras la versión de app está en
 * construcción. No es la landing encogida: es una pantalla propia, y esa es
 * justamente la razón de que exista.
 */
export function EnConstruccion() {
  const aparece = useAparicion()

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <Fondo />

      <main className="flex w-full max-w-[340px] flex-col items-start">
        <motion.div {...aparece(0.05)} className="flex items-center gap-1">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-[22px] font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </motion.div>

        <motion.h1
          {...aparece(0.14)}
          className="mt-10 font-titulo text-titulo-mayor leading-[1.1] font-extrabold tracking-[-0.02em] text-balance text-texto-principal"
        >
          Estamos construyendo la versión de celular
        </motion.h1>

        <motion.p
          {...aparece(0.22)}
          className="mt-5 text-cuerpo leading-relaxed text-texto-secundario"
        >
          No queremos darte la web encogida. Estamos armando una versión que se use como una
          aplicación, con su propia navegación abajo, al alcance del pulgar.
        </motion.p>

        <motion.p {...aparece(0.3)} className="mt-8 text-nota text-texto-tenue">
          Mientras tanto, abre Bolsillo desde una computadora.
        </motion.p>
      </main>
    </div>
  )
}
