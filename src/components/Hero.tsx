import { motion } from 'motion/react'
import { Boton } from '@/components/ui/Boton'
import { FilaMovimiento } from '@/components/piezas'
import { useAparicion } from '@/movimiento'

/**
 * Portada de la landing. Es lo único que se anima al cargar y no al hacer
 * scroll: ya está en pantalla, esperar a que entre en vista no aplica.
 *
 * Dos columnas a propósito. La versión anterior era una fotografía a sangre
 * con el texto centrado encima: se veía bien y no decía nada, porque la
 * primera pantalla de un gestor de gastos no mostraba ni un gasto. Ahora el
 * argumento va a la izquierda sobre vidrio —que deja ver el guilloché del
 * fondo, que es lo único de esta marca que nadie puede copiar— y a la derecha
 * está el producto: movimientos reales, con su moneda.
 *
 * La fotografía es el LCP de la página, así que no se importa desde
 * `src/assets`: vive en `public/` con nombre estable para que el `preload` de
 * index.html pueda nombrarla sin el hash que Vite le pondría al compilar.
 */
export function Hero() {
  const aparece = useAparicion()

  return (
    <section id="inicio" className="px-4 pt-28 md:px-8 lg:px-[130px]">
      <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[var(--radius-maximo)] lg:grid-cols-[1fr_0.92fr]">
        {/* Columna del argumento */}
        <div className="vidrio flex flex-col justify-center px-7 py-12 md:px-12 md:py-20">
          <motion.h1
            {...aparece(0.05)}
            className="font-titulo text-despliegue leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-texto-principal md:text-despliegue-mayor"
          >
            Sabes exactamente a dónde se fue tu mes
          </motion.h1>

          <motion.p
            {...aparece(0.14)}
            className="mt-6 max-w-[46ch] text-cuerpo leading-relaxed text-texto-secundario md:text-cuerpo-amplio"
          >
            Anota un gasto en dos toques. Bolsillo lo ordena por categoría y te muestra en qué
            se te está yendo la plata.
          </motion.p>

          <motion.div {...aparece(0.22)} className="mt-10 flex flex-col items-start gap-3">
            <Boton to="/registro" variante="destacado">
              Crear cuenta gratis
            </Boton>
            <p className="text-nota text-texto-tenue">Gratis · sin tarjeta de crédito</p>
          </motion.div>
        </div>

        {/*
          Columna del producto. La fotografía baja de protagonista a soporte:
          ya no tiene que sostener texto, así que se puede usar entera.
        */}
        <div className="relative grid min-h-[340px] place-items-center p-6 md:p-8 lg:min-h-[560px]">
          <img
            src="/hero-960.webp"
            srcSet="/hero-480.webp 480w, /hero-960.webp 960w, /hero-1389.webp 1389w"
            sizes="(max-width: 1024px) 100vw, 560px"
            width={1389}
            height={768}
            fetchPriority="high"
            decoding="async"
            alt="Monedas apiladas entre lavanda"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Velo para que las filas blancas no compitan con las flores */}
          <div className="absolute inset-0 bg-lavanda-950/15" />

          <motion.div
            {...aparece(0.3)}
            className="vidrio relative w-full max-w-[340px] rounded-[var(--radius-extra)] p-4"
          >
            <div className="flex flex-col gap-2">
              <FilaMovimiento
                inicial="C"
                nombre="Comida"
                detalle="Efectivo · Hoy"
                monto="− $12,75"
                clase="gasto"
              />
              <FilaMovimiento
                inicial="S"
                nombre="Sueldo"
                detalle="Banco · 1 sep"
                monto="+ $820,00"
                clase="ingreso"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
