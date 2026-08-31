import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import logo from '@/assets/logo.png'
import { FormularioLogin, FormularioRegistro } from '@/paginas/acceso'
import { useAparicion } from '@/movimiento'

/**
 * Entrar y crear cuenta, en celular.
 *
 * Los formularios son exactamente los de escritorio —se importan de
 * `@/paginas/acceso`, no se reescriben— porque la validación, la llamada a la API y el
 * aviso de éxito tienen que comportarse igual en los dos sitios. Lo único
 * propio de aquí es el envoltorio.
 *
 * Y el envoltorio sí cambia de verdad: en escritorio hay un panel de color que
 * se desliza a media pantalla, y eso en un teléfono no cabe ni tiene sentido.
 * Aquí es una pantalla apilada, con el cambio de modo como un enlace al pie
 * —donde llega el pulgar— en vez de un botón dentro de un panel lateral.
 *
 * No lleva `Pantalla`: esa reserva el hueco de la barra inferior, y estas dos
 * vistas se ven sin barra. Un formulario de acceso no es un destino de
 * navegación, es un trámite del que se sale terminándolo o volviendo atrás.
 */
export function Acceso() {
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const aparece = useAparicion()
  const esLogin = !pathname.includes('registro')

  const cambiar = () => navegar(esLogin ? '/registro' : '/login')

  return (
    <main className="relative min-h-screen px-5 pb-16 pt-6">
      {/*
        Volver es imprescindible aquí: sin la barra inferior, esta pantalla no
        tiene ninguna otra salida. En escritorio el equivalente vive arriba a
        la izquierda; en un teléfono va donde alcanza el pulgar sin recolocar
        la mano.
      */}
      <motion.div {...aparece(0.02)} className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Volver al inicio"
          className="-ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-full text-texto-secundario transition-colors hover:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900"
        >
          <ArrowLeftIcon size={22} />
        </Link>

        <div className="flex items-center gap-1">
          <img src={logo} alt="" className="h-7 w-5 object-contain" />
          <span className="font-titulo text-cuerpo-amplio font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </div>

        {/* Contrapeso del botón de volver, para que el logo quede centrado. */}
        <span className="size-11" aria-hidden />
      </motion.div>

      <motion.div
        {...aparece(0.1)}
        className="mx-auto mt-8 w-full max-w-[440px] rounded-extra bg-white/82 p-6 shadow-[0_2px_4px_-1px_rgba(2,6,23,0.06),0_1px_2px_0_rgba(2,6,23,0.04)] backdrop-blur-md"
      >
        {esLogin ? <FormularioLogin /> : <FormularioRegistro />}
      </motion.div>

      <motion.p {...aparece(0.18)} className="mt-6 text-center text-cuerpo text-texto-secundario">
        {esLogin ? '¿Aún no te registras?' : '¿Ya tienes tu cuenta?'}{' '}
        <button
          type="button"
          onClick={cambiar}
          className="min-h-11 font-semibold text-texto-enlace underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900"
        >
          {esLogin ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </motion.p>
    </main>
  )
}
