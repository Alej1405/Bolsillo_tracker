import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'

/**
 * Campo de texto del formulario: etiqueta arriba y, debajo, la ayuda — o el
 * error, que ocupa su lugar en vez de sumarse. Dos líneas de texto bajo un
 * input compiten entre sí y la que importa es la del error.
 *
 * `valor` y `onCambio` son opcionales: sin ellos el input queda no controlado,
 * que es como sigue funcionando el formulario de login.
 */
export function Campo({
  id,
  etiqueta,
  tipo = 'text',
  placeholder,
  ayuda,
  name,
  valor,
  onCambio,
  error,
  autoComplete,
}: {
  id: string
  etiqueta: string
  tipo?: string
  placeholder: string
  /** Texto de apoyo, o un bloque —la lista de requisitos de la contraseña. */
  ayuda: React.ReactNode
  name?: string
  valor?: string
  onCambio?: (valor: string) => void
  error?: string
  autoComplete?: string
}) {
  /*
    Ver la contraseña. El estado vive en el campo y no en el formulario: es
    cosa de este input y de nadie más, y así los dos formularios lo tienen sin
    pasarse nada.

    Arranca siempre oculta y no se recuerda entre visitas — quien la destapa lo
    hace para comprobar lo que escribió, no para dejarla a la vista.
  */
  const [verClave, setVerClave] = useState(false)
  const esClave = tipo === 'password'
  const tipoReal = esClave && verClave ? 'text' : tipo

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-nota font-medium text-texto-principal">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={tipoReal}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={valor}
          onChange={onCambio && ((e) => onCambio(e.target.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-nota`}
          className={`h-11 w-full rounded-medio border bg-fondo-superficie pl-4 text-cuerpo-medio text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 ${
            esClave ? 'pr-12' : 'pr-4'
          } ${
            error
              ? 'border-gasto focus:border-gasto focus:ring-gasto/30'
              : 'border-borde-normal focus:border-lavanda-500 focus:ring-lavanda-300'
          }`}
        />
        {esClave && (
          /*
            `type="button"` es obligatorio: dentro de un <form>, un botón sin
            tipo es submit por defecto, y destapar la clave enviaría el
            formulario. `tabIndex={-1}` lo saca del tabulador — quien navega
            con teclado quiere pasar del campo al siguiente, no tropezar con
            un ojo; el lector de pantalla lo alcanza igual.
          */
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
            aria-pressed={verClave}
            className="absolute right-0 top-0 grid h-11 w-12 place-items-center rounded-r-medio text-texto-tenue transition-colors hover:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900"
          >
            {verClave ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {/*
        Sin ayuda ni error no se pinta nada: un span vacío sigue sumando el
        hueco del `gap` del contenedor y deja un espacio bajo el campo que no
        significa nada.
      */}
      {(error ?? ayuda) != null && (
        <span
          id={`${id}-nota`}
          className={`text-nota ${error ? 'text-gasto' : 'text-texto-tenue'}`}
        >
          {error ?? ayuda}
        </span>
      )}
    </div>
  )
}
