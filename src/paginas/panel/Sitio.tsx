import { useEffect, useState } from 'react'
import {
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { foco, accionDestructiva } from '@/helpers'
import { urlDeAutorizacionTiktok } from '@/services/SitioService'
import { Boton } from '@/ui/Boton'
import { Bloque } from '@/ui/Bloque'
import { useAppStore } from '@/stores/useAppStore'

const campo = `h-11 w-full rounded-grande border border-borde-fuerte bg-fondo-superficie px-4 text-cuerpo text-texto-principal outline-none placeholder:text-texto-tenue ${foco}`

/*
  A dónde vuelve TikTok después de autorizar. Tiene que ser exactamente la misma
  URL que esté registrada en el panel de TikTok for Developers: si difiere en
  una barra, el flujo falla con un error que no explica por qué.

  Se calcula del origen actual para que funcione igual en desarrollo y en
  producción sin tocar el código.
*/
function urlDeVuelta(): string {
  return `${window.location.origin}/tiktok/callback`
}

/** Un campo de texto con su etiqueta y su ayuda. */
function Campo({
  id,
  etiqueta,
  valor,
  onCambio,
  placeholder,
  ayuda,
  tipo = 'text',
}: {
  id: string
  etiqueta: string
  valor: string
  onCambio: (v: string) => void
  placeholder?: string
  ayuda?: string
  tipo?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-nota font-medium text-texto-principal">
        {etiqueta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className={campo}
      />
      {ayuda && <p className="text-micro text-texto-tenue">{ayuda}</p>}
    </div>
  )
}

/**
 * Ajustes de la web. Solo los ve `super_admin`.
 *
 * Dos cosas que antes vivían escritas en el código del frontend y obligaban a
 * un despliegue para cambiar un número de teléfono: los datos de contacto y los
 * vídeos de TikTok.
 *
 * De TikTok no se muestra nunca el secreto ni los tokens, ni siquiera al
 * administrador: el backend dice si están puestos, no cuánto valen. Un secreto
 * que sale una vez por la API ya está fuera.
 */
export function Sitio() {
  const contacto = useAppStore((e) => e.contacto)
  const guardando = useAppStore((e) => e.guardandoContacto)
  const cargarContacto = useAppStore((e) => e.cargarContacto)
  const guardarContacto = useAppStore((e) => e.guardarContacto)

  const tiktok = useAppStore((e) => e.tiktok)
  const videos = useAppStore((e) => e.videosAdmin)
  const sincronizando = useAppStore((e) => e.sincronizando)
  const cargarTiktok = useAppStore((e) => e.cargarTiktok)
  const cargarVideosAdmin = useAppStore((e) => e.cargarVideosAdmin)
  const guardarCredenciales = useAppStore((e) => e.guardarCredenciales)
  const sincronizar = useAppStore((e) => e.sincronizar)
  const desconectar = useAppStore((e) => e.desconectar)
  const cambiarVisibilidad = useAppStore((e) => e.cambiarVisibilidad)
  const agregarVideo = useAppStore((e) => e.agregarVideo)
  const quitarVideo = useAppStore((e) => e.quitarVideo)

  const [datos, setDatos] = useState({
    phone: '',
    email: '',
    address: '',
    schedule: '',
    whatsapp: '',
    instagram: '',
    tiktok: '',
  })
  const [clave, setClave] = useState('')
  const [secreto, setSecreto] = useState('')
  const [enlace, setEnlace] = useState('')
  const [pegando, setPegando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void cargarContacto()
    void cargarTiktok()
    void cargarVideosAdmin()
  }, [cargarContacto, cargarTiktok, cargarVideosAdmin])

  /*
    El formulario se rellena con lo que llegó, una vez. No es estado derivado
    que se recalcule en cada render: la persona va a escribir encima, y
    reconstruirlo desde el store le borraría lo que está tecleando.
  */
  useEffect(() => {
    if (!contacto) return
    setDatos({
      phone: contacto.phone ?? '',
      email: contacto.email ?? '',
      address: contacto.address ?? '',
      schedule: contacto.schedule ?? '',
      whatsapp: contacto.whatsapp ?? '',
      instagram: contacto.instagram ?? '',
      tiktok: contacto.tiktok ?? '',
    })
  }, [contacto])

  const cambiar = (campo: keyof typeof datos) => (v: string) =>
    setDatos((d) => ({ ...d, [campo]: v }))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)
    setError(null)
    try {
      await guardarContacto(datos)
      setAviso('Guardado. La web ya muestra estos datos.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los datos.')
    }
  }

  const guardarLlaves = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)
    setError(null)
    try {
      await guardarCredenciales({ client_key: clave.trim(), client_secret: secreto.trim() })
      setClave('')
      setSecreto('')
      setAviso('Credenciales guardadas. Ahora conecta la cuenta.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar las credenciales.')
    }
  }

  /*
    Conectar abre TikTok en la misma pestaña: es un flujo de autorización y hay
    que volver aquí con el código. El `state` se guarda antes de salir para
    poder compararlo al volver.
  */
  const conectar = async () => {
    setError(null)
    try {
      const { url, state } = await urlDeAutorizacionTiktok(urlDeVuelta())
      sessionStorage.setItem('tiktok_state', state)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos empezar la conexión.')
    }
  }

  const traerVideos = async () => {
    setAviso(null)
    setError(null)
    try {
      const traidos = await sincronizar()
      setAviso(`Listo: ${traidos} ${traidos === 1 ? 'vídeo traído' : 'vídeos traídos'} de TikTok.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos traer los vídeos.')
    }
  }

  const pegarEnlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enlace.trim()) return
    setAviso(null)
    setError(null)
    setPegando(true)
    try {
      await agregarVideo(enlace.trim())
      setEnlace('')
      setAviso('Vídeo agregado. Ya sale en la web.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos leer ese enlace.')
    } finally {
      setPegando(false)
    }
  }

  const quitar = async (videoId: string) => {
    setAviso(null)
    setError(null)
    try {
      await quitarVideo(videoId)
      setAviso('Vídeo quitado de la web. En TikTok sigue donde estaba.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos quitarlo.')
    }
  }

  const soltar = async () => {
    setAviso(null)
    try {
      await desconectar()
      setAviso('Cuenta desconectada. Los vídeos ya traídos siguen en la web.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos desconectar.')
    }
  }

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
          Ajustes de la web
        </h2>
        <p className="text-nota text-texto-tenue">Lo que ve quien entra a bolsillo desde fuera</p>
      </div>

      {aviso && (
        <p role="status" className="flex items-center gap-2 rounded-extra bg-ingreso-sutil px-5 py-4 text-cuerpo text-ingreso">
          <CheckCircleIcon size={18} weight="fill" aria-hidden />
          {aviso}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-extra bg-gasto-sutil px-5 py-4 text-cuerpo text-texto-principal">
          <WarningCircleIcon size={18} weight="fill" aria-hidden className="mt-0.5 text-gasto" />
          {error}
        </p>
      )}

      <Bloque
        titulo="Datos de contacto"
        descripcion="Aparecen en la sección de contacto de la landing. Cambiarlos aquí los cambia en la web al instante."
      >
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Campo id="c-phone" etiqueta="Teléfono" valor={datos.phone} onCambio={cambiar('phone')} placeholder="+593 99 000 0000" />
            <Campo id="c-email" etiqueta="Correo" tipo="email" valor={datos.email} onCambio={cambiar('email')} placeholder="hola@mashaec.net" />
            <Campo id="c-address" etiqueta="Dirección" valor={datos.address} onCambio={cambiar('address')} placeholder="Quito, Ecuador" />
            <Campo id="c-schedule" etiqueta="Horario" valor={datos.schedule} onCambio={cambiar('schedule')} placeholder="Lunes a viernes, 9:00 a 18:00" />
            <Campo id="c-whatsapp" etiqueta="WhatsApp" valor={datos.whatsapp} onCambio={cambiar('whatsapp')} placeholder="593990000000" ayuda="Solo números, con el código del país." />
            <Campo id="c-instagram" etiqueta="Instagram" valor={datos.instagram} onCambio={cambiar('instagram')} placeholder="@bolsillo" />
            <Campo id="c-tiktok" etiqueta="TikTok" valor={datos.tiktok} onCambio={cambiar('tiktok')} placeholder="@bolsillo" />
          </div>
          <Boton type="submit" disabled={guardando} tamano="mediano" className="self-start">
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </Boton>
        </form>
      </Bloque>

      <Bloque
        titulo="TikTok"
        descripcion="Conecta la cuenta para que la sección de TikToks muestre los vídeos reales en vez de marcadores."
      >
        <div className="flex flex-col gap-5">
          {/* El estado, en una línea, antes de cualquier formulario. */}
          <div className="flex flex-wrap items-center gap-3 rounded-extra bg-fondo-sutil px-4 py-3">
            <span
              className={`rounded-full px-3 py-1 text-micro font-medium uppercase ${
                tiktok?.connected
                  ? 'bg-ingreso-sutil text-ingreso'
                  : tiktok?.configured
                    ? 'bg-aviso-sutil text-aviso'
                    : 'bg-fondo-superficie text-texto-tenue'
              }`}
            >
              {tiktok?.connected ? 'conectado' : tiktok?.configured ? 'falta conectar' : 'sin configurar'}
            </span>
            <p className="flex-1 text-nota text-texto-secundario">
              {tiktok?.connected
                ? `Cuenta ${tiktok.display_name ?? 'autorizada'} · ${tiktok.videos} vídeos guardados`
                : tiktok?.configured
                  ? 'Las credenciales están puestas. Falta autorizar la cuenta.'
                  : 'Pega la Client Key y el Client Secret de TikTok for Developers.'}
            </p>
          </div>

          {/*
            Pegar un enlace es el camino corto y no necesita nada de lo de
            abajo: el título y la portada salen del oEmbed público de TikTok,
            que funciona con cualquier vídeo público sin credenciales.

            Va primero por eso mismo: resuelve el caso de la mayoría sin pedir
            registrar una aplicación ni autorizar una cuenta.
          */}
          <form onSubmit={pegarEnlace} className="flex flex-col gap-3 rounded-extra bg-fondo-sutil p-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tk-enlace" className="text-nota font-medium text-texto-principal">
                Pegar el enlace de un vídeo
              </label>
              <div className="flex flex-wrap gap-3">
                <input
                  id="tk-enlace"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  placeholder="https://www.tiktok.com/@tucuenta/video/712345…"
                  className={`${campo} min-w-[260px] flex-1`}
                />
                <Boton type="submit" tamano="mediano" disabled={pegando || !enlace.trim()}>
                  {pegando ? 'Leyendo…' : 'Agregar vídeo'}
                </Boton>
              </div>
              <p className="text-micro text-texto-tenue">
                Copia el enlace desde TikTok con «Compartir → Copiar enlace». No hace falta
                conectar la cuenta: esto funciona con cualquier vídeo público.
              </p>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-borde-sutil" />
            <span className="text-micro text-texto-tenue uppercase">o conecta la cuenta</span>
            <span className="h-px flex-1 bg-borde-sutil" />
          </div>

          {/*
            Las credenciales se piden siempre, incluso si ya hay unas: no se
            pueden mostrar las guardadas —el backend no las devuelve— así que
            el campo vacío significa "no las cambies", no "no hay".
          */}
          <form onSubmit={guardarLlaves} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo
                id="tk-key"
                etiqueta="Client Key"
                valor={clave}
                onCambio={setClave}
                placeholder="aw..."
                ayuda={tiktok?.client_key ? `Ahora: ${tiktok.client_key}` : 'La da TikTok al registrar la app.'}
              />
              <Campo
                id="tk-secret"
                etiqueta="Client Secret"
                tipo="password"
                valor={secreto}
                onCambio={setSecreto}
                placeholder="••••••••"
                ayuda="No se muestra nunca, ni siquiera aquí. Escríbelo para cambiarlo."
              />
            </div>
            <Boton
              type="submit"
              variante="secundario"
              tamano="mediano"
              disabled={!clave.trim() || !secreto.trim()}
              className="self-start"
            >
              Guardar credenciales
            </Boton>
          </form>

          <div className="flex flex-wrap gap-3">
            <Boton onClick={() => void conectar()} disabled={!tiktok?.configured} tamano="mediano">
              <LinkSimpleIcon size={16} aria-hidden />
              {tiktok?.connected ? 'Volver a conectar' : 'Conectar cuenta'}
            </Boton>
            <Boton
              variante="secundario"
              tamano="mediano"
              onClick={() => void traerVideos()}
              disabled={!tiktok?.connected || sincronizando}
            >
              <ArrowsClockwiseIcon size={16} aria-hidden />
              {sincronizando ? 'Trayendo…' : 'Traer vídeos'}
            </Boton>
            {tiktok?.connected && (
              <Boton variante="secundario" tamano="mediano" onClick={() => void soltar()}>
                Desconectar
              </Boton>
            )}
          </div>

          <p className="text-micro text-texto-tenue">
            En TikTok for Developers, la URL de redirección tiene que ser exactamente{' '}
            <strong className="font-semibold">{urlDeVuelta()}</strong>. Si difiere en una barra, el
            flujo falla sin decir por qué.
          </p>

          {videos.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">
                Vídeos guardados
              </p>
              {videos.map((v) => (
                <div
                  key={v.video_id}
                  className="flex flex-wrap items-center gap-3 rounded-grande bg-fondo-superficie px-4 py-3"
                >
                  {v.cover_url && (
                    <img
                      src={v.cover_url}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded-medio object-cover"
                    />
                  )}
                  <p className="min-w-0 flex-1 truncate text-nota text-texto-principal">
                    {v.title || 'Sin título'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void cambiarVisibilidad(v.video_id, !v.visible)}
                    title={v.visible ? 'Esconder de la web' : 'Mostrar en la web'}
                    className={`grid size-11 place-items-center rounded-medio border border-borde-fuerte text-texto-secundario transition-colors hover:bg-fondo-sutil ${foco}`}
                  >
                    {v.visible ? <EyeIcon size={18} aria-hidden /> : <EyeSlashIcon size={18} aria-hidden />}
                    <span className="sr-only">
                      {v.visible ? 'Esconder' : 'Mostrar'} {v.title || 'este vídeo'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void quitar(v.video_id)}
                    title="Quitar de la lista"
                    className={accionDestructiva}
                  >
                    <TrashIcon size={18} aria-hidden />
                    <span className="sr-only">Quitar {v.title || 'este vídeo'} de la web</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Bloque>
    </section>
  )
}
