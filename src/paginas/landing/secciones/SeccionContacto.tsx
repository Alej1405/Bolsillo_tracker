import { useEffect, useState } from 'react'
import { EnvelopeSimpleIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Revelar } from '@/movimiento'
import { BotonEnviar } from '@/ui/BotonEnviar'
import { canales, asuntos } from '@/datos'
import { contactar } from '@/services/SoporteService'
import { useAppStore } from '@/stores/useAppStore'
import type { Canal, ClaseCanal } from '@/datos'

/*
  Mapa clase → icono. Vive en la vista y no en los datos a propósito: el
  backend manda qué clase de canal es, no con qué dibujo se pinta.
*/
const iconos: Record<ClaseCanal, Icon> = {
  correo: EnvelopeSimpleIcon,
  telefono: PhoneIcon,
  ubicacion: MapPinIcon,
  horario: ClockIcon,
}

const campo =
  'w-full rounded-grande bg-fondo-superficie px-4 text-cuerpo-medio text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 focus:ring-lavanda-700'

export function SeccionContacto() {
  /*
    El estado del despacho vive aquí y no en el botón porque quien sabe cuándo
    empieza y termina un envío es el formulario. Hoy la secuencia corre sola —
    no hay endpoint de contacto todavía—; cuando lo haya, se espera la promesa
    en lugar del temporizador y el botón no cambia.
  */
  const [despachando, setDespachando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /*
    Los datos de contacto salen del backend, no del código: el super_admin los
    edita desde su panel y esta sección los muestra. Si la petición falla, la
    sección sigue con lo que hubiera; no es motivo para romper la página.
  */
  const contacto = useAppStore((e) => e.contacto)
  const cargarContacto = useAppStore((e) => e.cargarContacto)

  useEffect(() => {
    void cargarContacto()
  }, [cargarContacto])

  /*
    Los canales que se muestran. Se arman con lo que llegó del backend, y
    mientras no haya respuesta se usan los de muestra: en una landing, un hueco
    donde debería estar el teléfono se lee como que la empresa no existe.

    Solo entra lo que tenga valor. Un canal con la etiqueta puesta y el dato
    vacío es peor que no enseñar ese canal.
  */
  const canalesVisibles: Canal[] = []
  if (contacto) {
    if (contacto.email)
      canalesVisibles.push({
        id: 'can-correo',
        clase: 'correo',
        etiqueta: 'Escríbenos',
        valor: contacto.email,
        enlace: `mailto:${contacto.email}`,
      })
    if (contacto.phone)
      canalesVisibles.push({
        id: 'can-telefono',
        clase: 'telefono',
        etiqueta: 'Llámanos',
        valor: contacto.phone,
        //`tel:` sin espacios ni paréntesis: es lo que sabe marcar un teléfono.
        enlace: `tel:${contacto.phone.replace(/[^\d+]/g, '')}`,
      })
    if (contacto.address)
      canalesVisibles.push({
        id: 'can-direccion',
        clase: 'ubicacion',
        etiqueta: 'Estamos en',
        valor: contacto.address,
      })
    if (contacto.schedule)
      canalesVisibles.push({
        id: 'can-horario',
        clase: 'horario',
        etiqueta: 'Horario',
        valor: contacto.schedule,
      })
  }
  const visibles = canalesVisibles.length > 0 ? canalesVisibles : canales

  /*
    El asunto es un `select` de opciones fijas, así que se manda su texto y no
    su id: quien lea la consulta en el panel tiene que entenderlo sin consultar
    ninguna tabla de equivalencias.
  */
  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (despachando) return

    const datos = new FormData(e.currentTarget)
    const idAsunto = String(datos.get('asunto') ?? '')
    const asunto = asuntos.find((a) => a.id === idAsunto)?.texto ?? 'Consulta desde la web'

    setDespachando(true)
    setError(null)
    try {
      await contactar({
        name: String(datos.get('nombre') ?? '').trim(),
        email: String(datos.get('correo') ?? '').trim(),
        subject: asunto,
        body: String(datos.get('mensaje') ?? '').trim(),
      })
      setEnviado(true)
      e.currentTarget.reset()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos enviar tu mensaje. Inténtalo otra vez en un momento.',
      )
    } finally {
      setDespachando(false)
    }
  }

  return (
    <section id="contacto" className="seccion py-24">
      <div className="contenedor flex flex-col items-center gap-10">
        <Revelar className="flex flex-col items-center text-center">
          <h2 className="font-titulo text-portada font-extrabold leading-tight text-texto-principal">
            ¿Hablamos?
          </h2>
          <p className="mt-3 max-w-[620px] text-cuerpo-amplio text-texto-secundario">
            Escríbenos si algo no te cuadra, si encontraste un error o si se te ocurrió
            algo que Bolsillo debería hacer.
          </p>
        </Revelar>

        <Revelar className="w-full" retraso={0.1}>
          <div className="vidrio grid overflow-hidden rounded-maximo lg:grid-cols-[1fr_1.3fr]">
            {/* Canales: los datos duros, los que hoy salen de la muestra. */}
            <aside className="flex flex-col gap-8 bg-lavanda-950 px-8 py-12 text-texto-inverso md:px-10">
              <div>
                <p className="text-micro font-semibold uppercase tracking-[0.08em]">
                  Dónde encontrarnos
                </p>
                <p className="mt-3 text-cuerpo leading-relaxed text-texto-inverso/65">
                  Somos un equipo pequeño en Quito. Respondemos todos los mensajes,
                  aunque a veces nos tome un par de días.
                </p>
              </div>

              <ul className="flex flex-col gap-6">
                {visibles.map((canal) => {
                  const IconoCanal = iconos[canal.clase]
                  return (
                    <li key={canal.id} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="grid size-10 shrink-0 place-items-center rounded-medio bg-white/10"
                      >
                        <IconoCanal size={20} weight="regular" />
                      </span>
                      <div>
                        <p className="text-nota text-texto-inverso/55">{canal.etiqueta}</p>
                        {canal.enlace ? (
                          <a
                            href={canal.enlace}
                            className="text-cuerpo font-medium transition-colors hover:text-lavanda-300"
                          >
                            {canal.valor}
                          </a>
                        ) : (
                          <p className="text-cuerpo font-medium">{canal.valor}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </aside>

            {/*
              Formulario. Hoy no envía nada: el `preventDefault` está a la espera
              del endpoint del backend, igual que el de SeccionRegistro.
            */}
            <form
              className="flex flex-col gap-4 bg-fondo-superficie/70 px-8 py-12 md:px-10"
              onSubmit={enviar}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contacto-nombre" className="text-nota font-medium text-texto-secundario">
                    Tu nombre
                  </label>
                  <input
                    id="contacto-nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    className={`mt-1.5 h-[52px] ${campo}`}
                  />
                </div>

                <div>
                  <label htmlFor="contacto-correo" className="text-nota font-medium text-texto-secundario">
                    Tu correo
                  </label>
                  <input
                    id="contacto-correo"
                    name="correo"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@correo.com"
                    className={`mt-1.5 h-[52px] ${campo}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contacto-asunto" className="text-nota font-medium text-texto-secundario">
                  Asunto
                </label>
                <select
                  id="contacto-asunto"
                  name="asunto"
                  defaultValue=""
                  className={`mt-1.5 h-[52px] ${campo}`}
                >
                  <option value="" disabled>
                    Elige una opción
                  </option>
                  {asuntos.map((asunto) => (
                    <option key={asunto.id} value={asunto.id}>
                      {asunto.texto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contacto-mensaje" className="text-nota font-medium text-texto-secundario">
                  Tu mensaje
                </label>
                <textarea
                  id="contacto-mensaje"
                  name="mensaje"
                  rows={5}
                  placeholder="Cuéntanos qué pasó o qué se te ocurrió."
                  className={`mt-1.5 resize-y py-3 ${campo}`}
                />
              </div>

              {enviado && (
                <p
                  role="status"
                  className="rounded-grande bg-ingreso-sutil px-4 py-3 text-nota text-ingreso"
                >
                  Recibido. Te contestamos al correo que nos dejaste.
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-grande bg-gasto-sutil px-4 py-3 text-nota text-gasto">
                  {error}
                </p>
              )}

              <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-nota text-texto-tenue">
                  Te respondemos al correo que nos dejes.
                </p>
                <BotonEnviar despachando={despachando} className="w-full sm:w-auto">
                  {despachando ? 'Enviando…' : 'Enviar mensaje'}
                </BotonEnviar>
              </div>
            </form>
          </div>
        </Revelar>
      </div>
    </section>
  )
}
