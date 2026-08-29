import { useState } from 'react'
import { Pantalla } from '@/celular/Pantalla'
import { BotonIr } from '@/components/ui/BotonIr'
import { useAcuse } from '@/movimiento'

/**
 * La conversión. En escritorio es una tarjeta oscura con el formulario en
 * línea; aquí el formulario va apilado, con el campo a ancho completo y el
 * botón debajo — en un teléfono nada de esto cabe en una fila.
 *
 * El correo viaja hasta `/registro` igual que en la landing de escritorio, por
 * el `state` de la navegación: quien lo escribió aquí no tiene que volver a
 * escribirlo en el formulario. Antes el campo no estaba controlado y lo que
 * se tecleaba se perdía al cambiar de pantalla.
 */
export function Empezar() {
  const [correo, setCorreo] = useState('')
  const { yendo, ir } = useAcuse('/registro', { correo })

  return (
    <Pantalla
      titulo="Toma el control de tu dinero"
      entradilla="Crea tu cuenta gratis y registra tu primer movimiento hoy mismo."
      centrada
    >
      {/*
        El botón es `submit` y no lleva `onClick`: así tocarlo y darle a
        "Intro" desde el teclado del teléfono hacen lo mismo. En un móvil ese
        botón azul del teclado es la salida natural del campo, y antes no
        hacía nada.
      */}
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          ir()
        }}
      >
        <label htmlFor="correo" className="sr-only">
          Tu correo
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="go"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="h-[52px] w-full rounded-grande bg-fondo-superficie px-4 text-cuerpo-medio text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 focus:ring-lavanda-400"
        />
        <BotonIr type="submit" yendo={yendo} variante="destacado" className="w-full">
          Crear cuenta gratis
        </BotonIr>
        <p className="text-nota text-texto-tenue">Gratis · sin tarjeta de crédito</p>
      </form>
    </Pantalla>
  )
}
