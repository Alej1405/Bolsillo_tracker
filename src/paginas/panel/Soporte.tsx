import { useEffect, useState } from 'react'
import { ChatCircleTextIcon, PaperPlaneRightIcon } from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { foco } from '@/helpers'
import { Conversacion, EstadoHilo, cuando } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { useAppStore } from '@/stores/useAppStore'
import type { Hilo } from '@/types'

const campo = `w-full rounded-grande border border-borde-fuerte bg-fondo-superficie px-4 py-3 text-cuerpo text-texto-principal outline-none placeholder:text-texto-tenue ${foco}`

/**
 * Soporte: escribirle al equipo y leer lo que contestan.
 *
 * Una conversación por asunto, no una bandeja de mensajes sueltos: quien
 * escribe por un problema concreto quiere leer las respuestas de ese problema
 * juntas, no mezcladas con otra consulta de hace un mes.
 *
 * Un hilo cerrado no se puede continuar. Lo cierra el equipo cuando el asunto
 * termina, y colar mensajes ahí haría que no los viera nadie: para algo nuevo,
 * una consulta nueva.
 */
export function Soporte() {
  const hilos = useAppStore((e) => e.misHilos)
  const cargando = useAppStore((e) => e.cargandoMisHilos)
  const error = useAppStore((e) => e.errorSoporte)
  const cargar = useAppStore((e) => e.cargarMisHilos)
  const abrir = useAppStore((e) => e.abrirHilo)
  const responder = useAppStore((e) => e.responderHilo)

  const [nuevaAbierta, setNuevaAbierta] = useState(false)
  const [asunto, setAsunto] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errores, setErrores] = useState<{ asunto?: string; cuerpo?: string }>({})

  /* Cuál está desplegada. `null` es ninguna. */
  const [abierta, setAbierta] = useState<string | null>(null)
  const [respuesta, setRespuesta] = useState('')

  useEffect(() => {
    void cargar()
  }, [cargar])

  const enviarNueva = async (e: React.FormEvent) => {
    e.preventDefault()
    const fallos: typeof errores = {}
    if (asunto.trim().length < 3) fallos.asunto = 'Ponle un asunto de al menos 3 letras'
    if (!cuerpo.trim()) fallos.cuerpo = 'Cuéntanos qué pasa'
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    setEnviando(true)
    try {
      await abrir({ subject: asunto.trim(), body: cuerpo.trim() })
      setNuevaAbierta(false)
      setAsunto('')
      setCuerpo('')
      setAviso('Enviada. Te contestamos por aquí mismo.')
    } catch (err) {
      setErrores({ cuerpo: err instanceof Error ? err.message : 'No pudimos enviarla.' })
    } finally {
      setEnviando(false)
    }
  }

  const enviarRespuesta = async (hilo: Hilo) => {
    if (!respuesta.trim()) return
    setEnviando(true)
    setAviso(null)
    try {
      await responder(hilo.id, respuesta.trim())
      setRespuesta('')
    } catch (err) {
      setAviso(err instanceof Error ? err.message : 'No pudimos enviar tu mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Soporte</h2>
          <p className="text-nota text-texto-tenue">
            {cargando
              ? 'Cargando…'
              : hilos.length === 0
                ? 'Escríbenos si algo no funciona o no se entiende'
                : `${hilos.length} ${hilos.length === 1 ? 'consulta' : 'consultas'}`}
          </p>
        </div>
        <Boton onClick={() => setNuevaAbierta(true)} tamano="mediano">
          <ChatCircleTextIcon size={18} aria-hidden />
          Escribir al equipo
        </Boton>
      </div>

      {aviso && (
        <p role="status" className="rounded-extra bg-ingreso-sutil px-5 py-4 text-cuerpo text-ingreso">
          {aviso}
        </p>
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargar()}>
            Reintentar
          </Boton>
        </div>
      )}

      {cargando ? (
        <EsperandoLista filas={3} alto={80} />
      ) : hilos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {hilos.map((h) => {
            const desplegada = abierta === h.id
            return (
              <article key={h.id} className="flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5">
                {/*
                  La cabecera es un botón: pulsar en cualquier parte despliega la
                  conversación. `aria-expanded` es lo que le dice a un lector de
                  pantalla que esto abre y cierra.
                */}
                <button
                  type="button"
                  onClick={() => {
                    setAbierta(desplegada ? null : h.id)
                    setRespuesta('')
                  }}
                  aria-expanded={desplegada}
                  className={`flex flex-wrap items-center gap-3 text-left ${foco} rounded-medio`}
                >
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
                    <Conversacion hilo={h} />

                    {h.status === 'cerrado' ? (
                      <p className="rounded-medio bg-fondo-sutil px-4 py-3 text-nota text-texto-secundario">
                        Esta consulta está cerrada. Si necesitas algo más, escribe una nueva.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`responder-${h.id}`} className="sr-only">
                          Escribe tu respuesta
                        </label>
                        <textarea
                          id={`responder-${h.id}`}
                          value={respuesta}
                          onChange={(e) => setRespuesta(e.target.value)}
                          rows={3}
                          placeholder="Escribe aquí…"
                          className={campo}
                        />
                        <Boton
                          onClick={() => void enviarRespuesta(h)}
                          disabled={enviando || !respuesta.trim()}
                          tamano="mediano"
                          className="self-start"
                        >
                          <PaperPlaneRightIcon size={16} aria-hidden />
                          {enviando ? 'Enviando…' : 'Enviar'}
                        </Boton>
                      </div>
                    )}
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
            Todavía no nos has escrito. Si algo no funciona o no se entiende, cuéntanoslo.
          </p>
        </div>
      )}

      <Modal
        abierto={nuevaAbierta}
        onCerrar={() => setNuevaAbierta(false)}
        titulo="Escribir al equipo"
      >
        <form onSubmit={enviarNueva} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="asunto-consulta" className="text-nota font-medium text-texto-principal">
              ¿De qué se trata?
            </label>
            <input
              id="asunto-consulta"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="No puedo borrar un bolsillo"
              className={campo}
            />
            <p className="text-micro text-texto-tenue">
              {errores.asunto ? (
                <span className="text-gasto">{errores.asunto}</span>
              ) : (
                'Una frase corta. Sirve para encontrar la conversación después.'
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cuerpo-consulta" className="text-nota font-medium text-texto-principal">
              Cuéntanos
            </label>
            <textarea
              id="cuerpo-consulta"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={5}
              placeholder="Qué intentabas hacer y qué pasó."
              className={campo}
            />
            {errores.cuerpo && (
              <p className="text-micro text-gasto">{errores.cuerpo}</p>
            )}
          </div>

          <Boton type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Enviando…' : 'Enviar consulta'}
          </Boton>
        </form>
      </Modal>
    </section>
  )
}
