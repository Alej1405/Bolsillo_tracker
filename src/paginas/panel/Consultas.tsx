import { useEffect, useState } from 'react'
import { CheckCircleIcon, ChatCircleTextIcon, PaperPlaneRightIcon } from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { foco, iniciales } from '@/helpers'
import { Conversacion, EstadoHilo, Paginacion, cuando } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Cifra } from '@/ui/Cifra'
import { Ficha } from '@/ui/Ficha'
import { useAppStore } from '@/stores/useAppStore'
import type { EstadoHilo as Estado, HiloAdmin } from '@/types'

type Filtro = 'todas' | Estado

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todas', texto: 'Todas' },
  { id: 'abierto', texto: 'Sin responder' },
  { id: 'respondido', texto: 'Respondidas' },
  { id: 'cerrado', texto: 'Cerradas' },
]

const campo = `w-full rounded-grande border border-borde-fuerte bg-fondo-superficie px-4 py-3 text-cuerpo text-texto-principal outline-none placeholder:text-texto-tenue ${foco}`

/**
 * Quién escribió.
 *
 * El nombre y el correo llegan resueltos del backend: de la ficha si tiene
 * cuenta, de lo que dejó escrito si vino del formulario. La etiqueta de abajo
 * distingue las dos cosas, porque no se responde igual a quien está dentro de
 * la aplicación que a quien escribió desde la web.
 */
function DeQuien({ hilo }: { hilo: HiloAdmin }) {
  const nombre = hilo.name ?? hilo.guest_name ?? 'Alguien'
  const correo = hilo.email ?? hilo.guest_email ?? ''
  const conCuenta = Boolean(hilo.user_id)

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lavanda-200 text-nota font-semibold text-lavanda-950">
        {iniciales(nombre)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-nota font-medium text-texto-principal">{nombre}</p>
        <p className="truncate text-micro text-texto-tenue">
          {correo}
          {correo && ' · '}
          {conCuenta ? 'con cuenta' : 'desde la web'}
        </p>
      </div>
    </div>
  )
}

/**
 * La bandeja de soporte. Solo la ve `super_admin`.
 *
 * Ordenada por movimiento, no por fecha de creación: lo que acaba de recibir un
 * mensaje sube. Y el filtro por defecto muestra todas, pero el número de arriba
 * dice cuántas esperan respuesta, que es lo que hay que mirar cada mañana.
 *
 * Aquí llegan también las del formulario de contacto de la landing, escritas
 * por gente sin cuenta. Se responden igual: la única diferencia es que en vez
 * de un usuario hay un nombre y un correo.
 */
export function Consultas() {
  const hilos = useAppStore((e) => e.bandeja)
  const total = useAppStore((e) => e.totalHilos)
  const paginas = useAppStore((e) => e.paginasHilos)
  const sinResponder = useAppStore((e) => e.sinResponder)
  const cargando = useAppStore((e) => e.cargandoBandeja)
  const error = useAppStore((e) => e.errorSoporte)
  const ocupado = useAppStore((e) => e.ocupadoConHilo)
  const cargar = useAppStore((e) => e.cargarBandeja)
  const responder = useAppStore((e) => e.responderComoAdmin)
  const cerrar = useAppStore((e) => e.cerrarHilo)
  const reabrir = useAppStore((e) => e.reabrirHilo)

  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [pagina, setPagina] = useState(1)
  const [abierta, setAbierta] = useState<string | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    void cargar(pagina, filtro === 'todas' ? undefined : filtro)
  }, [cargar, pagina, filtro])

  const cambiarFiltro = (f: Filtro) => {
    setFiltro(f)
    setPagina(1)
  }

  const enviar = async (hilo: HiloAdmin) => {
    if (!respuesta.trim()) return
    setAviso(null)
    try {
      await responder(hilo.id, respuesta.trim())
      setRespuesta('')
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos enviar la respuesta.')
    }
  }

  const alternarCierre = async (hilo: HiloAdmin) => {
    setAviso(null)
    try {
      if (hilo.status === 'cerrado') {
        await reabrir(hilo.id)
        setAviso('Consulta reabierta.')
      } else {
        await cerrar(hilo.id)
        setAviso('Consulta cerrada. La persona ya no puede escribir en ella.')
      }
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos cambiar el estado.')
    }
  }

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Consultas</h2>
        <p className="text-nota text-texto-tenue">
          {cargando ? 'Cargando…' : `${total} en total`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Cifra
          etiqueta="Esperando respuesta"
          valor={String(sinResponder)}
          tono={sinResponder > 0 ? 'gasto' : 'ingreso'}
          ayuda="Lo que hay que contestar"
        />
        <Cifra etiqueta="En total" valor={String(total)} ayuda="Consultas recibidas" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <Ficha
            key={f.id}
            texto={f.texto}
            activa={filtro === f.id}
            onClick={() => cambiarFiltro(f.id)}
          />
        ))}
      </div>

      {aviso && (
        <p role="status" className="rounded-extra bg-fondo-superficie px-5 py-4 text-cuerpo text-texto-secundario">
          {aviso}
        </p>
      )}

      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargar(pagina)}>
            Reintentar
          </Boton>
        </div>
      ) : cargando ? (
        <EsperandoLista filas={4} alto={90} />
      ) : hilos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {hilos.map((h) => {
            const desplegada = abierta === h.id
            return (
              <article key={h.id} className="flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5">
                <button
                  type="button"
                  onClick={() => {
                    setAbierta(desplegada ? null : h.id)
                    setRespuesta('')
                  }}
                  aria-expanded={desplegada}
                  className={`flex flex-wrap items-center gap-4 text-left ${foco} rounded-medio`}
                >
                  <DeQuien hilo={h} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-cuerpo font-medium text-texto-principal">
                      {h.subject}
                    </p>
                    <p className="text-nota text-texto-tenue">
                      {h.messages.length}{' '}
                      {h.messages.length === 1 ? 'mensaje' : 'mensajes'} · {cuando(h.updated_at)}
                    </p>
                  </div>
                  <EstadoHilo estado={h.status} />
                </button>

                {desplegada && (
                  <div className="flex flex-col gap-4 border-t border-borde-sutil pt-4">
                    <Conversacion hilo={h} comoAdmin />

                    <div className="flex flex-col gap-2">
                      <label htmlFor={`responder-${h.id}`} className="sr-only">
                        Escribe la respuesta
                      </label>
                      <textarea
                        id={`responder-${h.id}`}
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        rows={3}
                        placeholder="Escribe la respuesta…"
                        className={campo}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Boton
                          onClick={() => void enviar(h)}
                          disabled={ocupado === h.id || !respuesta.trim()}
                          tamano="mediano"
                        >
                          <PaperPlaneRightIcon size={16} aria-hidden />
                          {ocupado === h.id ? 'Enviando…' : 'Responder'}
                        </Boton>
                        <Boton
                          variante="secundario"
                          tamano="mediano"
                          onClick={() => void alternarCierre(h)}
                          disabled={ocupado === h.id}
                        >
                          <CheckCircleIcon size={16} aria-hidden />
                          {h.status === 'cerrado' ? 'Reabrir' : 'Cerrar consulta'}
                        </Boton>
                      </div>
                      {h.guest_email && (
                        <p className="text-micro text-texto-tenue">
                          Escribió sin cuenta desde la web. Si hace falta contestarle por correo,
                          es {h.guest_email}.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-extra border border-dashed border-borde-fuerte px-5 py-12 text-center">
          <ChatCircleTextIcon size={32} aria-hidden className="text-texto-tenue" />
          <p className="text-cuerpo text-texto-secundario">
            {filtro === 'todas'
              ? 'Todavía no ha escrito nadie.'
              : 'Ninguna consulta con este filtro.'}
          </p>
        </div>
      )}

      {!cargando && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-nota text-texto-tenue">
            {hilos.length} de {total}
          </p>
          <Paginacion pagina={pagina} paginas={paginas} ir={setPagina} variante="pasos" />
        </div>
      )}
    </section>
  )
}
