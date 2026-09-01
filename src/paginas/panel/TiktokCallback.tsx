import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { canjearCodigoTiktok } from '@/services/SitioService'
import { Boton } from '@/ui/Boton'

/**
 * La vuelta del flujo de TikTok.
 *
 * TikTok manda aquí con un `code` de un solo uso y el `state` que le dimos al
 * salir. Esta pantalla cambia ese código por las llaves y devuelve a los
 * ajustes.
 *
 * El `state` se compara con el que se guardó antes de salir: si no coinciden,
 * la vuelta no la provocó esta aplicación y no se canjea nada. Es lo que impide
 * que alguien complete el flujo con un enlace preparado desde fuera.
 */
export function TiktokCallback() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  /*
    El código de TikTok sirve una sola vez. En desarrollo React monta dos veces
    en modo estricto, y sin esta guarda el segundo intento fallaría con un error
    confuso sobre un código ya usado.
  */
  const yaCanjeado = useRef(false)

  useEffect(() => {
    if (yaCanjeado.current) return
    yaCanjeado.current = true

    const code = params.get('code')
    const state = params.get('state')
    const esperado = sessionStorage.getItem('tiktok_state')
    sessionStorage.removeItem('tiktok_state')

    if (params.get('error')) {
      setError(params.get('error_description') ?? 'TikTok canceló la autorización.')
      return
    }
    if (!code) {
      setError('TikTok no devolvió ningún código.')
      return
    }
    if (!esperado || state !== esperado) {
      setError('La vuelta de TikTok no coincide con lo que enviamos. No se guardó nada.')
      return
    }

    canjearCodigoTiktok(code, `${window.location.origin}/tiktok/callback`)
      .then(() => setListo(true))
      .catch((e) => setError(e instanceof Error ? e.message : 'No pudimos terminar la conexión.'))
  }, [params])

  /* Con todo bien no hay nada que leer: se vuelve a los ajustes. */
  useEffect(() => {
    if (!listo) return
    const t = window.setTimeout(() => navegar('/sitio', { replace: true }), 1200)
    return () => window.clearTimeout(t)
  }, [listo, navegar])

  return (
    <section className="vidrio-transparente flex flex-1 flex-col items-center justify-center gap-4 rounded-maximo p-10 text-center">
      {error ? (
        <>
          <WarningCircleIcon size={40} weight="fill" aria-hidden className="text-gasto" />
          <p className="text-cuerpo text-texto-principal">{error}</p>
          <Boton to="/sitio" variante="secundario">
            Volver a los ajustes
          </Boton>
        </>
      ) : listo ? (
        <>
          <CheckCircleIcon size={40} weight="fill" aria-hidden className="text-ingreso" />
          <p className="text-cuerpo text-texto-principal">
            Cuenta conectada. Ya puedes traer los vídeos.
          </p>
        </>
      ) : (
        <p className="text-cuerpo text-texto-secundario">Terminando la conexión con TikTok…</p>
      )}
    </section>
  )
}
