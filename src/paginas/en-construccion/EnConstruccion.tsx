import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { Fondo } from '@/layout/landing/Fondo'
import { useAparicion } from '@/movimiento'
import { motion } from 'motion/react'

/**
 * Adonde llega quien acaba de crear su cuenta.
 *
 * El texto habla del panel y no de "la versión de celular", que es lo que
 * decía antes: esta pantalla nació cuando el móvil no tenía versión propia, y
 * heredó ese mensaje. Ahora el celular tiene sus pantallas y esta es el
 * destino del registro en cualquiera de las dos, así que decir "ábrelo desde
 * una computadora" a alguien que acaba de registrarse en su portátil no tenía
 * ningún sentido.
 */
export function EnConstruccion() {
  const aparece = useAparicion()

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <Fondo />

      <main className="flex w-full max-w-[380px] flex-col items-start">
        <motion.div {...aparece(0.05)} className="flex items-center gap-1">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-titulo-menor font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </motion.div>

        <motion.h1
          {...aparece(0.14)}
          className="mt-10 font-titulo text-titulo-mayor leading-[1.1] font-extrabold tracking-[-0.02em] text-balance text-texto-principal"
        >
          Tu panel está en camino
        </motion.h1>

        <motion.p
          {...aparece(0.22)}
          className="mt-5 text-cuerpo leading-relaxed text-texto-secundario"
        >
          Tu cuenta ya está creada y guardada. Lo que todavía no está listo es la pantalla
          donde vas a registrar tus movimientos y leer tus reportes — la estamos armando.
        </motion.p>

        <motion.p
          {...aparece(0.28)}
          className="mt-4 text-cuerpo leading-relaxed text-texto-secundario"
        >
          Te avisamos al correo en cuanto puedas entrar.
        </motion.p>

        {/*
          Una salida. Antes esta pantalla no tenía ninguna: se llegaba y no se
          podía ir a ningún sitio sin el botón de atrás del navegador.
        */}
        <motion.div {...aparece(0.36)} className="mt-8">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-nav bg-accion-principal px-6 font-cuerpo font-semibold text-texto-sobre-marca transition-colors hover:bg-accion-principal-encima focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
