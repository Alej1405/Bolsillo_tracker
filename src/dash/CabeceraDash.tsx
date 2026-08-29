import { Link, useNavigate } from 'react-router-dom'
import { SignOutIcon } from '@phosphor-icons/react'
import logo from '@/assets/logo.png'
import { useAppStore } from '@/stores/useAppStore'

/** Barra superior de la aplicación: marca, quién entró y salir. */
export function CabeceraDash() {
  const navegar = useNavigate()
  const usuario = useAppStore((e) => e.usuario)
  const salir = useAppStore((e) => e.salir)
  const limpiarDashboard = useAppStore((e) => e.limpiarDashboard)

  const cerrar = () => {
    // Se limpian los datos además del usuario: si entra otra cuenta en la
    // misma pestaña, no puede ver por un instante el saldo de la anterior.
    limpiarDashboard()
    salir()
    navegar('/login', { replace: true })
  }

  return (
    <header className="border-b border-borde-normal bg-fondo-superficie">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-5 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-1" aria-label="Bolsillo, inicio">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-titulo-menor font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {usuario && (
            <span className="hidden text-nota text-texto-secundario sm:block">
              {usuario.full_name}
            </span>
          )}
          <button
            type="button"
            onClick={cerrar}
            className="flex min-h-11 items-center gap-2 rounded-medio px-3 text-nota font-medium text-texto-secundario transition-colors hover:bg-fondo-sutil hover:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900"
          >
            <SignOutIcon size={18} aria-hidden />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
