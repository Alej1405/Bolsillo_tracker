import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, CircleIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { Campo } from '@/paginas/acceso/Campo'
import { ErrorApi, ErrorDeRed } from '@/services/api'
import { useAppStore } from '@/stores/useAppStore'
import type { DatosRegistro, Usuario } from '@/types'
import {
  CAMPOS,
  REQUISITOS,
  VACIO_REGISTRO,
  claveCompleta,
  correoDeLaLanding,
  validarRegistro,
} from '@/paginas/acceso/reglas'
import type { Errores } from '@/paginas/acceso/reglas'

/**
 * Los requisitos de la contraseña, marcándose mientras se escribe.
 *
 * En gris son una lista de lo que hace falta; en verde, lo que ya está. Solo
 * se ponen en rojo después de un intento de envío: mientras el usuario teclea
 * no ha hecho nada mal todavía, y marcarle en rojo lo que aún no termina de
 * escribir es regañarlo por ir a medias.
 */
function RequisitosClave({ clave, marcarFallos }: { clave: string; marcarFallos: boolean }) {
  return (
    <ul className="flex flex-col gap-1" aria-live="polite">
      {REQUISITOS.map((requisito) => {
        const ok = requisito.cumple(clave)
        return (
          <li
            key={requisito.id}
            className={`flex items-center gap-1.5 ${
              ok ? 'text-ingreso' : marcarFallos ? 'text-gasto' : 'text-texto-tenue'
            }`}
          >
            {ok ? (
              <CheckCircleIcon size={14} weight="fill" aria-hidden />
            ) : (
              <CircleIcon size={14} aria-hidden />
            )}
            {/* El estado va en el texto y no solo en el color: quien no
                distingue verde de rojo tiene que poder leerlo igual. */}
            <span>
              {requisito.texto}
              <span className="sr-only">{ok ? ' (cumplido)' : ' (pendiente)'}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function FormularioRegistro() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const crearCuenta = useAppStore((e) => e.crearCuenta)
  const enviando = useAppStore((e) => e.cargando)
  /*
    El correo de la landing es solo el valor inicial: a partir de ahí el campo
    es del usuario. Va en el inicializador de `useState` y no en un
    `useEffect`, para que no llegue un fotograma tarde ni pise lo que el
    usuario ya haya escrito si el componente se vuelve a renderizar.
  */
  const [datos, setDatos] = useState<DatosRegistro>(() => ({
    ...VACIO_REGISTRO,
    email: correoDeLaLanding(state),
  }))
  const [errores, setErrores] = useState<Errores<DatosRegistro>>({})
  const [tocado, setTocado] = useState(false)
  /** Fallo que no pertenece a ningún campo: correo repetido, red, 500. */
  const [aviso, setAviso] = useState<string | null>(null)
  /*
    El usuario que devolvió el backend. Solo se llena cuando la cuenta quedó
    escrita en la base: es la confirmación, no una suposición. Mientras valga
    null no hay nada que celebrar.
  */
  const [creado, setCreado] = useState<Usuario | null>(null)

  /*
    Los errores solo aparecen después del primer envío. Validar mientras se
    escribe marca en rojo una contraseña que el usuario todavía está tecleando,
    y eso regaña en vez de ayudar. Una vez enviado sí se revalida en cada
    tecla: ahí el rojo ya está puesto y lo útil es verlo desaparecer.
  */
  const cambiar = (campo: keyof DatosRegistro) => (valor: string) => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    if (tocado) setErrores(validarRegistro(siguiente))
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setTocado(true)
    setAviso(null)

    const fallos = validarRegistro(datos)
    setErrores(fallos)
    // La contraseña se comprueba aparte: sus tres requisitos ya no viven en
    // `validarRegistro`, sino en la lista que el usuario tiene delante.
    if (Object.keys(fallos).length > 0 || !claveCompleta(datos.password)) return

    try {
      const user = await crearCuenta({ ...datos, full_name: datos.full_name.trim() })
      /*
        Se muestra el aviso en vez de navegar. `user` viene del 201 del
        backend, o sea con la fila ya confirmada en la base: si hubiera
        fallado el commit, esto no se habría ejecutado y estaríamos en el
        catch. La navegación la decide el usuario al cerrarlo.
      */
      setCreado(user)
    } catch (error) {
      if (error instanceof ErrorDeRed) {
        setAviso(error.message)
      } else if (error instanceof ErrorApi) {
        /*
          El backend distingue los fallos por código, no por texto (están en
          app/core/errors.py). VALIDATION_ERROR trae `details` con el campo
          exacto; el resto son avisos de formulario completo.
        */
        if (error.codigo === 'VALIDATION_ERROR' && error.campos.length > 0) {
          const porCampo: Errores<DatosRegistro> = {}
          let sueltos = false
          for (const fallo of error.campos) {
            const campo = CAMPOS[fallo.field]
            if (campo) porCampo[campo] = fallo.message
            else sueltos = true
          }
          setErrores(porCampo)
          if (sueltos || Object.keys(porCampo).length === 0) setAviso(error.message)
        } else {
          setAviso(error.message)
        }
      } else {
        setAviso('Algo salió mal. Inténtalo de nuevo.')
      }
    }
  }

  return (
    <>
      <Modal
        abierto={creado !== null}
        onCerrar={() => navegar('/dashboard')}
        titulo="Tu cuenta está creada"
      >
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-ingreso-sutil text-ingreso">
            <CheckCircleIcon size={32} weight="fill" aria-hidden />
          </span>

          <h2 className="mt-4 font-titulo text-titulo-menor font-bold text-texto-principal">
            {/* Solo el primer nombre, igual que en el correo. */}
            Listo, {creado?.full_name.trim().split(' ')[0]}
          </h2>
          <p className="mt-2 text-cuerpo leading-relaxed text-texto-secundario">
            Tu cuenta quedó creada. Te enviamos un correo de bienvenida a:
          </p>

          {/*
            El correo se muestra tal como quedó guardado, no como se escribió
            en el formulario: si el backend lo normalizó, aquí se ve lo que de
            verdad hay en la base, que es adonde llegará el mensaje.

            `break-all` porque un correo largo sin espacios desborda la caja y
            se sale del diálogo.
          */}
          <p className="mt-3 w-full break-all rounded-medio bg-fondo-sutil px-4 py-2.5 text-cuerpo font-medium text-texto-principal">
            {creado?.email}
          </p>

          <p className="mt-4 flex items-start gap-2 text-left text-nota leading-relaxed text-texto-tenue">
            <EnvelopeSimpleIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Si no lo ves en unos minutos, <strong className="font-semibold">revisa la
              carpeta de spam</strong> o correo no deseado. Es un dominio nuevo y a veces
              los primeros correos acaban ahí.
            </span>
          </p>

          <Boton onClick={() => navegar('/dashboard')} className="mt-6 w-full">
            Continuar
          </Boton>
        </div>
      </Modal>

      <form onSubmit={enviar} noValidate className="flex w-full flex-col gap-5">
        <div className="text-left">
          <h1 className="font-titulo text-titulo-mayor font-bold tracking-[-0.02em] text-texto-principal">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-cuerpo text-texto-secundario">Nombre, correo y contraseña. Nada más.</p>
        </div>
        <Campo
          id="reg-nombre"
          name="full_name"
          etiqueta="Cómo te llamas"
          placeholder="Diego Morales"
          ayuda="Así te saludamos en la aplicación"
          autoComplete="name"
          valor={datos.full_name}
          onCambio={cambiar('full_name')}
          error={errores.full_name}
        />
        <Campo
          id="reg-correo"
          name="email"
          etiqueta="Tu correo"
          tipo="email"
          placeholder="nombre@correo.com"
          ayuda="Con este entras a tu cuenta"
          autoComplete="email"
          valor={datos.email}
          onCambio={cambiar('email')}
          error={errores.email}
        />
        <Campo
          id="reg-clave"
          name="password"
          etiqueta="Una contraseña"
          tipo="password"
          placeholder="Mínimo 8 caracteres"
          /*
            La lista aparece cuando el usuario empieza a escribir, no antes: con
            el campo vacío no hay nada que validar y tres renglones grises son
            ruido. `tocado` la trae de vuelta si se intentó enviar sin escribir
            nada — ahí el usuario sí necesita saber por qué no avanza.
          */
          ayuda={
            datos.password || tocado ? (
              <RequisitosClave clave={datos.password} marcarFallos={tocado} />
            ) : null
          }
          autoComplete="new-password"
          valor={datos.password}
          onCambio={cambiar('password')}
          error={errores.password}
        />

        {/*
          Aviso de formulario completo: lo que no cuelga de un campo concreto
          —correo ya registrado, cuenta desactivada, red caída—. `role="alert"`
          para que un lector de pantalla lo anuncie sin tener que ir a buscarlo.
        */}
        {aviso && (
          <p
            role="alert"
            className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto"
          >
            {aviso}
          </p>
        )}

        <Boton
          type="submit"
          disabled={enviando}
          className="w-full disabled:pointer-events-none disabled:opacity-60"
        >
          {enviando ? 'Creando tu cuenta…' : 'Crear cuenta'}
          </Boton>
      </form>
    </>
  )
}
