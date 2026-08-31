import { useLocation } from 'react-router-dom'
import { HammerIcon } from '@phosphor-icons/react'
import { tituloDe } from '@/layout/panel/destinos'
import { Boton } from '@/ui/Boton'

/**
 * Lo que ve quien entra a una pantalla del panel que todavía no existe.
 *
 * Va dentro del armazón y no en la pantalla completa de `EnConstruccion`: la
 * barra lateral y la cabecera se quedan, así que se sabe dónde se está y se
 * puede seguir navegando. Una pantalla a sangre te saca de la aplicación para
 * decirte que falta una parte de ella.
 */
export function Pendiente() {
  const { pathname } = useLocation()
  const titulo = tituloDe(pathname)

  return (
    <section className="vidrio flex flex-1 flex-col items-start justify-center gap-4 rounded-maximo px-8 py-12">
      <span className="grid size-11 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
        <HammerIcon size={22} aria-hidden />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
          {titulo} está en camino
        </h2>
        <p className="max-w-[52ch] text-cuerpo leading-relaxed text-texto-secundario">
          Esta parte del panel todavía se está armando. Mientras tanto, en Inicio
          tienes tu saldo, los últimos movimientos y en qué se te fue el mes.
        </p>
      </div>

      <Boton to="/dashboard" variante="secundario" className="mt-2">
        Volver a Inicio
      </Boton>
    </section>
  )
}
