import { useState } from 'react'
import { Revelar, useAcuse } from '@/movimiento'
import { BotonIr } from '@/components/ui/BotonIr'

export function SeccionRegistro() {
  const [correo, setCorreo] = useState('')

  /*
    El correo viaja con la navegación, no en la URL. Podría ir como
    `?correo=...` y sobrevivir a un F5, pero entonces quedaría escrito en el
    historial del navegador y en los registros de cualquier proxy por el que
    pase. El `state` de react-router lo lleva en memoria: se pierde al
    recargar, que para un campo que el usuario acaba de escribir es un precio
    barato.

    Se manda sin recortar ni validar: quien decide si un correo sirve es el
    formulario de registro, y detrás de él el backend. Aquí solo se transporta.
  */
  const { yendo, ir } = useAcuse('/registro', { correo })

  return (
    <section id="registro" className="seccion py-24">
      <Revelar className="contenedor">
        <div className="vidrio-oscuro flex flex-col items-center rounded-maximo px-6 py-16 text-center md:px-20">
          <h2 className="max-w-[640px] font-titulo text-rotulo font-extrabold leading-tight text-texto-inverso md:text-cifra-mayor">
            Toma el control de tu dinero
          </h2>
          <p className="mt-4 max-w-[560px] text-cuerpo-amplio text-texto-inverso/80">
            Crea tu cuenta gratis y registra tu primer movimiento hoy mismo.
          </p>

          {/*
            El envío del formulario es el único camino: el botón es `submit` y
            no lleva `onClick` propio. Así pulsarlo y darle a Enter en el campo
            hacen exactamente lo mismo, en vez de ser dos rutas parecidas que
            algún día se separan.
          */}
          <form
            className="mt-8 flex w-full max-w-[520px] flex-col items-center gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              ir()
            }}
          >
            <div className="w-full flex-1 text-left">
              <label htmlFor="correo" className="sr-only">
                Tu correo
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="h-[52px] w-full rounded-grande bg-fondo-superficie px-4 text-cuerpo-medio text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 focus:ring-lavanda-400"
              />
            </div>
            <BotonIr type="submit" yendo={yendo} className="w-full sm:w-auto">
              Crear cuenta gratis
            </BotonIr>
          </form>

          <p className="mt-4 text-nota text-texto-inverso/60">
            Sin tarjeta de crédito. Cancelas cuando quieras.
          </p>
        </div>
      </Revelar>
    </section>
  )
}
