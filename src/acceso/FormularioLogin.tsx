import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/acceso/Campo'
import { ErrorApi, ErrorDeRed } from '@/services/api'
import { useAppStore } from '@/stores/useAppStore'
import { VACIO_LOGIN, validarLogin } from '@/acceso/reglas'
import type { Errores } from '@/acceso/reglas'
import type { DatosLogin } from '@/types'

/** Entrar con una cuenta que ya existe. */
export function FormularioLogin() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const entrar = useAppStore((e) => e.entrar)
  const enviando = useAppStore((e) => e.cargando)

  const [datos, setDatos] = useState<DatosLogin>(VACIO_LOGIN)
  const [errores, setErrores] = useState<Errores<DatosLogin>>({})
  const [tocado, setTocado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const cambiar = (campo: keyof DatosLogin) => (valor: string) => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    if (tocado) setErrores(validarLogin(siguiente))
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setTocado(true)
    setAviso(null)

    const fallos = validarLogin(datos)
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    try {
      await entrar(datos)
      /*
        Vuelve a donde iba, si `RutaProtegida` lo mandó aquí. Sin esto, quien
        abre un enlace a una pantalla interna sin sesión acaba en otro sitio
        después de entrar, y tiene que volver a buscarla.
      */
      const desde = typeof (state as { desde?: unknown })?.desde === 'string'
        ? (state as { desde: string }).desde
        : '/dashboard'
      navegar(desde, { replace: true })
    } catch (error) {
      /*
        Credenciales malas llegan como 401 UNAUTHORIZED y se muestran como
        aviso general, nunca sobre un campo: el backend no distingue entre
        "ese correo no existe" y "la contraseña está mal", y a propósito —
        distinguirlo permitiría averiguar qué correos están registrados.
      */
      if (error instanceof ErrorDeRed || error instanceof ErrorApi) setAviso(error.message)
      else setAviso('Algo salió mal. Inténtalo de nuevo.')
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex w-full flex-col gap-5">
      <div className="text-left">
        <h1 className="font-titulo text-titulo-mayor font-bold tracking-[-0.02em] text-texto-principal">
          Entra a tu billetera
        </h1>
        <p className="mt-1 text-cuerpo text-texto-secundario">
          Con el correo y la contraseña que usaste al crear la cuenta.
        </p>
      </div>

      <Campo
        id="login-correo"
        name="email"
        etiqueta="Tu correo"
        tipo="email"
        placeholder="nombre@correo.com"
        ayuda="El que usaste al registrarte"
        autoComplete="email"
        valor={datos.email}
        onCambio={cambiar('email')}
        error={errores.email}
      />
      <Campo
        id="login-clave"
        name="password"
        etiqueta="Tu contraseña"
        tipo="password"
        placeholder="Escribe tu clave"
        ayuda="¿La olvidaste? Te ayudamos"
        autoComplete="current-password"
        valor={datos.password}
        onCambio={cambiar('password')}
        error={errores.password}
      />

      {aviso && (
        <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
          {aviso}
        </p>
      )}

      <Boton
        type="submit"
        disabled={enviando}
        className="w-full disabled:pointer-events-none disabled:opacity-60"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </Boton>
    </form>
  )
}
