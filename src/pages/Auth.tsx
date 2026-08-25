import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import hero from '@/assets/hero.jpg'
import logo from '@/assets/logo.png'
import { Boton } from '@/components/ui/Boton'
import { curva, duracion } from '@/movimiento'

type Modo = 'login' | 'registro'

/** Deslizamiento del panel y entrada de los formularios. */
const transicion = { duration: duracion.panel, ease: curva.salida }
/** Relevo del contenido dentro del panel: más corto, para que no arrastre. */
const transicionContenido = { duration: duracion.cambio, ease: curva.salida }

/** Campo de texto del formulario, con etiqueta arriba y ayuda debajo. */
function Campo({
  id,
  etiqueta,
  tipo = 'text',
  placeholder,
  ayuda,
}: {
  id: string
  etiqueta: string
  tipo?: string
  placeholder: string
  ayuda: string
}) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-[13px] font-medium text-texto-principal">
        {etiqueta}
      </label>
      <input
        id={id}
        type={tipo}
        placeholder={placeholder}
        className="h-11 w-full rounded-[var(--radius-medio)] border border-borde-normal bg-fondo-superficie px-4 text-[15px] text-texto-principal outline-none placeholder:text-texto-tenue focus:border-lavanda-500 focus:ring-2 focus:ring-lavanda-300"
      />
      <span className="text-[13px] text-texto-tenue">{ayuda}</span>
    </div>
  )
}

function FormularioLogin() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-col gap-5">
      <div className="text-left">
        <h1 className="font-titulo text-[30px] font-bold tracking-[-0.02em] text-texto-principal">
          Entra a tu billetera
        </h1>
        <p className="mt-1 text-[15px] text-texto-secundario">
          Con el correo y la contraseña que usaste al crear la cuenta.
        </p>
      </div>
      <Campo id="login-correo" etiqueta="Tu correo" tipo="email" placeholder="nombre@correo.com" ayuda="El que usaste al registrarte" />
      <Campo id="login-clave" etiqueta="Tu contraseña" tipo="password" placeholder="Escribe tu clave" ayuda="¿La olvidaste? Te ayudamos" />
      <Boton type="submit" className="w-full">Entrar</Boton>
    </form>
  )
}

function FormularioRegistro() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-col gap-5">
      <div className="text-left">
        <h1 className="font-titulo text-[30px] font-bold tracking-[-0.02em] text-texto-principal">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-[15px] text-texto-secundario">Nombre, correo y contraseña. Nada más.</p>
      </div>
      <Campo id="reg-nombre" etiqueta="Cómo te llamas" placeholder="Diego Morales" ayuda="Así te saludamos en la aplicación" />
      <Campo id="reg-correo" etiqueta="Tu correo" tipo="email" placeholder="nombre@correo.com" ayuda="Te enviamos el enlace de acceso" />
      <Campo id="reg-clave" etiqueta="Una contraseña" tipo="password" placeholder="Mínimo 8 caracteres" ayuda="Al menos ocho caracteres, una letra y un número" />
      <Boton type="submit" className="w-full">Crear cuenta</Boton>
    </form>
  )
}

/** Contenido del panel de color: logo, saludo con tracking amplio, frase y botón para cambiar de modo. */
function PanelContenido({ modo, onCambiar }: { modo: Modo; onCambiar: () => void }) {
  const esLogin = modo === 'login'
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-10 text-center text-texto-inverso">
      <img src={logo} alt="" className="h-[158px] w-[111px] object-contain" />
      <div>
        <h2 className="font-titulo text-[32px] font-semibold tracking-[0.15em] text-texto-inverso">
          {esLogin ? 'Bienvenido' : 'Crear mi Cuenta'}
        </h2>
        <p className="mx-auto mt-4 max-w-[360px] text-[20px] font-light leading-[35px] tracking-[0.15em] text-texto-inverso">
          {esLogin
            ? 'Recuerda la verdadera libertad es el orden y la disciplina.'
            : 'Iniciar es lo más fácil, la constancia es lo que nos hace diferentes.'}
        </p>
      </div>
      <p className="mt-4 text-[16px] font-light tracking-[0.15em] text-texto-inverso">
        {esLogin ? '¿Aún no te registras?' : '¿Ya tienes tu cuenta?'}
      </p>
      <button
        type="button"
        onClick={onCambiar}
        className="h-[52px] rounded-[var(--radius-grande)] bg-accion-principal px-6 text-[16px] font-semibold text-texto-sobre-marca shadow-[3px_3px_3px_rgba(241,245,249,0.15)] transition-colors hover:bg-accion-principal-encima"
      >
        {esLogin ? 'Crear cuenta' : 'Iniciar sesión'}
      </button>
    </div>
  )
}

/** Tarjeta blanca del formulario. */
function TarjetaFormulario({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[440px] rounded-[var(--radius-extra)] bg-[color-mix(in_srgb,#ffffff_82%,transparent)] p-8 shadow-[0_2px_4px_-1px_rgba(2,6,23,0.06),0_1px_2px_0_rgba(2,6,23,0.04)] backdrop-blur-md">
      {children}
    </div>
  )
}

export function Auth() {
  const location = useLocation()
  const inicial: Modo = location.pathname.includes('registro') ? 'registro' : 'login'
  const [modo, setModo] = useState<Modo>(inicial)
  const menosMovimiento = useReducedMotion()
  const esLogin = modo === 'login'

  const cambiar = () => {
    const nuevo: Modo = esLogin ? 'registro' : 'login'
    setModo(nuevo)
    // Mantiene la URL en sintonía sin desmontar el componente (no rompe la animación).
    window.history.replaceState(null, '', nuevo === 'login' ? '/login' : '/registro')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fondo: la misma fotografía del hero con velo pizarra */}
      <img src={hero} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[rgba(71,85,105,0.35)]" />

      {/* Volver a la landing */}
      <Link
        to="/"
        className="absolute left-6 top-6 z-30 rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-texto-principal backdrop-blur transition-colors hover:bg-white/90"
      >
        ← Volver
      </Link>

      {/* ── Escritorio: panel a media pantalla que se desliza ── */}
      <div className="relative z-10 hidden min-h-screen md:block">
        {/* Capa de formularios (debajo del panel). Registro en la mitad izquierda, login en la derecha. */}
        <div className="absolute inset-0 flex">
          <div className="grid w-1/2 place-items-center px-10">
            <AnimatePresence>
              {!esLogin && (
                <motion.div
                  key="reg"
                  initial={menosMovimiento ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transicion}
                  className="w-full max-w-[440px]"
                >
                  <TarjetaFormulario>
                    <FormularioRegistro />
                  </TarjetaFormulario>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="grid w-1/2 place-items-center px-10">
            <AnimatePresence>
              {esLogin && (
                <motion.div
                  key="login"
                  initial={menosMovimiento ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transicion}
                  className="w-full max-w-[440px]"
                >
                  <TarjetaFormulario>
                    <FormularioLogin />
                  </TarjetaFormulario>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel azul-pizarra a sangre, media pantalla, que se desliza como si haláramos el cuadro */}
        <motion.div
          className="panel-acceso absolute left-0 top-0 h-full w-1/2 overflow-hidden"
          animate={{ x: esLogin ? '0%' : '100%' }}
          transition={menosMovimiento ? { duration: 0 } : transicion}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={modo}
              initial={menosMovimiento ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transicionContenido}
              className="h-full"
            >
              <PanelContenido modo={modo} onCambiar={cambiar} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Móvil: apilado ── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-20 md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={modo}
            initial={menosMovimiento ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={transicion}
            className="w-full max-w-[400px]"
          >
            <TarjetaFormulario>
              {esLogin ? <FormularioLogin /> : <FormularioRegistro />}
            </TarjetaFormulario>
          </motion.div>
        </AnimatePresence>
        <div className="panel-acceso w-full max-w-[400px] rounded-[var(--radius-extra)] px-6 py-8">
          <PanelContenido modo={modo} onCambiar={cambiar} />
        </div>
      </div>
    </div>
  )
}
