import { Pantalla } from '@/celular/Pantalla'
import { Boton } from '@/components/ui/Boton'

/**
 * La conversión. En escritorio es una tarjeta oscura con el formulario en
 * línea; aquí el formulario va apilado, con el campo a ancho completo y el
 * botón debajo — en un teléfono nada de esto cabe en una fila.
 */
export function Empezar() {
  return (
    <Pantalla
      titulo="Toma el control de tu dinero"
      entradilla="Crea tu cuenta gratis y registra tu primer movimiento hoy mismo."
      centrada
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <label htmlFor="correo" className="sr-only">
          Tu correo
        </label>
        <input
          id="correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          className="h-[52px] w-full rounded-[var(--radius-grande)] bg-fondo-superficie px-4 text-cuerpo text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 focus:ring-lavanda-400"
        />
        <Boton to="/registro" variante="destacado" className="w-full">
          Crear cuenta gratis
        </Boton>
        <p className="text-nota text-texto-tenue">Gratis · sin tarjeta de crédito</p>
      </form>
    </Pantalla>
  )
}
