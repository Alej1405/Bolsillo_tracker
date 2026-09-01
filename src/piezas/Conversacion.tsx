import { ESTADOS, cuando } from '@/piezas/estadoDeHilo'
import type { Hilo } from '@/types'

/** La etiqueta de estado, para las dos pantallas de soporte. */
export function EstadoHilo({ estado }: { estado: Hilo['status'] }) {
  const { texto, clases } = ESTADOS[estado]
  return (
    <span className={`rounded-full px-3 py-1 text-micro font-medium uppercase ${clases}`}>
      {texto}
    </span>
  )
}

/**
 * Los mensajes de un hilo, en orden.
 *
 * `deQuien` cambia quién es "tú": en la bandeja del administrador los mensajes
 * del equipo son suyos, y los de la persona son del otro lado.
 */
export function Conversacion({ hilo, comoAdmin = false }: { hilo: Hilo; comoAdmin?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {hilo.messages.map((m) => (
        <div
          key={m.id}
          className={`flex flex-col gap-1 ${
            m.from_admin === comoAdmin ? 'items-end' : 'items-start'
          }`}
        >
          <div
            className={`max-w-[85%] rounded-extra px-4 py-3 ${
              m.from_admin === comoAdmin
                ? 'bg-lavanda-200 text-lavanda-950'
                : 'border border-borde-sutil bg-fondo-superficie text-texto-principal'
            }`}
          >
            <p className="text-cuerpo leading-relaxed whitespace-pre-line">{m.body}</p>
          </div>
          <p className="px-1 text-micro text-texto-tenue">
            {m.from_admin ? 'Equipo de Bolsillo' : comoAdmin ? 'La persona' : 'Tú'} ·{' '}
            {cuando(m.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
