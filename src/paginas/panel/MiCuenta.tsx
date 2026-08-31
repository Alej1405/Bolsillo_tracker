import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircleIcon, SignOutIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Campo } from '@/paginas/acceso'
import { ErrorApi } from '@/services/api'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { useAppStore } from '@/stores/useAppStore'

/** Bloque con título y su explicación, para no repetir la cabecera cuatro veces. */
function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
          {titulo}
        </h3>
        <p className="text-nota text-texto-tenue">{descripcion}</p>
      </div>
      {children}
    </section>
  )
}

/**
 * Mi cuenta: quién eres, cómo entras y cómo te vas.
 *
 * El correo se muestra pero no se edita: identifica la cuenta y el backend no
 * lo acepta en el `PATCH`. Enseñarlo en un campo deshabilitado sería prometer
 * algo que no existe, así que va como dato.
 */
export function MiCuenta() {
  const navegar = useNavigate()
  const usuario = useAppStore((e) => e.usuario)
  const guardando = useAppStore((e) => e.guardandoPerfil)
  const cambiarNombre = useAppStore((e) => e.cambiarNombre)
  const cambiarContrasena = useAppStore((e) => e.cambiarContrasena)
  const darDeBaja = useAppStore((e) => e.darDeBajaMiCuenta)
  const salir = useAppStore((e) => e.salir)
  const limpiarDashboard = useAppStore((e) => e.limpiarDashboard)

  const [nombre, setNombre] = useState(usuario?.full_name ?? '')
  const [errorNombre, setErrorNombre] = useState<string | null>(null)
  const [nombreListo, setNombreListo] = useState(false)

  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [errorClave, setErrorClave] = useState<{ actual?: string; nueva?: string }>({})
  const [claveLista, setClaveLista] = useState(false)

  const [bajaAbierta, setBajaAbierta] = useState(false)
  const [errorBaja, setErrorBaja] = useState<string | null>(null)

  const guardarNombre = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorNombre(null)
    setNombreListo(false)

    const limpio = nombre.trim()
    if (limpio.length < 2) return setErrorNombre('Mínimo 2 caracteres')
    if (limpio.length > 120) return setErrorNombre('Máximo 120 caracteres')

    try {
      await cambiarNombre({ full_name: limpio })
      setNombreListo(true)
    } catch (error) {
      setErrorNombre(error instanceof Error ? error.message : 'No pudimos guardar el nombre.')
    }
  }

  const guardarClave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorClave({})
    setClaveLista(false)

    const fallos: typeof errorClave = {}
    if (!actual) fallos.actual = 'Escribe tu contraseña actual'
    if (nueva.length < 8) fallos.nueva = 'Mínimo 8 caracteres'
    else if (!/[a-zA-Z]/.test(nueva) || !/\d/.test(nueva))
      fallos.nueva = 'Necesita al menos una letra y un número'
    if (Object.keys(fallos).length > 0) return setErrorClave(fallos)

    try {
      await cambiarContrasena({ current_password: actual, new_password: nueva })
      setActual('')
      setNueva('')
      setClaveLista(true)
    } catch (error) {
      /*
        El 401 aquí no es "sesión caducada": es que la contraseña actual no
        coincide. Va sobre ese campo, que es donde se arregla.
      */
      if (error instanceof ErrorApi && error.estado === 401) {
        setErrorClave({ actual: 'Esa no es tu contraseña actual' })
        return
      }
      setErrorClave({
        nueva: error instanceof Error ? error.message : 'No pudimos cambiar la contraseña.',
      })
    }
  }

  const cerrarSesion = () => {
    limpiarDashboard()
    salir()
    navegar('/login', { replace: true })
  }

  const confirmarBaja = async () => {
    setErrorBaja(null)
    try {
      await darDeBaja()
      navegar('/', { replace: true })
    } catch (error) {
      setErrorBaja(error instanceof Error ? error.message : 'No pudimos dar de baja la cuenta.')
    }
  }

  return (
    <section className="vidrio flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Mi cuenta</h2>
        <p className="text-nota text-texto-tenue">
          {usuario?.email ?? 'Sin sesión'}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Bloque titulo="Tu nombre" descripcion="Es lo que aparece en el panel.">
          <form onSubmit={guardarNombre} className="flex flex-col gap-4">
            <Campo
              id="nombre-cuenta"
              etiqueta="Nombre"
              placeholder="Tu nombre"
              ayuda="El correo no se cambia: identifica tu cuenta."
              valor={nombre}
              onCambio={(v) => {
                setNombre(v)
                setNombreListo(false)
              }}
              error={errorNombre ?? undefined}
            />
            {nombreListo && (
              <p role="status" className="flex items-center gap-2 text-nota text-ingreso">
                <CheckCircleIcon size={16} weight="fill" aria-hidden />
                Guardado.
              </p>
            )}
            <Boton type="submit" disabled={guardando} tamano="mediano">
              {guardando ? 'Guardando…' : 'Guardar nombre'}
            </Boton>
          </form>
        </Bloque>

        <Bloque
          titulo="Tu contraseña"
          descripcion="Pedimos la actual además de la nueva: sin eso, cualquiera con tu sesión abierta se queda con la cuenta."
        >
          <form onSubmit={guardarClave} className="flex flex-col gap-4">
            <Campo
              id="clave-actual"
              etiqueta="Contraseña actual"
              tipo="password"
              placeholder="La que usas hoy"
              ayuda=""
              valor={actual}
              onCambio={setActual}
              error={errorClave.actual}
              autoComplete="current-password"
            />
            <Campo
              id="clave-nueva"
              etiqueta="Contraseña nueva"
              tipo="password"
              placeholder="Mínimo 8 caracteres"
              ayuda="Al menos una letra y un número."
              valor={nueva}
              onCambio={setNueva}
              error={errorClave.nueva}
              autoComplete="new-password"
            />
            {claveLista && (
              <p role="status" className="flex items-center gap-2 text-nota text-ingreso">
                <CheckCircleIcon size={16} weight="fill" aria-hidden />
                Contraseña cambiada.
              </p>
            )}
            <Boton type="submit" disabled={guardando} tamano="mediano">
              {guardando ? 'Guardando…' : 'Cambiar contraseña'}
            </Boton>
          </form>
        </Bloque>
      </div>

      <Bloque
        titulo="Salir e irte"
        descripcion="Cerrar sesión no borra nada. Dar de baja desactiva la cuenta y conserva tus datos."
      >
        <div className="flex flex-wrap gap-3">
          <Boton variante="secundario" onClick={cerrarSesion} tamano="mediano">
            <SignOutIcon size={18} aria-hidden />
            Cerrar sesión
          </Boton>
          <Boton variante="peligro" onClick={() => setBajaAbierta(true)} tamano="mediano">
            Dar de baja mi cuenta
          </Boton>
        </div>
      </Bloque>

      <Modal
        abierto={bajaAbierta}
        onCerrar={() => setBajaAbierta(false)}
        titulo="Dar de baja la cuenta"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-extra bg-aviso-sutil px-5 py-4">
            <WarningCircleIcon size={20} weight="fill" aria-hidden className="mt-0.5 text-aviso" />
            <p className="flex-1 text-cuerpo leading-relaxed text-texto-principal">
              Tu cuenta queda desactivada y dejas de poder entrar. Tus bolsillos y movimientos se
              conservan, pero <strong className="font-semibold">solo un administrador puede
              reactivarla</strong>: registrarte otra vez con este correo no crea una cuenta nueva.
            </p>
          </div>

          {errorBaja && (
            <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
              {errorBaja}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Boton variante="peligro" onClick={() => void confirmarBaja()} disabled={guardando}>
              {guardando ? 'Dando de baja…' : 'Sí, dar de baja'}
            </Boton>
            <Boton variante="secundario" onClick={() => setBajaAbierta(false)}>
              Cancelar
            </Boton>
          </div>
        </div>
      </Modal>
    </section>
  )
}
