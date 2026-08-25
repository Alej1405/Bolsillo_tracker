import { motion } from 'motion/react'
import hero from '@/assets/hero.jpg'
import { Boton } from '@/components/ui/Boton'
import { useAparicion } from '@/movimiento'

/**
 * Portada de la landing. Es lo único que se anima al cargar y no al hacer
 * scroll: ya está en pantalla, esperar a que entre en vista no aplica.
 * Los textos entran escalonados de arriba abajo, en orden de lectura.
 */
export function Hero() {
  const aparece = useAparicion()

  return (
    <section id="inicio" className="px-4 pt-28 md:px-8 lg:px-[130px]">
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[var(--radius-maximo)]">
        <img
          src={hero}
          alt="Monedas apiladas entre lavanda"
          className="h-[420px] w-full object-cover md:h-[520px] lg:h-[600px]"
        />

        {/* Contenido del hero, superpuesto sobre la fotografía */}
        <div className="absolute inset-0 flex flex-col items-center px-6 pt-14 text-center md:pt-20">
          <motion.div
            {...aparece(0.05)}
            className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1"
          >
            <span className="font-titulo text-[22px] font-bold tracking-[-0.02em] text-texto-principal md:text-[30px]">
              A dónde va tu
            </span>
            <span className="font-titulo text-[26px] font-extrabold tracking-[-0.02em] text-texto-principal md:text-[36px]">
              DINERO
            </span>
          </motion.div>

          <motion.p
            {...aparece(0.14)}
            className="mt-4 w-full max-w-[420px] text-[15px] leading-relaxed text-texto-principal/90 md:text-[17px]"
          >
            Rastrea todo, en qué gastas más, a qué das prioridad, cómo están tus ahorros...?
          </motion.p>

          <motion.p
            {...aparece(0.22)}
            className="mt-3 w-full max-w-[420px] text-[15px] font-semibold text-texto-principal md:text-[16px]"
          >
            Estás a un click de ordenar tus finanzas
          </motion.p>

          <motion.div {...aparece(0.3)} className="mt-8">
            <Boton to="/registro">Toma el Control</Boton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
